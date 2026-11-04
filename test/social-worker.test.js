// Tests for the Friends of WDAC social worker: admin-login sign-in via the ADMIN_API binding,
// browser CORS, and the draft -> approve -> publish flow. Run: npm test (from site/) or
//   node --disable-warning=ExperimentalWarning --test test/social-worker.test.js
// The D1 stand-in is node:sqlite; real D1 and workerd still need a live check after deploy.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import worker from "../workers/buffer-social/index.js";
import { createD1, createR2 } from "./d1-shim.js";

const migration = (name) => readFileSync(new URL(`../workers/buffer-social/migrations/${name}`, import.meta.url), "utf8");
const MIGRATION_1 = migration("0001_buffer_social_operations.sql");
const MIGRATION_2 = migration("0002_admin_login_no_auth_fk.sql");
// The production D1 (friendsofwdac-admin) already holds the magic-link auth tables, then migration 0001.
const AUTH_TABLES = "CREATE TABLE auth_users (id TEXT PRIMARY KEY, email TEXT, role TEXT); CREATE TABLE auth_sessions (id TEXT PRIMARY KEY, user_id TEXT);";
const ORIGIN = "https://friendsofwdac.org";
const BASE = "https://api.friendsofwdac.org/admin/social";
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);

// Stand-in for the friendsofwdac-subscribe Worker's GET /admin/whoami.
function makeAdminApi(sessions = { "good-token": "Admin@FriendsOfWDAC.org" }) {
  const seen = [];
  return {
    seen,
    fetch: async (url, init) => {
      seen.push({ url: String(url), headers: init.headers });
      const email = sessions[String(init.headers.Authorization).replace("Bearer ", "")];
      if (!email || !init.headers.Origin) return Response.json({ error: "Unauthorized" }, { status: 401 });
      return Response.json({ ok: true, email, expiresAt: new Date(Date.now() + 3_600_000).toISOString() });
    },
  };
}

function setup(overrides = {}) {
  const DB = createD1(AUTH_TABLES, MIGRATION_1, MIGRATION_2);
  const R2 = createR2();
  const ADMIN_API = makeAdminApi();
  const env = {
    DB,
    MEDIA_BUCKET: R2,
    ADMIN_API,
    ALLOWED_ORIGINS: ORIGIN + ",https://www.friendsofwdac.org",
    BUFFER_API_KEY: "test-buffer-key",
    BUFFER_ORGANIZATION_ID: "org-test",
    PUBLIC_MEDIA_BASE_URL: "https://media.friendsofwdac.org",
    MAX_MEDIA_BYTES: "1048576",
    BUFFER_TIMEOUT_MS: "200",
    ...overrides,
  };
  DB.sqlite.prepare("INSERT INTO buffer_social_channels (id, name, service) VALUES ('ch-fb', 'Facebook page', 'facebook'), ('ch-ig', 'Instagram account', 'instagram')").run();
  return { env, DB, R2, ADMIN_API };
}

async function call(env, method, path, { token = "good-token", origin = ORIGIN, json, bytes, type, headers = {} } = {}) {
  const requestHeaders = { ...(token ? { Authorization: "Bearer " + token } : {}), ...(origin ? { Origin: origin } : {}), ...headers };
  let body;
  if (json !== undefined) {
    body = JSON.stringify(json);
    requestHeaders["Content-Type"] = "application/json";
  }
  if (bytes) {
    body = bytes;
    requestHeaders["Content-Type"] = type;
    requestHeaders["Content-Length"] = String(bytes.byteLength);
  }
  const response = await worker.fetch(new Request(BASE + path, { method, headers: requestHeaders, body }), env);
  const text = await response.text();
  let data = text;
  try {
    data = JSON.parse(text);
  } catch {}
  return { status: response.status, headers: response.headers, body: data };
}

// Replaces global fetch with a Buffer stand-in for the length of one test.
function mockBuffer(handler) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const payload = JSON.parse(init.body);
    calls.push({ url: String(url), headers: init.headers, payload });
    return handler(payload, calls.length);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}
const bufferCreated = () => Response.json({ data: { createPost: { post: { id: "buffer-" + crypto.randomUUID(), dueAt: null, status: "buffer" } } } });
const bufferRejected = message => Response.json({ data: { createPost: { message } } });

async function draft(env, body = {}) {
  const created = await call(env, "POST", "/posts", { json: { body: "Hello Cottage Grove", channelIds: ["ch-fb"], ...body } });
  assert.equal(created.status, 201, JSON.stringify(created.body));
  return created.body.id;
}

test("health needs no sign-in and lists what is missing", async () => {
  const { env } = setup({ BUFFER_API_KEY: undefined, BUFFER_ORGANIZATION_ID: "replace-with-buffer-organization-id", ADMIN_API: undefined });
  const result = await call(env, "GET", "/health", { token: null });
  assert.equal(result.status, 503);
  assert.deepEqual(result.body.missing.sort(), ["ADMIN_API", "BUFFER_API_KEY", "BUFFER_ORGANIZATION_ID"]);
  const ready = await call(setup().env, "GET", "/health", { token: null });
  assert.equal(ready.status, 200);
  assert.equal(ready.body.ok, true);
});

test("other paths are not found", async () => {
  const { env } = setup();
  const response = await worker.fetch(new Request("https://api.friendsofwdac.org/admin/dashboard"), env);
  assert.equal(response.status, 404);
});

test("CORS: preflight allowed for the site, refused for others", async () => {
  const { env } = setup();
  const ok = await call(env, "OPTIONS", "/posts", { token: null, headers: { "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "authorization,content-type" } });
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.match(ok.headers.get("Access-Control-Allow-Headers"), /Authorization/);
  const bad = await call(env, "OPTIONS", "/posts", { token: null, origin: "https://evil.example" });
  assert.equal(bad.status, 403);
  assert.equal(bad.headers.get("Access-Control-Allow-Origin"), null);
});

test("CORS headers are on success and error responses", async () => {
  const { env } = setup();
  const good = await call(env, "GET", "/channels");
  assert.equal(good.status, 200);
  assert.equal(good.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  const denied = await call(env, "GET", "/channels", { token: "nope" });
  assert.equal(denied.status, 401);
  assert.equal(denied.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("sign-in: no token, bad token, and a down admin API are all refused", async () => {
  const { env, ADMIN_API } = setup();
  assert.equal((await call(env, "GET", "/channels", { token: null })).status, 401);
  assert.equal((await call(env, "GET", "/channels", { token: "expired" })).status, 401);
  env.ADMIN_API = { fetch: async () => { throw new Error("binding down"); } };
  const originalError = console.error;
  console.error = () => {};
  try {
    assert.equal((await call(env, "GET", "/channels")).status, 502);
  } finally {
    console.error = originalError;
  }
  assert.equal(ADMIN_API.seen.length, 1, "a request with no token is refused without asking the admin API");
});

test("sign-in: the token and the browser's Origin are forwarded to the admin API", async () => {
  const { env, ADMIN_API } = setup();
  await call(env, "GET", "/channels", { origin: "https://www.friendsofwdac.org" });
  const [seen] = ADMIN_API.seen;
  assert.equal(seen.url, "https://admin-api.internal/admin/whoami");
  assert.equal(seen.headers.Authorization, "Bearer good-token");
  assert.equal(seen.headers.Origin, "https://www.friendsofwdac.org");
});

test("a disallowed Origin is refused even with a valid token", async () => {
  const { env } = setup();
  const result = await call(env, "POST", "/posts", { origin: "https://evil.example", json: { body: "x", channelIds: ["ch-fb"] } });
  assert.equal(result.status, 403);
});

test("syncing channels stores them from Buffer", async () => {
  const { env, DB } = setup();
  const buffer = mockBuffer(() => Response.json({ data: { channels: [{ id: "ch-new", name: "Pool Instagram", service: "instagram" }, { id: "", name: "ignored" }] } }));
  try {
    const synced = await call(env, "POST", "/channels/sync");
    assert.equal(synced.status, 200);
    assert.deepEqual(synced.body.channels, [{ id: "ch-new", name: "Pool Instagram", service: "instagram" }]);
    assert.equal(buffer.calls[0].headers.Authorization, "Bearer test-buffer-key");
    assert.equal(buffer.calls[0].payload.variables.organizationId, "org-test");
  } finally {
    buffer.restore();
  }
  const listed = await call(env, "GET", "/channels");
  assert.ok(listed.body.channels.some(channel => channel.id === "ch-new"));
  assert.equal(DB.sqlite.prepare("SELECT COUNT(*) AS n FROM buffer_social_channels").get().n, 3);
});

test("creating a post validates its input", async () => {
  const { env } = setup();
  const bad = [
    [{ body: "", channelIds: ["ch-fb"] }, /body and at least one channel/],
    [{ body: "Hi", channelIds: [] }, /body and at least one channel/],
    [{ body: "Hi", channelIds: ["not-synced"] }, /not synced/],
    [{ body: "Hi", channelIds: ["ch-fb"], scheduledFor: "2020-01-01T00:00:00Z" }, /future/],
    [{ body: "Hi", channelIds: ["ch-fb"], scheduledFor: "soon" }, /ISO 8601/],
    [{ body: "Hi", channelIds: ["ch-fb"], mediaAssetId: "missing" }, /does not match an uploaded file/],
  ];
  for (const [json, message] of bad) {
    const result = await call(env, "POST", "/posts", { json });
    assert.equal(result.status, 400, JSON.stringify(json));
    assert.match(result.body.error, message);
  }
});

test("draft -> approve -> publish queues the post in Buffer and records the admin's email", async () => {
  const { env, DB } = setup();
  const postId = await draft(env, { channelIds: ["ch-fb", "ch-ig"], title: "Open swim" });
  assert.equal(DB.sqlite.prepare("SELECT created_by FROM buffer_social_posts WHERE id = ?").get(postId).created_by, "admin@friendsofwdac.org");

  const early = await call(env, "POST", `/posts/${postId}/publish`);
  assert.equal(early.status, 409, "publishing before approval must be refused");

  assert.equal((await call(env, "POST", `/posts/${postId}/approve`)).status, 200);
  const buffer = mockBuffer(bufferCreated);
  try {
    const published = await call(env, "POST", `/posts/${postId}/publish`);
    assert.equal(published.status, 200);
    assert.equal(published.body.status, "queued");
    assert.equal(published.body.results.length, 2);
    assert.ok(published.body.results.every(result => result.ok));
    const sent = buffer.calls.map(item => item.payload.variables.input);
    assert.deepEqual(sent.map(input => input.channelId).sort(), ["ch-fb", "ch-ig"]);
    assert.ok(sent.every(input => input.text === "Hello Cottage Grove"));
    assert.ok(sent.find(input => input.channelId === "ch-fb").metadata.facebook);
    assert.ok(sent.find(input => input.channelId === "ch-ig").metadata.instagram);

    const again = await call(env, "POST", `/posts/${postId}/publish`);
    assert.equal(again.status, 409, "an already queued post must not be sent twice");
    assert.equal(buffer.calls.length, 2);
  } finally {
    buffer.restore();
  }
  const detail = await call(env, "GET", `/posts/${postId}`);
  assert.equal(detail.body.post.status, "queued");
  assert.equal(detail.body.targets.length, 2);
  assert.ok(detail.body.targets.every(target => target.status === "queued" && target.bufferPostId));
});

test("a Buffer rejection marks the post failed, and a retry only resends the failed channel", async () => {
  const { env } = setup();
  const postId = await draft(env, { channelIds: ["ch-fb", "ch-ig"] });
  await call(env, "POST", `/posts/${postId}/approve`);
  let buffer = mockBuffer(payload => payload.variables.input.channelId === "ch-ig" ? bufferRejected("Instagram needs an image") : bufferCreated());
  try {
    const first = await call(env, "POST", `/posts/${postId}/publish`);
    assert.equal(first.body.status, "failed");
    assert.equal(first.body.results.filter(result => result.ok).length, 1);
  } finally {
    buffer.restore();
  }
  const detail = await call(env, "GET", `/posts/${postId}`);
  assert.match(detail.body.targets.find(target => target.channelId === "ch-ig").errorMessage, /Instagram needs an image/);

  buffer = mockBuffer(bufferCreated);
  try {
    const retry = await call(env, "POST", `/posts/${postId}/publish`);
    assert.equal(retry.body.status, "queued");
    assert.equal(buffer.calls.length, 1, "only the failed channel is resent");
    assert.equal(buffer.calls[0].payload.variables.input.channelId, "ch-ig");
  } finally {
    buffer.restore();
  }
});

test("a scheduled post sends its time to Buffer", async () => {
  const { env } = setup();
  const when = new Date(Date.now() + 86_400_000).toISOString();
  const postId = await draft(env, { scheduledFor: when });
  await call(env, "POST", `/posts/${postId}/approve`);
  const buffer = mockBuffer(bufferCreated);
  try {
    await call(env, "POST", `/posts/${postId}/publish`);
    const input = buffer.calls[0].payload.variables.input;
    assert.equal(input.mode, "customScheduled");
    assert.equal(input.dueAt, when);
  } finally {
    buffer.restore();
  }
});

test("uploads: valid image is stored and public, bad ones are refused", async () => {
  const { env, R2 } = setup();
  const ok = await call(env, "POST", "/media/upload", { bytes: PNG, type: "image/png" });
  assert.equal(ok.status, 201);
  assert.match(ok.body.url, /^https:\/\/media\.friendsofwdac\.org\/social\/[0-9a-f-]+\.png$/);
  assert.equal(R2.objects.size, 1);
  const listed = await call(env, "GET", "/media");
  assert.equal(listed.body.media[0].url, ok.body.url);

  assert.equal((await call(env, "POST", "/media/upload", { bytes: new Uint8Array([1, 2, 3, 4]), type: "image/png" })).status, 415, "bytes must match the claimed type");
  assert.equal((await call(env, "POST", "/media/upload", { bytes: PNG, type: "application/pdf" })).status, 415);
  const big = new Uint8Array(2_000_000);
  big.set(PNG);
  assert.equal((await call(env, "POST", "/media/upload", { bytes: big, type: "image/png" })).status, 413);
  assert.equal(R2.objects.size, 1, "refused uploads store nothing");
});

test("a post can carry an uploaded image to Buffer", async () => {
  const { env } = setup();
  const upload = await call(env, "POST", "/media/upload", { bytes: PNG, type: "image/png" });
  const postId = await draft(env, { mediaAssetId: upload.body.id });
  await call(env, "POST", `/posts/${postId}/approve`);
  const buffer = mockBuffer(bufferCreated);
  try {
    await call(env, "POST", `/posts/${postId}/publish`);
    assert.deepEqual(buffer.calls[0].payload.variables.input.assets, [{ image: { url: upload.body.url } }]);
  } finally {
    buffer.restore();
  }
});

// ---- Migrations ----------------------------------------------------------------------------
const insertPost = (DB, createdBy) => DB.sqlite
  .prepare("INSERT INTO buffer_social_posts (id, body, created_by) VALUES (?, 'hi', ?)")
  .run(crypto.randomUUID(), createdBy);

test("migration 0001 alone cannot store an admin email (why 0002 exists)", () => {
  const DB = createD1(AUTH_TABLES, MIGRATION_1);
  assert.throws(() => insertPost(DB, "admin@friendsofwdac.org"), /FOREIGN KEY/i);
});

test("migration 0002 lets the admin email be stored, on the existing database and a fresh one", () => {
  for (const scripts of [[AUTH_TABLES, MIGRATION_1, MIGRATION_2], [MIGRATION_1, MIGRATION_2]]) {
    const DB = createD1(...scripts);
    assert.doesNotThrow(() => insertPost(DB, "admin@friendsofwdac.org"));
  }
});

test("migration 0002 keeps synced channels", () => {
  const DB = createD1(AUTH_TABLES, MIGRATION_1);
  DB.sqlite.prepare("INSERT INTO buffer_social_channels (id, name, service) VALUES ('ch-keep', 'Kept', 'facebook')").run();
  DB.sqlite.exec(MIGRATION_2);
  assert.equal(DB.sqlite.prepare("SELECT name FROM buffer_social_channels WHERE id = 'ch-keep'").get().name, "Kept");
});

test("migration 0002 refuses to run, and changes nothing, if social posts already exist", () => {
  const DB = createD1(AUTH_TABLES, MIGRATION_1);
  insertPost(DB, null);
  assert.throws(() => DB.sqlite.exec(MIGRATION_2), /CHECK constraint/i);
  assert.equal(DB.sqlite.prepare("SELECT COUNT(*) AS n FROM buffer_social_posts").get().n, 1);
});
