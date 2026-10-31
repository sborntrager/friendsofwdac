const encoder = new TextEncoder();
const BUFFER_API_URL = "https://api.buffer.com";
const REQUIRED_VARS = ["APP_ORIGIN", "BUFFER_API_KEY", "BUFFER_ORGANIZATION_ID", "PUBLIC_MEDIA_BASE_URL"];
const URL_VARS = ["APP_ORIGIN", "PUBLIC_MEDIA_BASE_URL"];
const POST_STATUSES = ["draft", "approved", "publishing", "queued", "failed"];
const MAX_CHANNELS_PER_POST = 25;
const STALE_PUBLISH_MINUTES = 10;
const INTERRUPTED_MESSAGE = "A previous publish was interrupted. Check Buffer for this post before publishing again.";
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const POST_ROUTE = new RegExp("^/api/admin/social-posts/(" + UUID + ")(?:/(approve|publish))?$");
const MEDIA_TYPES = {
  "image/jpeg": { extension: "jpg", matches: bytes => startsWith(bytes, [0xff, 0xd8, 0xff]) },
  "image/png": { extension: "png", matches: bytes => startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  "image/gif": { extension: "gif", matches: bytes => startsWith(bytes, ascii("GIF87a")) || startsWith(bytes, ascii("GIF89a")) },
  "image/webp": { extension: "webp", matches: bytes => startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8) },
  "video/mp4": { extension: "mp4", matches: bytes => startsWith(bytes, ascii("ftyp"), 4) },
  "video/quicktime": { extension: "mov", matches: bytes => startsWith(bytes, ascii("ftyp"), 4) },
};
// Buffer rejects posts to these services unless channel-specific metadata is present.
const SERVICE_METADATA = {
  facebook: { facebook: { type: "post", annotations: [] } },
  instagram: { instagram: { type: "post", shouldShareToFeed: true } },
};
const CREATE_POST_MUTATION = "mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { ... on PostActionSuccess { post { id dueAt status } } ... on MutationError { message } } }";

const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
});
const id = () => crypto.randomUUID();
class HttpError extends Error {
  constructor(status, message, { headers, details } = {}) {
    super(message);
    this.status = status;
    this.headers = headers;
    this.details = details;
  }
}
function startsWith(bytes, signature, offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}
function ascii(text) {
  return Array.from(text, char => char.charCodeAt(0));
}
const positiveNumber = (value, fallback) => Number(value) > 0 ? Number(value) : fallback;
const isSet = value => typeof value === "string" && value.trim() !== "" && !value.startsWith("replace-with-");
function isHttpUrl(value) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
function missingConfig(env) {
  const missing = [];
  if (!env.DB || typeof env.DB.prepare !== "function") missing.push("DB");
  if (!env.MEDIA_BUCKET || typeof env.MEDIA_BUCKET.put !== "function") missing.push("MEDIA_BUCKET");
  for (const name of REQUIRED_VARS) if (!isSet(env[name])) missing.push(name);
  for (const name of URL_VARS) if (isSet(env[name]) && !isHttpUrl(env[name])) missing.push(name + " (not an http(s) URL)");
  return missing;
}
function requireConfig(env) {
  const missing = missingConfig(env);
  if (missing.length) throw new HttpError(503, "Buffer social module is not configured: missing " + missing.join(", "));
}
function assertSameOrigin(request, env) {
  if (request.method === "GET" || request.method === "HEAD") return;
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(env.APP_ORIGIN).origin) throw new HttpError(403, "Origin not allowed");
  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin" && site !== "none") throw new HttpError(403, "Cross-site request refused");
}
async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}
function token(request) {
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const prefix = "auth_session=";
  return (request.headers.get("Cookie") || "").split("; ").find(value => value.startsWith(prefix))?.slice(prefix.length) || null;
}
async function user(request, env, role = "editor") {
  const raw = token(request);
  if (!raw) throw new HttpError(401, "Sign in required");
  // expires_at is ISO 8601 (written by cloudflare-magic-link-auth); compare as time, not text.
  const person = await env.DB.prepare("SELECT u.id, u.role FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.revoked_at IS NULL AND julianday(s.expires_at) > julianday('now')")
    .bind(await sha256(raw)).first();
  if (!person) throw new HttpError(401, "Session expired or invalid");
  const allowed = role === "admin" ? ["admin"] : ["editor", "admin"];
  if (!allowed.includes(person.role)) throw new HttpError(403, "Insufficient access");
  return person;
}
function limitParam(request) {
  const value = Number(new URL(request.url).searchParams.get("limit") || 50);
  return Number.isInteger(value) && value >= 1 && value <= 100 ? value : 50;
}
function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
async function buffer(env, query, variables) {
  let response;
  let text;
  try {
    response = await fetch(BUFFER_API_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + env.BUFFER_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(positiveNumber(env.BUFFER_TIMEOUT_MS, 10_000)),
    });
    text = await response.text();
  } catch (error) {
    throw new HttpError(504, error?.name === "TimeoutError" ? "Buffer did not respond in time" : "Buffer could not be reached");
  }
  const result = parseJson(text);
  if (response.status === 429 || result?.errors?.some(error => error?.extensions?.code === "RATE_LIMIT_EXCEEDED")) {
    const retryAfter = response.headers.get("Retry-After");
    throw new HttpError(503, "Buffer rate limit reached; try again later", {
      headers: retryAfter ? { "Retry-After": retryAfter } : undefined,
      details: { rateLimited: true },
    });
  }
  if (!response.ok || !result || result.errors?.length) throw new HttpError(502, result?.errors?.[0]?.message || "Buffer request failed with HTTP " + response.status);
  return result.data;
}
async function syncChannels(request, env) {
  await user(request, env, "admin");
  const data = await buffer(env, "query Channels($organizationId: OrganizationId!) { channels(input: { organizationId: $organizationId }) { id name service } }", {
    organizationId: env.BUFFER_ORGANIZATION_ID,
  });
  const channels = (Array.isArray(data?.channels) ? data.channels : []).filter(channel => typeof channel?.id === "string" && channel.id);
  if (channels.length) await env.DB.batch(channels.map(channel => env.DB.prepare("INSERT INTO buffer_social_channels (id, name, service, raw_json, synced_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET name = excluded.name, service = excluded.service, raw_json = excluded.raw_json, synced_at = CURRENT_TIMESTAMP")
    .bind(channel.id, String(channel.name || channel.id), typeof channel.service === "string" ? channel.service : null, JSON.stringify(channel))));
  return json({ channels: channels.map(channel => ({ id: channel.id, name: channel.name, service: channel.service ?? null })) });
}
async function listChannels(request, env) {
  await user(request, env);
  const rows = await env.DB.prepare("SELECT id, name, service, synced_at AS syncedAt FROM buffer_social_channels ORDER BY name").all();
  return json({ channels: rows.results });
}
async function uploadMedia(request, env) {
  const person = await user(request, env);
  const type = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
  const media = MEDIA_TYPES[type];
  if (!media) throw new HttpError(415, "Upload a JPEG, PNG, GIF, WebP, MP4 or QuickTime file");
  const declared = request.headers.get("Content-Length");
  if (declared === null) throw new HttpError(411, "Content-Length is required");
  const length = Number(declared);
  const limit = positiveNumber(env.MAX_MEDIA_BYTES, 10_485_760);
  if (!Number.isInteger(length) || length <= 0) throw new HttpError(400, "Upload body is empty");
  if (length > limit) throw new HttpError(413, "Media is larger than " + limit + " bytes");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.byteLength !== length) throw new HttpError(400, "Upload body does not match Content-Length");
  if (!media.matches(bytes)) throw new HttpError(415, "File content is not a valid " + type + " file");
  const mediaId = id();
  const key = "social/" + mediaId + "." + media.extension;
  const url = new URL(key, env.PUBLIC_MEDIA_BASE_URL.replace(/\/?$/, "/")).href;
  await env.MEDIA_BUCKET.put(key, bytes, { httpMetadata: { contentType: type } });
  try {
    await env.DB.prepare("INSERT INTO buffer_social_media (id, r2_key, public_url, content_type, size_bytes, created_by) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(mediaId, key, url, type, bytes.byteLength, person.id).run();
  } catch (error) {
    await env.MEDIA_BUCKET.delete(key).catch(cleanupError => console.error("Could not remove unrecorded R2 object", key, cleanupError));
    throw error;
  }
  return json({ id: mediaId, url, contentType: type, sizeBytes: bytes.byteLength }, 201);
}
async function listMedia(request, env) {
  await user(request, env);
  const rows = await env.DB.prepare("SELECT id, public_url AS url, content_type AS contentType, size_bytes AS sizeBytes, created_by AS createdBy, created_at AS createdAt FROM buffer_social_media ORDER BY created_at DESC, id LIMIT ?")
    .bind(limitParam(request)).all();
  return json({ media: rows.results });
}
function parseSchedule(value) {
  if (value === undefined || value === null || value === "") return null;
  const time = typeof value === "string" ? Date.parse(value) : NaN;
  if (Number.isNaN(time)) throw new HttpError(400, "scheduledFor must be an ISO 8601 date-time");
  if (time <= Date.now()) throw new HttpError(400, "scheduledFor must be in the future");
  return new Date(time).toISOString();
}
async function createPost(request, env) {
  const person = await user(request, env);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Send a JSON object");
  const text = String(body.body || "").trim().slice(0, 10_000);
  const title = String(body.title || "").trim().slice(0, 200) || null;
  if (!Array.isArray(body.channelIds) || !body.channelIds.every(value => typeof value === "string" && value && value.length <= 200)) {
    throw new HttpError(400, "channelIds must be an array of Buffer channel IDs");
  }
  const channelIds = [...new Set(body.channelIds)];
  if (!text || !channelIds.length) throw new HttpError(400, "Post body and at least one channel are required");
  if (channelIds.length > MAX_CHANNELS_PER_POST) throw new HttpError(400, "A post can target at most " + MAX_CHANNELS_PER_POST + " channels");
  const scheduledFor = parseSchedule(body.scheduledFor);
  const mediaId = body.mediaAssetId === undefined || body.mediaAssetId === null || body.mediaAssetId === "" ? null : body.mediaAssetId;
  if (mediaId !== null) {
    const found = typeof mediaId === "string" && await env.DB.prepare("SELECT 1 AS found FROM buffer_social_media WHERE id = ?").bind(mediaId).first("found");
    if (!found) throw new HttpError(400, "mediaAssetId does not match an uploaded file");
  }
  const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM buffer_social_channels WHERE id IN (" + channelIds.map(() => "?").join(",") + ")").bind(...channelIds).first("count");
  if (Number(count) !== channelIds.length) throw new HttpError(400, "One or more channels are not synced");
  const postId = id();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO buffer_social_posts (id, title, body, media_id, scheduled_for, created_by) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(postId, title, text, mediaId, scheduledFor, person.id),
    ...channelIds.map(channelId => env.DB.prepare("INSERT INTO buffer_social_post_targets (id, post_id, channel_id) VALUES (?, ?, ?)").bind(id(), postId, channelId)),
  ]);
  return json({ id: postId, status: "draft" }, 201);
}
const POST_COLUMNS = "p.id, p.title, p.body, p.status, p.scheduled_for AS scheduledFor, p.media_id AS mediaAssetId, m.public_url AS mediaUrl, p.created_by AS createdBy, p.created_at AS createdAt, p.updated_at AS updatedAt";
async function listPosts(request, env) {
  await user(request, env);
  const status = new URL(request.url).searchParams.get("status") || null;
  if (status && !POST_STATUSES.includes(status)) throw new HttpError(400, "status must be one of " + POST_STATUSES.join(", "));
  const rows = await env.DB.prepare("SELECT " + POST_COLUMNS + ", (SELECT COUNT(*) FROM buffer_social_post_targets t WHERE t.post_id = p.id) AS channelCount, (SELECT COUNT(*) FROM buffer_social_post_targets t WHERE t.post_id = p.id AND t.status = 'queued') AS queuedCount FROM buffer_social_posts p LEFT JOIN buffer_social_media m ON m.id = p.media_id WHERE (? IS NULL OR p.status = ?) ORDER BY p.created_at DESC, p.id LIMIT ?")
    .bind(status, status, limitParam(request)).all();
  return json({ posts: rows.results });
}
async function getPost(request, env, postId) {
  await user(request, env);
  const post = await env.DB.prepare("SELECT " + POST_COLUMNS + " FROM buffer_social_posts p LEFT JOIN buffer_social_media m ON m.id = p.media_id WHERE p.id = ?").bind(postId).first();
  if (!post) throw new HttpError(404, "Post not found");
  const targets = await env.DB.prepare("SELECT t.channel_id AS channelId, c.name AS channelName, c.service, t.status, t.buffer_post_id AS bufferPostId, t.error_message AS errorMessage, t.updated_at AS updatedAt FROM buffer_social_post_targets t JOIN buffer_social_channels c ON c.id = t.channel_id WHERE t.post_id = ? ORDER BY c.name")
    .bind(postId).all();
  const logs = await env.DB.prepare("SELECT channel_id AS channelId, status, buffer_response_json AS response, created_at AS createdAt FROM buffer_social_publish_logs WHERE post_id = ? ORDER BY created_at DESC, id LIMIT 50")
    .bind(postId).all();
  return json({ post, targets: targets.results, logs: logs.results.map(log => ({ ...log, response: parseJson(log.response) })) });
}
async function approve(request, env, postId) {
  await user(request, env, "admin");
  const result = await env.DB.prepare("UPDATE buffer_social_posts SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'draft'").bind(postId).run();
  if (result.meta.changes !== 1) throw new HttpError(409, "Only draft posts can be approved");
  return json({ ok: true });
}
async function createBufferPost(env, post, target) {
  const input = {
    text: post.body,
    channelId: target.channel_id,
    schedulingType: "automatic",
    mode: post.scheduled_for ? "customScheduled" : "addToQueue",
    assets: post.public_url ? [{ [post.content_type.startsWith("video/") ? "video" : "image"]: { url: post.public_url } }] : [],
  };
  if (post.scheduled_for) input.dueAt = post.scheduled_for;
  if (SERVICE_METADATA[target.service]) input.metadata = SERVICE_METADATA[target.service];
  const data = await buffer(env, CREATE_POST_MUTATION, { input });
  const result = data?.createPost;
  if (!result?.post?.id) throw new HttpError(502, result?.message || "Buffer rejected the post");
  return result;
}
function recordTarget(env, postId, target, status, response) {
  return env.DB.batch([
    env.DB.prepare("UPDATE buffer_social_post_targets SET status = ?, buffer_post_id = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(status, response.post?.id ?? null, response.error ?? null, target.id),
    env.DB.prepare("INSERT INTO buffer_social_publish_logs (id, post_id, channel_id, status, buffer_response_json) VALUES (?, ?, ?, ?, ?)")
      .bind(id(), postId, target.channel_id, status, JSON.stringify(response)),
  ]);
}
async function publish(request, env, postId) {
  await user(request, env, "admin");
  const post = await env.DB.prepare("SELECT p.id, p.body, p.status, p.scheduled_for, m.public_url, m.content_type FROM buffer_social_posts p LEFT JOIN buffer_social_media m ON m.id = p.media_id WHERE p.id = ?").bind(postId).first();
  if (!post) throw new HttpError(404, "Post not found");
  if (post.scheduled_for && Date.parse(post.scheduled_for) <= Date.now()) throw new HttpError(409, "The scheduled time has passed; create a new post with a future time");
  // Claim the post first so concurrent or repeated requests cannot post it twice.
  const claim = await env.DB.prepare("UPDATE buffer_social_posts SET status = 'publishing', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND (status IN ('approved', 'failed') OR (status = 'publishing' AND updated_at < datetime('now', ?)))")
    .bind(postId, "-" + STALE_PUBLISH_MINUTES + " minutes").run();
  if (claim.meta.changes !== 1) throw new HttpError(409, post.status === "publishing" ? "This post is already being published" : "Only approved or failed posts can be published");
  const results = [];
  let rateLimit = null;
  try {
    const targets = await env.DB.prepare("SELECT t.id, t.channel_id, c.service FROM buffer_social_post_targets t JOIN buffer_social_channels c ON c.id = t.channel_id WHERE t.post_id = ? AND t.status IN ('pending', 'failed')").bind(postId).all();
    // Channels left in 'publishing' by an interrupted run may already exist in Buffer: flag them, do not resend.
    const interrupted = await env.DB.prepare("SELECT channel_id FROM buffer_social_post_targets WHERE post_id = ? AND status = 'publishing'").bind(postId).all();
    if (interrupted.results.length) {
      await env.DB.prepare("UPDATE buffer_social_post_targets SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE post_id = ? AND status = 'publishing'").bind(INTERRUPTED_MESSAGE, postId).run();
      for (const target of interrupted.results) results.push({ channelId: target.channel_id, ok: false, error: INTERRUPTED_MESSAGE });
    }
    for (const target of targets.results) {
      const claimed = await env.DB.prepare("UPDATE buffer_social_post_targets SET status = 'publishing', error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'failed')").bind(target.id).run();
      if (claimed.meta.changes !== 1) continue;
      let created;
      try {
        created = await createBufferPost(env, post, target);
      } catch (error) {
        if (!(error instanceof HttpError)) console.error(error);
        const message = error instanceof HttpError ? error.message : "Unexpected error while calling Buffer";
        await recordTarget(env, postId, target, "failed", { error: message });
        results.push({ channelId: target.channel_id, ok: false, error: message });
        if (error instanceof HttpError && error.details?.rateLimited) {
          rateLimit = error;
          break;
        }
        continue;
      }
      try {
        await recordTarget(env, postId, target, "queued", created);
        results.push({ channelId: target.channel_id, ok: true, bufferPostId: created.post.id });
      } catch (error) {
        // The Buffer post exists. Leave the channel in 'publishing' so a retry flags it instead of posting again.
        console.error("Buffer post created but not recorded", target.channel_id, created.post.id, error);
        results.push({ channelId: target.channel_id, ok: true, bufferPostId: created.post.id, warning: "Created in Buffer but not saved in D1" });
      }
    }
  } finally {
    await env.DB.prepare("UPDATE buffer_social_posts SET status = CASE WHEN EXISTS (SELECT 1 FROM buffer_social_post_targets WHERE post_id = ? AND status != 'queued') THEN 'failed' ELSE 'queued' END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'publishing'")
      .bind(postId, postId).run();
  }
  const status = await env.DB.prepare("SELECT status FROM buffer_social_posts WHERE id = ?").bind(postId).first("status");
  return json({ status, results, ...(rateLimit ? { rateLimited: true } : {}) }, 200, rateLimit?.headers);
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const method = request.method;
    try {
      if (method === "GET" && path === "/health") {
        const missing = missingConfig(env);
        return json({ ok: !missing.length, missing }, missing.length ? 503 : 200);
      }
      if (!path.startsWith("/api/admin/")) return json({ error: "Not found" }, 404);
      requireConfig(env);
      assertSameOrigin(request, env);
      const post = path.match(POST_ROUTE);
      // Handlers are awaited so their errors reach the catch below.
      if (method === "GET" && path === "/api/admin/buffer/channels") return await listChannels(request, env);
      if (method === "POST" && path === "/api/admin/buffer/channels/sync") return await syncChannels(request, env);
      if (method === "GET" && path === "/api/admin/media") return await listMedia(request, env);
      if (method === "POST" && path === "/api/admin/media/upload") return await uploadMedia(request, env);
      if (method === "GET" && path === "/api/admin/social-posts") return await listPosts(request, env);
      if (method === "POST" && path === "/api/admin/social-posts") return await createPost(request, env);
      if (method === "GET" && post && !post[2]) return await getPost(request, env, post[1]);
      if (method === "POST" && post?.[2] === "approve") return await approve(request, env, post[1]);
      if (method === "POST" && post?.[2] === "publish") return await publish(request, env, post[1]);
      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message, ...error.details }, error.status, error.headers);
      console.error(error);
      return json({ error: "Unexpected server error" }, 500);
    }
  },
};
