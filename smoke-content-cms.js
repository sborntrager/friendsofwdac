const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = __dirname;
const workerBase = "https://friendsofwadc-subscribe.shannonborntrager.workers.dev";
const origin = "https://friendsofwadc.org";
const restoreUpdatedBy = "shannonborntrager@gmail.com";

const pageConfigs = {
  home: { phase: 1, fieldPath: "home.hero.kicker", prefix: "Friends of the WDAC | Smoke Test" },
  about: { phase: 1, fieldPath: "about.hero.title", prefix: "Friends of the WDAC Smoke Test" },
  membership: { phase: 2, fieldPath: "membership.hero.title", prefix: "Become a Friend Smoke Test" },
  donate: { phase: 2, fieldPath: "donate.hero.title", prefix: "Fund what matters now Smoke Test" },
  history: { phase: 3, fieldPath: "history.hero.title", prefix: "History Smoke Test" },
  docs: { phase: 3, fieldPath: "docs.hero.title", prefix: "Forms and PDFs Smoke Test" },
  news: { phase: 3, fieldPath: "news.hero.title", prefix: "Advocacy and Impact Smoke Test" }
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current.startsWith("--") && args[index + 1]) {
      values[current.slice(2)] = args[index + 1];
      index += 1;
    }
  }

  if (!values.email || !values.password) {
    throw new Error("Usage: node smoke-content-cms.js --email <email> --password <password>");
  }

  return values;
};

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

const getNestedValue = (source, dottedPath) => {
  let cursor = source;

  for (const segment of dottedPath.split(".")) {
    if (!cursor || typeof cursor !== "object") {
      return null;
    }
    cursor = cursor[segment];
  }

  return cursor ?? null;
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

const restoreCanonicalContent = (email, password) => {
  const result = spawnSync(process.execPath, [path.join(repoRoot, "sync-content-cms.js"), "--sync-api", "--email", email, "--password", password, "--updated-by", restoreUpdatedBy], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || "Failed to restore canonical CMS content").trim());
  }

  if (result.stdout) {
    console.log(result.stdout.trim());
  }
};

const main = async () => {
  const { email, password } = parseArgs();
  let restoreError = null;

  try {
    const login = await requestJson(`${workerBase}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!login?.token) {
      throw new Error("Login succeeded without a token.");
    }

    const authHeaders = {
      Authorization: `Bearer ${login.token}`,
      "Content-Type": "application/json"
    };

    const results = [];

    for (const [page, config] of Object.entries(pageConfigs)) {
      console.log(`Testing ${page}...`);
      const timestamp = new Date().toISOString();
      const nextValue = `${config.prefix} ${timestamp}`;
      const draft = {};
      setNestedValue(draft, config.fieldPath, nextValue);

      await requestJson(`${workerBase}/admin/content/pages/${page}?phase=${config.phase}&view=draft`, {
        headers: authHeaders
      });

      await requestJson(`${workerBase}/admin/content/pages/${page}?phase=${config.phase}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({
          page,
          phase: config.phase,
          saveMode: "draft",
          draft
        })
      });

      await requestJson(`${workerBase}/admin/content/pages/${page}/publish?phase=${config.phase}`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ page, phase: config.phase })
      });

      const publicContent = await requestJson(`${workerBase}/content/pages/${page}?view=published&phase=${config.phase}`);
      const publishedValue = getNestedValue(publicContent?.page?.published?.content, config.fieldPath);

      if (publishedValue !== nextValue) {
        throw new Error(`Published value mismatch for ${page}. Expected "${nextValue}" but received "${publishedValue}".`);
      }

      results.push({ page, phase: config.phase, field: config.fieldPath, publishedValue });
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    try {
      restoreCanonicalContent(email, password);
    } catch (error) {
      restoreError = error;
      console.error(error.message || error);
    }
  }

  if (restoreError) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});