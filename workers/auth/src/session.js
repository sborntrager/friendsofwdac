// Shared session check for modules that sit on top of cloudflare-magic-link-auth.
// Other modules import this file (or copy it) instead of writing their own session
// query. See README "Using sessions from other modules".
const encoder = new TextEncoder();

export const SESSION_COOKIE = "auth_session";
export const ROLES = ["member", "editor", "admin"];

export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

// Bearer token first (API clients), then the auth_session cookie (browsers).
export function sessionToken(request) {
  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7) || null;
  const prefix = SESSION_COOKIE + "=";
  return (request.headers.get("Cookie") || "").split(";").map(part => part.trim()).find(part => part.startsWith(prefix))?.slice(prefix.length) || null;
}

// Returns { id, email, role } for a live session, or null. expires_at is ISO 8601,
// so it is compared as time with julianday(), never as text.
export async function findSessionUser(request, env) {
  const raw = sessionToken(request);
  if (!raw) return null;
  return env.DB.prepare("SELECT u.id, u.email, u.role FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.revoked_at IS NULL AND julianday(s.expires_at) > julianday('now')")
    .bind(await sha256(raw)).first();
}

// Throws AuthError(401) without a live session and AuthError(403) when the role is
// not in `roles`. Pass no roles to accept any signed-in user.
export async function requireUser(request, env, roles = ROLES) {
  if (!sessionToken(request)) throw new AuthError(401, "Sign in required");
  const user = await findSessionUser(request, env);
  if (!user) throw new AuthError(401, "Session expired or invalid");
  if (!roles.includes(user.role)) throw new AuthError(403, "Insufficient access");
  return user;
}

// For state-changing requests: false when a browser says the request came from
// another origin or site. Clients without browser headers (scripts) pass.
export function isSameOriginRequest(request, appOrigin) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(appOrigin).origin) return false;
  const site = request.headers.get("Sec-Fetch-Site");
  return !site || site === "same-origin" || site === "none";
}
