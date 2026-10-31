/**
 * Dump a Cloudflare KV namespace to disk.
 *
 * Wrangler has no `kv export`, and this project keeps *all* of its data in KV
 * (admin users, members, donors, imports, forms inbox, CMS content), so this is
 * the recovery point before any account migration.
 *
 * Usage:
 *   export CLOUDFLARE_API_TOKEN=...        # needs Workers KV:Read on the namespace
 *   export CLOUDFLARE_ACCOUNT_ID=...
 *   export CLOUDFLARE_KV_NAMESPACE_ID=...  # defaults to the current SUBSCRIBERS id
 *   node scripts/backup-kv.mjs [outputDir]
 *
 * Writes <outputDir>/<namespaceId>-<timestamp>/ with:
 *   - keys.json             every key name + expiration/measurement metadata
 *   - values.ndjson         one JSON line per key: { name, value } (value parsed
 *                           as JSON when possible, otherwise kept as a string)
 *   - manifest.json         counts + prefixes, for before/after comparison
 *
 * Never commit the output directory.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://api.cloudflare.com/client/v4";
const DEFAULT_NAMESPACE_ID = "45958fcabdd3437fbb30845d9541d46f";
const PAGE_SIZE = 1000;

const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const namespaceId = process.env.CLOUDFLARE_KV_NAMESPACE_ID || DEFAULT_NAMESPACE_ID;
const outRoot = process.argv[2] || path.join(process.cwd(), "_kv_backup");

if (!token || !accountId) {
  console.error("Missing CLOUDFLARE_API_TOKEN or CLOUDFLARE_ACCOUNT_ID env vars.");
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

async function listKeys() {
  const keys = [];
  let cursor = null;

  for (;;) {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set("cursor", cursor);

    const payload = await api(
      `/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/keys?${query}`
    );

    keys.push(...(payload.result || []));

    const info = payload.result_info || {};
    cursor = info.cursor || null;
    process.stdout.write(`listed ${keys.length} keys\r`);

    if (!cursor) break;
  }

  process.stdout.write("\n");
  return keys;
}

async function readValue(name) {
  const response = await fetch(
    `${API}/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.status === 404) return null;

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`value ${name} failed: ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

const keys = await listKeys();

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(outRoot, `${namespaceId}-${stamp}`);
await mkdir(outDir, { recursive: true });

const values = [];
const failed = [];

for (const [index, entry] of keys.entries()) {
  try {
    values.push({ name: entry.name, value: await readValue(entry.name) });
  } catch (error) {
    failed.push({ name: entry.name, error: String(error.message || error) });
  }
  if (index % 25 === 0) process.stdout.write(`read ${index + 1}/${keys.length}\r`);
}
process.stdout.write("\n");

const prefixes = {};
for (const { name } of keys) {
  const prefix = name.includes(":") ? `${name.split(":").slice(0, 2).join(":")}:` : "(no-prefix)";
  prefixes[prefix] = (prefixes[prefix] || 0) + 1;
}

await writeFile(path.join(outDir, "keys.json"), JSON.stringify(keys, null, 2));
await writeFile(
  path.join(outDir, "values.ndjson"),
  values.map((entry) => JSON.stringify(entry)).join("\n") + "\n"
);
await writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(
    {
      accountId,
      namespaceId,
      exportedAt: new Date().toISOString(),
      keyCount: keys.length,
      valuesWritten: values.length,
      failed,
      prefixes,
    },
    null,
    2
  )
);

console.log(`\nWrote ${values.length} values to ${outDir}`);
console.log(`Keys: ${keys.length}  Failures: ${failed.length}`);
console.log("Prefix breakdown:", prefixes);
if (failed.length) {
  console.error("Some values failed to read — see manifest.json. Do not migrate until resolved.");
  process.exit(2);
}
