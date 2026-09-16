const json = (payload, status, origin) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return new Response(JSON.stringify(payload), { status, headers });
};

const getAllowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGIN || "*")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allowed.includes("*")) {
    return "*";
  }
  if (allowed.includes(origin)) {
    return origin;
  }
  return "";
};

const isValidPicks = (picks) => {
  if (!Array.isArray(picks) || picks.length !== 3) {
    return false;
  }
  const normalized = picks.map((pick) => String(pick || "").trim());
  if (normalized.some((pick) => !pick)) {
    return false;
  }
  return new Set(normalized).size === 3;
};

const getSanitizedComment = (comment) => {
  if (comment === undefined || comment === null) {
    return "";
  }
  return String(comment).trim();
};

const getSanitizedVoterName = (name) => {
  if (name === undefined || name === null) {
    return "";
  }
  return String(name).trim();
};

const maskIp = (ip) => {
  if (!ip) {
    return "Unknown";
  }
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 2).join(":")}:****`;
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  return "Hidden";
};

const toTimestamp = (value) => {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeRecord = (value) => {
  let record;
  try {
    record = JSON.parse(value);
  } catch (error) {
    return null;
  }

  if (!record || !Array.isArray(record.picks)) {
    return null;
  }

  const picks = record.picks.map((pick) => String(pick || "").trim()).filter(Boolean);
  if (!picks.length) {
    return null;
  }

  return {
    picks,
    voterName: getSanitizedVoterName(record.voterName),
    submittedAt: record.submittedAt || record.recordedAt || null,
    recordedAt: record.recordedAt || null,
    comment: getSanitizedComment(record.comment),
    ip: record.ip || null
  };
};

const getResults = async (env, limit) => {
  let cursor;
  const votes = [];
  const totals = {};

  do {
    const page = await env.LOGO_VOTES.list({ prefix: "vote:", cursor, limit: 1000 });
    cursor = page.cursor;

    for (const key of page.keys) {
      const value = await env.LOGO_VOTES.get(key.name);
      if (!value) {
        continue;
      }
      const record = normalizeRecord(value);
      if (!record) {
        continue;
      }
      votes.push(record);
      for (const pick of record.picks) {
        totals[pick] = (totals[pick] || 0) + 1;
      }
    }
  } while (cursor);

  votes.sort((a, b) => toTimestamp(b.recordedAt || b.submittedAt) - toTimestamp(a.recordedAt || a.submittedAt));
  const trimmedVotes = votes.slice(0, limit).map((vote, index) => ({
    voter: vote.voterName || `Voter ${index + 1}`,
    picks: vote.picks,
    submittedAt: vote.submittedAt || vote.recordedAt,
    comment: vote.comment,
    maskedIp: maskIp(vote.ip)
  }));

  const leaderboard = Object.entries(totals)
    .map(([logoId, count]) => ({ logoId, count }))
    .sort((a, b) => b.count - a.count || a.logoId.localeCompare(b.logoId));

  return {
    totalVotes: votes.length,
    leaderboard,
    votes: trimmedVotes
  };
};

export default {
  async fetch(request, env) {
    const origin = getAllowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    if (request.method !== "GET" && request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin || "*");
    }

    if (!origin) {
      return json({ error: "Origin not allowed" }, 403, "null");
    }

    if (!env.LOGO_VOTES) {
      return json({ error: "Missing KV binding" }, 500, origin || "*");
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const requestedLimit = Number.parseInt(url.searchParams.get("limit") || "250", 10);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), 1000)
        : 250;
      const results = await getResults(env, limit);
      return json(results, 200, origin || "*");
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return json({ error: "Invalid JSON" }, 400, origin || "*");
    }

    if (!isValidPicks(payload.picks)) {
      return json({ error: "You must submit exactly 3 unique logo picks" }, 400, origin || "*");
    }

    const comment = getSanitizedComment(payload.comment);
    if (comment.length > 1000) {
      return json({ error: "Comment must be 1000 characters or less" }, 400, origin || "*");
    }
    const voterName = getSanitizedVoterName(payload.voterName);
    if (!voterName) {
      return json({ error: "Voter name is required" }, 400, origin || "*");
    }
    if (voterName.length > 80) {
      return json({ error: "Voter name must be 80 characters or less" }, 400, origin || "*");
    }

    const now = new Date().toISOString();
    const key = `vote:${now}:${crypto.randomUUID()}`;
    const record = {
      picks: payload.picks.map((pick) => String(pick).trim()),
      voterName,
      comment,
      submittedAt: payload.submittedAt || now,
      recordedAt: now,
      ip: request.headers.get("CF-Connecting-IP") || null,
      ua: request.headers.get("User-Agent") || null,
      origin: request.headers.get("Origin") || null
    };

    await env.LOGO_VOTES.put(key, JSON.stringify(record));
    return json({ ok: true, id: key }, 200, origin || "*");
  }
};
