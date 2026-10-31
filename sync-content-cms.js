const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const repoRoot = __dirname;
const wranglerPath = "npx";
const supportedPages = {
  home: { phase: 1, file: path.join(repoRoot, "public", "index.html") },
  about: { phase: 1, file: path.join(repoRoot, "public", "about", "index.html") },
  membership: { phase: 2, file: path.join(repoRoot, "public", "membership", "index.html") },
  donate: { phase: 2, file: path.join(repoRoot, "public", "donate", "index.html") },
  history: { phase: 3, file: path.join(repoRoot, "public", "history", "index.html") },
  docs: { phase: 3, file: path.join(repoRoot, "public", "docs", "index.html") },
  news: { phase: 3, file: path.join(repoRoot, "public", "news", "index.html") }
};
const workerBase = process.env.WDAC_CONTENT_API_BASE || "https://api.friendsofwdac.org";
const origin = process.env.WDAC_SITE_ORIGIN || "https://friendsofwdac.org";

const decodeHtml = (value) =>
  String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const normalizeText = (value) =>
  decodeHtml(String(value || "").replace(/<svg[\s\S]*?<\/svg>/g, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

const setNestedValue = (target, dottedPath, value) => {
  const segments = dottedPath.split(".");
  let cursor = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLeaf = index === segments.length - 1;

    if (isLeaf) {
      cursor[segment] = value;
      return;
    }

    if (!cursor[segment] || typeof cursor[segment] !== "object" || Array.isArray(cursor[segment])) {
      cursor[segment] = {};
    }

    cursor = cursor[segment];
  }
};

const readFile = (filePath) => fs.readFileSync(filePath, "utf8");

const parseNamespaceId = () => {
  const wranglerToml = readFile(path.join(repoRoot, "wrangler.toml"));
  const match = wranglerToml.match(/\{\s*binding\s*=\s*"SUBSCRIBERS",\s*id\s*=\s*"([^"]+)"\s*\}/);
  if (!match) {
    throw new Error("Unable to find SUBSCRIBERS namespace id in wrangler.toml");
  }
  return match[1];
};

const parseAdminDefaults = () => {
  const html = readFile(path.join(repoRoot, "public", "admin", "index.html"));
  const defaults = new Map();

  for (const match of html.matchAll(/<input[^>]*data-content-field="([^"]+)"[^>]*value="([^"]*)"/g)) {
    defaults.set(match[1], decodeHtml(match[2]));
  }

  for (const match of html.matchAll(/<textarea[^>]*data-content-field="([^"]+)"[^>]*>([\s\S]*?)<\/textarea>/g)) {
    defaults.set(match[1], normalizeText(match[2]));
  }

  return defaults;
};

const parsePublicPageValues = (filePath) => {
  const html = readFile(filePath);
  const values = new Map();

  for (const match of html.matchAll(/<[^>]+data-content-key="([^"]+)"[^>]*>([\s\S]*?)<\/[^>]+>/g)) {
    values.set(match[1], normalizeText(match[2]));
  }

  for (const match of html.matchAll(/<a[^>]*href="([^"]*)"[^>]*data-content-link-key="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    values.set(`${match[2]}.href`, decodeHtml(match[1]));
    const explicitLabelMatch = match[3].match(/<[^>]*data-content-link-label[^>]*>([\s\S]*?)<\/[^>]+>/);
    values.set(`${match[2]}.label`, normalizeText(explicitLabelMatch ? explicitLabelMatch[1] : match[3]));
  }

  for (const match of html.matchAll(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*data-content-image-key="([^"]+)"[^>]*>/g)) {
    values.set(`${match[3]}.src`, decodeHtml(match[1]));
    values.set(`${match[3]}.alt`, decodeHtml(match[2]));
  }

  return values;
};

const buildDesiredContentByPage = (defaults) => {
  const pageContent = {};

  for (const page of Object.keys(supportedPages)) {
    const contentRoot = {};

    for (const [key, value] of defaults.entries()) {
      if (!key.startsWith(`${page}.`)) continue;
      setNestedValue(contentRoot, key, value);
    }

    pageContent[page] = contentRoot;
  }

  return pageContent;
};

const runWrangler = (args, allowFailure = false) => {
  const result = spawnSync(wranglerPath, ["wrangler", ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
    windowsHide: true,
    env: {
      ...process.env,
      CI: "1"
    }
  });

  if (result.error && !allowFailure) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || "Wrangler command failed").trim());
  }

  return {
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim()
  };
};

const listRemoteKeys = (namespaceId) => {
  const result = runWrangler(["kv", "key", "list", "--namespace-id", namespaceId, "--remote", "--prefix", "admin:content:"]);
  return new Set(JSON.parse(result.stdout).map((entry) => entry.name));
};

const loadRemoteRecord = (namespaceId, key) => {
  const result = runWrangler(["kv", "key", "get", "--namespace-id", namespaceId, key, "--remote", "--text"], true);

  if (result.status !== 0) {
    if (/Value not found|404:\s*Not Found/i.test(result.stderr) || /Value not found|404:\s*Not Found/i.test(result.stdout)) {
      return null;
    }
    throw new Error(result.stderr || result.stdout || `Failed to read remote key ${key}`);
  }

  if (!result.stdout) {
    return null;
  }

  return JSON.parse(result.stdout);
};

const saveRemoteRecord = (namespaceId, key, record) => {
  const tempFile = path.join(os.tmpdir(), `content-sync-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);

  try {
    fs.writeFileSync(tempFile, JSON.stringify(record), "utf8");
    runWrangler(["kv", "key", "put", "--namespace-id", namespaceId, key, "--remote", "--path", tempFile]);
  } finally {
    fs.rmSync(tempFile, { force: true });
  }
};

const auditDefaultsAgainstPages = (defaults) => {
  const mismatches = [];

  for (const [page, meta] of Object.entries(supportedPages)) {
    const publicValues = parsePublicPageValues(meta.file);

    for (const [key, defaultValue] of defaults.entries()) {
      if (!key.startsWith(`${page}.`)) continue;
      if (!publicValues.has(key)) continue;

      const publicValue = publicValues.get(key);
      if (defaultValue !== publicValue) {
        mismatches.push({ page, key, expected: publicValue, actual: defaultValue });
      }
    }
  }

  return mismatches;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Origin: origin,
      ...(options.headers || {})
    }
  });

  const rawText = await response.text();
  let payload = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch (error) {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return payload;
};

const syncViaApi = async (desiredContent, updatedBy, email, password) => {
  const login = await requestJson(`${workerBase}/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!login?.token) {
    throw new Error("Admin API login succeeded without a token.");
  }

  const authHeaders = {
    Authorization: `Bearer ${login.token}`,
    "Content-Type": "application/json"
  };
  const results = [];

  for (const [page, meta] of Object.entries(supportedPages)) {
    await requestJson(`${workerBase}/admin/content/pages/${page}?phase=${meta.phase}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        page,
        phase: meta.phase,
        saveMode: "draft",
        draft: desiredContent[page]
      })
    });

    await requestJson(`${workerBase}/admin/content/pages/${page}/publish?phase=${meta.phase}`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        page,
        phase: meta.phase
      })
    });

    results.push({ page, phase: meta.phase, route: "admin-api" });
  }

  return results;
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current.startsWith("--") && args[index + 1] && !args[index + 1].startsWith("--")) {
      values[current.slice(2)] = args[index + 1];
      index += 1;
    }
  }

  const flags = {
    audit: args.includes("--audit") || (!args.includes("--sync-remote") && !args.includes("--sync-api")),
    syncRemote: args.includes("--sync-remote"),
    syncApi: args.includes("--sync-api"),
    updatedBy: values["updated-by"] || "content-sync-script",
    email: values.email || "",
    password: values.password || ""
  };

  if (flags.syncApi && (!flags.email || !flags.password)) {
    throw new Error("Usage: node sync-content-cms.js --sync-api --email <email> --password <password> [--updated-by <email>]");
  }

  return flags;
};

const main = async () => {
  const { audit, syncRemote, syncApi, updatedBy, email, password } = parseArgs();
  const defaults = parseAdminDefaults();
  const desiredContent = buildDesiredContentByPage(defaults);

  if (audit) {
    const mismatches = auditDefaultsAgainstPages(defaults);

    if (!mismatches.length) {
      console.log("Admin CMS defaults match the checked-in public page content for all audited fields.");
    } else {
      console.log(JSON.stringify(mismatches, null, 2));
      process.exitCode = 1;
      if (!syncRemote) {
        return;
      }
    }
  }

  if (!syncRemote && !syncApi) {
    return;
  }

  if (syncApi) {
    const apiResults = await syncViaApi(desiredContent, updatedBy, email, password);
    console.log(JSON.stringify(apiResults, null, 2));
    return;
  }

  const namespaceId = parseNamespaceId();
  const existingKeys = listRemoteKeys(namespaceId);
  const now = new Date().toISOString();
  const results = [];

  for (const [page, meta] of Object.entries(supportedPages)) {
    const key = `admin:content:${meta.phase}:${page}`;
    const existing = existingKeys.has(key) ? loadRemoteRecord(namespaceId, key) : null;
    const record = {
      id: existing?.id || crypto.randomUUID(),
      type: "content-page",
      page,
      phase: meta.phase,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      updatedBy,
      draft: {
        content: desiredContent[page],
        updatedAt: now,
        updatedBy
      },
      published: {
        content: desiredContent[page],
        updatedAt: now,
        updatedBy
      },
      publishedAt: now
    };

    saveRemoteRecord(namespaceId, key, record);
    results.push({ page, phase: meta.phase, key });
  }

  console.log(JSON.stringify(results, null, 2));
};

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});