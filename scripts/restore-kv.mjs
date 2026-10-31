/**
 * Restore a KV dump produced by scripts/backup-kv.mjs into another namespace.
 *
 * Used for the account migration: dump SUBSCRIBERS from the old account, create a
 * new namespace in the client's account, then load the dump into it.
 *
 * Usage:
 *   export CLOUDFLARE_API_TOKEN=...                 # needs Workers KV:Write
 *   export CLOUDFLARE_ACCOUNT_ID=...
 *   export TARGET_KV_NAMESPACE_ID=...
 *   node scripts/restore-kv.mjs <backupDir> [--dry-run] [--yes] [--limit N]
 *
 * <backupDir> is the directory written by backup-kv.mjs (contains manifest.json,
 * keys.json, values.ndjson).
 *
 * Behaviour:
 *   - refuses to run without --yes (or will abort on dry-run count mismatch)
 *   - --dry-run loads nothing, just reports what would be written
 *   - warns if the target namespace is the same as the one the dump came from
 *   - after writing, verifies the target key count against the manifest and
 *     spot-checks a sample of values
 */

import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import readline from "node:readline";
import path from "node:path";

const API = "https://api.cloudflare.com/client/v4";
const MAX_PAIRS_PER_REQUEST = 5000;
const MAX_BYTES_PER_REQUEST = 40 * 1024 * 1024; // under the 100 MB API limit
const SPOT_CHECK_COUNT = 25;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const assumeYes = args.includes("--yes");
const limitIndex = args.indexOf("--limit");
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : Infinity;
const backupDir = args.find((value) => !value.startsWith("--") && !Number.isFinite(Number(value)));

if (!backupDir) {
  console.error("Usage: node scripts/restore-kv.mjs <backupDir> [--dry-run] [--yes] [--limit N]");
  process.exit(1);
}

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const targetNamespace = process.env.TARGET_KV_NAMESPACE_ID;

if (!token || !accountId || !targetNamespace) {
  console.error(
    "Missing one of: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, TARGET_KV_NAMESPACE_ID"
  );
  process.exit(1);
}

async function api(pathname, init) {
  const response = await fetch(`${API}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    const detail = (payload.errors || []).map((e) => e.message).join("; ");
    throw new Error(`${init?.method || "GET"} ${pathname} failed: ${detail || response.status}`);
  }

  return payload;
}

async function countKeys(namespaceId) {
  const payload = await api(
    `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?limit=1`
  );
  return payload.result_info?.count ?? (payload.result || []).length;
}

async function readValue(namespaceId, name) {
  const response = await fetch(
    `${API}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) return null;
  return response.text();
}

const manifest = JSON.parse(await readFile(path.join(backupDir, "manifest.json"), "utf8"));
const keysMeta = new Map(
  JSON.parse(await readFile(path.join(backupDir, "keys.json"), "utf8")).map((entry) => [
    entry.name,
    entry,
  ])
);

console.log(`Dump : ${backupDir}`);
console.log(`  source namespace : ${manifest.namespaceId}`);
console.log(`  source account   : ${manifest.accountId}`);
console.log(`  exported at      : ${manifest.exportedAt}`);
console.log(`  keys             : ${manifest.keyCount}`);
console.log(`Target namespace   : ${targetNamespace}`);
console.log(`Target account     : ${accountId}`);

if (manifest.failed?.length) {
  console.error(`\nRefusing to continue: the dump recorded ${manifest.failed.length} unreadable keys.`);
  process.exit(2);
}

if (targetNamespace === manifest.namespaceId && accountId === manifest.accountId) {
  console.error(
    "\nRefusing to continue: target namespace is the same as the source. " +
      "Set TARGET_KV_NAMESPACE_ID to the namespace created in the new account."
  );
  process.exit(2);
}

// Stream values.ndjson so a large dump doesn't have to sit in memory all at once.
const pairs = [];
const nowSeconds = Math.floor(Date.now() / 1000);
let read = 0;

const stream = readline.createInterface({ input: createReadStream(path.join(backupDir, "values.ndjson")) });
for await (const line of stream) {
  if (!line.trim()) continue;
  if (read >= limit) break;

  const entry = JSON.parse(line);
  const value = typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value);
  const meta = keysMeta.get(entry.name) || {};
  const pair = { key: entry.name, value };

  if (Number.isFinite(meta.expiration) && meta.expiration > nowSeconds) {
    pair.expiration = meta.expiration;
  }

  pairs.push(pair);
  read += 1;
}

console.log(`\nLoaded ${pairs.length} pairs from the dump.`);

if (dryRun) {
  const bytes = pairs.reduce((total, pair) => total + Buffer.byteLength(pair.value), 0);
  console.log(`DRY RUN: would write ${pairs.length} pairs (~${(bytes / 1024 / 1024).toFixed(1)} MB).`);
  console.log("Sample keys:", pairs.slice(0, 5).map((pair) => pair.key).join(", "));
  process.exit(0);
}

if (!assumeYes) {
  console.error("\nRe-run with --yes to actually write to the target namespace.");
  process.exit(1);
}

// Chunk by both pair count and payload size.
const chunks = [];
let current = [];
let currentBytes = 0;

for (const pair of pairs) {
  const size = Buffer.byteLength(pair.value) + Buffer.byteLength(pair.key) + 64;

  if (
    current.length >= MAX_PAIRS_PER_REQUEST ||
    (currentBytes + size > MAX_BYTES_PER_REQUEST && current.length)
  ) {
    chunks.push(current);
    current = [];
    currentBytes = 0;
  }

  current.push(pair);
  currentBytes += size;
}
if (current.length) chunks.push(current);

console.log(`Writing in ${chunks.length} bulk request(s)...`);

let written = 0;
for (const [index, chunk] of chunks.entries()) {
  await api(`/accounts/${accountId}/storage/kv/namespaces/${targetNamespace}/bulk`, {
    method: "PUT",
    body: JSON.stringify(chunk),
  });
  written += chunk.length;
  console.log(`  chunk ${index + 1}/${chunks.length}: wrote ${written}/${pairs.length}`);
}

// Verify: counts, then spot-check values byte for byte.
const targetCount = await countKeys(targetNamespace);
console.log(`\nVerify: target namespace now has ${targetCount} keys (dump had ${manifest.keyCount}).`);
if (targetCount < manifest.keyCount) {
  console.error("Mismatch: target has fewer keys than the dump. Do not point the site at it.");
  process.exit(3);
}

const sample = pairs.filter(() => Math.random() < 0.5).slice(0, SPOT_CHECK_COUNT);
let mismatches = 0;

for (const pair of sample) {
  const actual = await readValue(targetNamespace, pair.key);
  if (actual === null) {
    console.error(`  missing: ${pair.key}`);
    mismatches += 1;
  } else if (actual !== pair.value) {
    console.error(`  value differs: ${pair.key}`);
    mismatches += 1;
  }
}

console.log(
  mismatches
    ? `Spot check: ${mismatches}/${sample.length} mismatched.`
    : `Spot check: ${sample.length}/${sample.length} values match.`
);

if (mismatches) process.exit(3);

console.log("\nRestore complete. Next: bind the new namespace and deploy the Worker.");
