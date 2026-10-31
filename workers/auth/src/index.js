import { AuthError, SESSION_COOKIE, findSessionUser, isSameOriginRequest, sessionToken, sha256 } from "./session.js";

const encoder = new TextEncoder();
const TOKEN_PATTERN = /^[0-9a-f]{64}$/;
const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_LINKS_PER_EMAIL = 5;
const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
});
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const id = () => crypto.randomUUID();
const hex = bytes => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
const token = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const future = (amount, unit) => new Date(Date.now() + amount * unit).toISOString();
const isSet = value => typeof value === "string" && value.trim() !== "" && !value.startsWith("replace-with-");
const positiveInteger = (value, fallback) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
// Cloudflare Email Service when the AUTH_EMAIL send_email binding is present, otherwise Resend.
const usesCloudflareEmail = env => typeof env.AUTH_EMAIL?.send === "function";

function origin(env) {
  return new URL(env.APP_ORIGIN).origin;
}
function sessionCookie(env, value, expires) {
  const secure = origin(env).startsWith("https://") ? "; Secure" : "";
  return SESSION_COOKIE + "=" + value + "; HttpOnly; SameSite=Lax; Path=/; Max-Age=" + expires + secure;
}
async function audit(env, userId, type) {
  return env.DB.prepare("INSERT INTO auth_audit_events (id, user_id, event_type) VALUES (?, ?, ?)")
    .bind(id(), userId, type).run();
}
function safeReturnPath(value, fallback = "/account") {
  return ["/account", "/admin"].includes(value) ? value : fallback;
}
function validateConfiguration(env) {
  const missing = [];
  if (!env.DB || typeof env.DB.prepare !== "function") missing.push("DB");
  const required = usesCloudflareEmail(env) ? ["APP_ORIGIN", "AUTH_FROM_EMAIL"] : ["APP_ORIGIN", "RESEND_API_KEY", "RESEND_FROM_EMAIL"];
  for (const name of required) if (!isSet(env[name])) missing.push(name);
  if (env.TURNSTILE_ENABLED === "true" && !isSet(env.TURNSTILE_SECRET)) missing.push("TURNSTILE_SECRET");
  return missing;
}
function requireConfiguration(env) {
  const missing = validateConfiguration(env);
  if (missing.length) throw new HttpError(503, "Authentication is not configured: missing " + missing.join(", "));
}
// Keyed hash when AUTH_IP_HASH_SECRET is set, so stored values cannot be reversed by hashing every IP.
async function ipHash(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!isSet(env.AUTH_IP_HASH_SECRET)) return sha256("ip:" + ip);
  const key = await crypto.subtle.importKey("raw", encoder.encode(env.AUTH_IP_HASH_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(ip)));
}
async function verifyTurnstile(request, env, turnstileToken) {
  if (env.TURNSTILE_ENABLED !== "true") return true;
  if (typeof turnstileToken !== "string" || !turnstileToken || turnstileToken.length > 2048) return false;
  let result;
  try {
    const response = await fetch(TURNSTILE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET,
        response: turnstileToken,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined,
        idempotency_key: id(),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    result = await response.json();
  } catch {
    throw new HttpError(503, "The bot check is unavailable. Try again shortly.");
  }
  return result?.success === true;
}
async function deliver(env, email, rawToken, returnTo) {
  const link = new URL("/api/auth/verify", origin(env));
  link.searchParams.set("token", rawToken);
  link.searchParams.set("returnTo", safeReturnPath(returnTo, env.AUTH_SUCCESS_PATH || "/account"));
  const subject = "Your sign-in link";
  const html = '<p><a href="' + escapeHtml(link.href) + '">Sign in securely</a></p><p>This single-use link expires shortly.</p>';
  if (usesCloudflareEmail(env)) {
    const from = isSet(env.AUTH_FROM_NAME) ? { email: env.AUTH_FROM_EMAIL, name: env.AUTH_FROM_NAME } : env.AUTH_FROM_EMAIL;
    const text = "Sign in securely: " + link.href + "\n\nThis single-use link expires shortly.";
    try {
      await env.AUTH_EMAIL.send({ to: email, from, subject, html, text });
    } catch (error) {
      console.error("Cloudflare email delivery failed", error?.code || "", String(error?.message || error).slice(0, 500));
      throw new HttpError(502, "The sign-in email could not be sent. Check the verified sender configuration.");
    }
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.RESEND_FROM_EMAIL, to: [email], subject, html }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Resend delivery failed", response.status, detail.slice(0, 500));
    throw new HttpError(502, "The sign-in email could not be sent. Check the verified sender configuration.");
  }
}
async function requestLink(request, env) {
  requireConfiguration(env);
  if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: "Origin not allowed" }, 403);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "Send a JSON object" }, 400);
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Enter a valid email address" }, 400);
  if (!await verifyTurnstile(request, env, body.turnstileToken)) return json({ error: "Verification failed. Please try again." }, 403);
  const emailHash = await sha256(email);
  const requestIp = await ipHash(request, env);
  const recent = await env.DB.prepare("SELECT (SELECT COUNT(*) FROM auth_request_log WHERE email_hash = ? AND requested_at > datetime('now', '-15 minutes')) AS email_count, (SELECT COUNT(*) FROM auth_request_log WHERE ip_hash = ? AND requested_at > datetime('now', '-15 minutes')) AS ip_count")
    .bind(emailHash, requestIp).first();
  if (Number(recent.email_count) >= MAX_LINKS_PER_EMAIL || Number(recent.ip_count) >= positiveInteger(env.AUTH_IP_LIMIT_PER_15_MIN, 10)) {
    return json({ error: "Please wait before requesting another link" }, 429);
  }
  await env.DB.prepare("INSERT INTO auth_request_log (id, email_hash, ip_hash) VALUES (?, ?, ?)").bind(id(), emailHash, requestIp).run();
  // Global cap on emails sent, checked before the user lookup so known and unknown addresses get the same answer.
  const sentLastHour = await env.DB.prepare("SELECT COUNT(*) AS count FROM auth_magic_links WHERE created_at > datetime('now', '-1 hour')").first("count");
  if (Number(sentLastHour) >= positiveInteger(env.AUTH_GLOBAL_LINKS_PER_HOUR, 100)) {
    console.warn("Sign-in link cap reached", sentLastHour);
    return json({ error: "Sign-in is busy. Try again later." }, 429);
  }
  let user = await env.DB.prepare("SELECT id FROM auth_users WHERE email = ?").bind(email).first();
  if (!user && env.ALLOW_SELF_SIGNUP !== "true") return json({ ok: true });
  if (!user) {
    user = { id: id() };
    await env.DB.prepare("INSERT INTO auth_users (id, email) VALUES (?, ?)").bind(user.id, email).run();
  }
  const rawToken = token();
  await env.DB.prepare("INSERT INTO auth_magic_links (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .bind(id(), user.id, await sha256(rawToken), future(Number(env.MAGIC_LINK_TTL_MINUTES || 15), 60_000)).run();
  await deliver(env, email, rawToken, body.returnTo);
  await audit(env, user.id, "magic_link_requested");
  return json({ ok: true });
}
function page(status, title, content) {
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + title + "</title><style>body{font-family:system-ui,sans-serif;max-width:28rem;margin:4rem auto;padding:0 1rem;line-height:1.5}button{font:inherit;padding:.6rem 1.2rem;cursor:pointer}</style></head><body><h1>" + title + "</h1>" + content + "</body></html>", {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
    },
  });
}
const invalidLinkPage = () => page(400, "Invalid sign-in link", "<p>This sign-in link is not valid. Request a new one.</p>");
const expiredLinkPage = () => page(401, "Link expired", "<p>This link has expired or was already used. Request a new one.</p>");
// GET only shows a button. Mail scanners that prefetch the link therefore do not use it up.
async function verifyPage(request, env) {
  const url = new URL(request.url);
  const rawToken = url.searchParams.get("token") || "";
  if (!TOKEN_PATTERN.test(rawToken)) return invalidLinkPage();
  const live = await env.DB.prepare("SELECT 1 AS live FROM auth_magic_links WHERE token_hash = ? AND consumed_at IS NULL AND julianday(expires_at) > julianday('now')")
    .bind(await sha256(rawToken)).first("live");
  if (!live) return expiredLinkPage();
  const returnTo = safeReturnPath(url.searchParams.get("returnTo"), env.AUTH_SUCCESS_PATH || "/account");
  return page(200, "Sign in", '<form method="post" action="/api/auth/verify"><input type="hidden" name="token" value="' + escapeHtml(rawToken) + '"><input type="hidden" name="returnTo" value="' + escapeHtml(returnTo) + '"><button type="submit">Sign in</button></form>');
}
async function verify(request, env) {
  if (!isSet(env.APP_ORIGIN)) throw new HttpError(503, "Authentication is not configured: missing APP_ORIGIN");
  if (!isSameOriginRequest(request, env.APP_ORIGIN)) return json({ error: "Origin not allowed" }, 403);
  const type = request.headers.get("Content-Type") || "";
  const fromForm = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  const input = fromForm ? Object.fromEntries(await request.formData()) : await request.json().catch(() => null);
  const rawToken = typeof input?.token === "string" ? input.token : "";
  if (!TOKEN_PATTERN.test(rawToken)) return fromForm ? invalidLinkPage() : json({ error: "Invalid sign-in link" }, 400);
  // One statement checks expiry and consumes the link, so it cannot be used twice.
  const link = await env.DB.prepare("UPDATE auth_magic_links SET consumed_at = CURRENT_TIMESTAMP WHERE token_hash = ? AND consumed_at IS NULL AND julianday(expires_at) > julianday('now') RETURNING user_id")
    .bind(await sha256(rawToken)).first();
  if (!link) return fromForm ? expiredLinkPage() : json({ error: "This link has expired or was already used" }, 401);
  const sessionValue = token();
  const days = Number(env.SESSION_TTL_DAYS || 30);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO auth_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)").bind(id(), link.user_id, await sha256(sessionValue), future(days, 86_400_000)),
    env.DB.prepare("UPDATE auth_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(link.user_id),
  ]);
  await audit(env, link.user_id, "magic_link_consumed");
  const cookie = sessionCookie(env, sessionValue, days * 86_400);
  if (fromForm) {
    const returnTo = safeReturnPath(input.returnTo, env.AUTH_SUCCESS_PATH || "/account");
    return new Response(null, { status: 303, headers: { Location: new URL(returnTo, origin(env)).href, "Set-Cookie": cookie, "Cache-Control": "no-store" } });
  }
  return json({ ok: true }, 200, { "Set-Cookie": cookie });
}
async function session(request, env) {
  const user = await findSessionUser(request, env);
  return user ? json({ user }) : json({ user: null }, 401);
}
async function logout(request, env) {
  const rawToken = sessionToken(request);
  if (rawToken) await env.DB.prepare("UPDATE auth_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(await sha256(rawToken)).run();
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(env, "", 0) });
}
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    try {
      // Handlers are awaited so their errors reach the catch below.
      if (request.method === "POST" && path === "/api/auth/request-link") return await requestLink(request, env);
      if (request.method === "GET" && path === "/api/auth/verify") return await verifyPage(request, env);
      if (request.method === "POST" && path === "/api/auth/verify") return await verify(request, env);
      if (request.method === "GET" && path === "/api/auth/session") return await session(request, env);
      if (request.method === "POST" && path === "/api/auth/logout") return await logout(request, env);
      if (request.method === "GET" && path === "/health") {
        const missing = validateConfiguration(env);
        return json({ ok: missing.length === 0, module: "cloudflare-magic-link-auth", missing }, missing.length ? 503 : 200);
      }
      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof HttpError || error instanceof AuthError) return json({ error: error.message }, error.status);
      console.error(error);
      return json({ error: "Unexpected authentication error" }, 500);
    }
  },
};
