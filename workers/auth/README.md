# Cloudflare magic-link auth

Passwordless sign-in for Cloudflare Workers. Users get a one-time link by email, sent
through Cloudflare Email Service (a `send_email` binding) or through Resend. Users, links,
sessions and audit events live in D1. Every other
module in this library reads this module's `auth_users` and `auth_sessions` tables, and
should check sessions with [`src/session.js`](src/session.js).

Status: in progress (version 0.3.0). The behavior below passes the module's unit tests
(`npm test`). Those tests run on a D1 stand-in, not on Cloudflare, so do the live checks in
[Before production](#before-production).

## Routes

All JSON responses use `Cache-Control: no-store`. Errors look like `{ "error": "..." }`.

| Method | Path | Request | Success |
|---|---|---|---|
| POST | `/api/auth/request-link` | JSON `{ email, returnTo?, turnstileToken? }` | `200 {ok: true}`, also for unknown addresses |
| GET | `/api/auth/verify?token=&returnTo=` | none (this is the link in the email) | `200` HTML page with a **Sign in** button. It does not use up the link. |
| POST | `/api/auth/verify` | form `token`, `returnTo` (from the page), or JSON `{ token }` | form: `303` to `returnTo` with the session cookie. JSON: `200 {ok: true}` with the cookie. |
| GET | `/api/auth/session` | cookie or `Authorization: Bearer` | `{ user: { id, email, role } }`, or `401` |
| POST | `/api/auth/logout` | cookie or Bearer | `{ok: true}` and a cleared cookie |
| GET | `/health` | none | `{ok, module, missing: []}`, or `503` with the missing names |

Error codes for `request-link`:
- `400`: bad email or not a JSON object.
- `403`: foreign origin, or failed Turnstile.
- `429`: per-address, per-IP or global limit reached.
- `502`: the email provider refused the email.
- `503`: not configured, or Turnstile unreachable.

Error codes for `verify`:
- `400`: malformed token.
- `401`: expired or already used.
- `403`: foreign origin.

`returnTo` is limited to `/account` and `/admin`. Any other value falls back to
`AUTH_SUCCESS_PATH`.

### Why the link opens a page instead of signing in directly

Many mail systems fetch every link in an email before the user clicks (for example
Microsoft Safe Links and corporate scanners). If `GET` used up the link, those scanners
would spend it, and the user's real click would fail. So `GET` only shows a button, and the
link is used up only by the `POST` that the button sends.

The page is served with `Cache-Control: no-store`, `Referrer-Policy: no-referrer` and a
CSP that allows only an inline style and a form post to the same origin.

## Configuration

| Name | Kind | Required | Meaning |
|---|---|---|---|
| `DB` | D1 binding | yes | The shared project database. |
| `APP_ORIGIN` | var | yes | The exact site origin, for example `https://www.example.com`. It is used to build links and cookies and to check `Origin`. |
| `AUTH_EMAIL` | `send_email` binding | no | When present, links are sent through Cloudflare Email Service and the Resend settings are not used. |
| `AUTH_FROM_EMAIL` | var | with `AUTH_EMAIL` | The sender address, on a domain set up for Cloudflare Email Service, for example `contact@example.com`. |
| `AUTH_FROM_NAME` | var | no | Display name for that sender, for example `Example Org`. |
| `RESEND_API_KEY` | **secret** | without `AUTH_EMAIL` | Resend API key with sending access. |
| `RESEND_FROM_EMAIL` | var | without `AUTH_EMAIL` | A sender on a domain verified in Resend, for example `Sign in <login@mail.example.com>`. |
| `ALLOW_SELF_SIGNUP` | var | no | Default `"false"`: only existing `auth_users` rows get links. `"true"` creates a `member` for any new address. |
| `AUTH_SUCCESS_PATH` | var | no | Where the user goes after signing in. Default `/account`. |
| `MAGIC_LINK_TTL_MINUTES` | var | no | Default `15`. |
| `SESSION_TTL_DAYS` | var | no | Default `30`. |
| `AUTH_IP_LIMIT_PER_15_MIN` | var | no | Link requests allowed per IP in 15 minutes. Default `10`. |
| `AUTH_GLOBAL_LINKS_PER_HOUR` | var | no | Emails sent per hour across the whole site. Default `100`. |
| `TURNSTILE_ENABLED` | var | no | `"true"` requires a Turnstile token on `request-link`. |
| `TURNSTILE_SECRET` | **secret** | when Turnstile is on | Turnstile widget secret key. |
| `AUTH_IP_HASH_SECRET` | **secret** | no, recommended | Makes the stored IP hash a keyed HMAC. Without it, stored IP hashes are plain SHA-256 and can be reversed. |

Limits:
- **Per address:** 5 link requests per 15 minutes. This is fixed.
- **Per IP and global:** set by the variables in the table above.

The global cap counts emails actually sent in the last hour. It is checked before the user
lookup, so known and unknown addresses get the same answer. When the cap is reached, every
request gets `429` until the hour rolls over. The cap protects the sender's reputation
from scripted abuse. A value that is empty or still starts with `replace-with-` counts as
missing.

## Setup

Run these commands from the host project, signed in to **the project's own Cloudflare
account**. Before you create anything, run `npx wrangler whoami` and confirm the account. If
Wrangler is signed in to another account, use a scoped `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` for the right one. See `CLOUDFLARE_ACCOUNT_TRANSFER_PLAYBOOK.md` in
the module library.

1. **Copy the module** into the project, for example to `workers/auth`. Replace every
   `replace-with-...` value in `wrangler.jsonc`.
2. **Create the shared database:** `npx wrangler d1 create <project-db>`. Put its name and
   `database_id` in this `wrangler.jsonc` and in every other module's `wrangler.jsonc`.
3. **Apply the migrations,** before any other module's: `npm run migrate:remote` (that is,
   `wrangler d1 migrations apply DB --remote`). This applies `0001_auth.sql` and
   `0002_auth_request_ip.sql`.
4. **Set up the email sender.** Choose one.
   - **Cloudflare Email Service** (no third party, no API key). Add
     `"send_email": [{ "name": "AUTH_EMAIL" }]` to `wrangler.jsonc`, and set
     `AUTH_FROM_EMAIL` (and optionally `AUTH_FROM_NAME`). The sender's domain must use
     Cloudflare DNS in the same account. Until the domain is onboarded to Email Sending
     (`npx wrangler email sending enable example.com`, which adds records on the
     `cf-bounce` subdomain and leaves the domain's own MX records alone), links reach only
     verified destination addresses. That is enough for a small staff list.
   - **Resend.** In Resend, open Domains, then Add domain. Add the SPF and DKIM DNS
     records it shows, and wait until the domain is verified. Then create an API key with
     sending access: `npx wrangler secret put RESEND_API_KEY`, and set
     `RESEND_FROM_EMAIL` to an address on the verified domain.
5. **Optional: set up Turnstile.** In the Cloudflare dashboard, open Turnstile, then Add
   widget, for the site's hostname.
   - Put the site key in the sign-in page.
   - `npx wrangler secret put TURNSTILE_SECRET`
   - Set `TURNSTILE_ENABLED` to `"true"`.
   - Send the widget's token as `turnstileToken` (see the example below).
6. **Recommended: protect stored IP hashes.**
   `npx wrangler secret put AUTH_IP_HASH_SECRET`, with any long random string.
7. **Route the Worker on the site origin.** Set `routes` to
   `www.example.com/api/auth/*`, with `zone_name` set to the zone, and set `APP_ORIGIN` to
   `https://www.example.com`. The session cookie is host-only and there is no CORS, so the
   sign-in form, the link page and the other modules' admin pages must all be on this one
   origin.
8. **Deploy** with `npx wrangler deploy`. Check that `GET /health` returns `"ok":true`. It
   can be reached in `wrangler dev`, or on the `workers.dev` URL while that is enabled.
9. **Create the first admin.** New users are `member`s, and other modules need `editor` or
   `admin`. Run this once, with your own address:

   ```bash
   npx wrangler d1 execute DB --remote --command "INSERT INTO auth_users (id, email, role) VALUES (lower(hex(randomblob(16))), 'owner@example.com', 'admin') ON CONFLICT(email) DO UPDATE SET role = 'admin'"
   ```

   Then sign in with that address. After that, give other people roles with
   `operations-admin` (`PATCH /api/admin/users/:id`), or with the same command and a
   different role.

### Local development

- Put the secrets in `.dev.vars` (`RESEND_API_KEY=...`), and add `.dev.vars*` and
  `.wrangler/` to the host project's `.gitignore`.
- Share one local database with the other modules by using the same persistence folder
  everywhere: `npx wrangler d1 migrations apply DB --local --persist-to ../.wrangler-state`,
  then `npx wrangler dev --persist-to ../.wrangler-state`.
- Run the bootstrap command with `--local --persist-to ../.wrangler-state` instead of
  `--remote`.
- In Astro, proxy `/api/auth` to `wrangler dev` (for example
  `vite.server.proxy["/api/auth"] = "http://localhost:8787"`) so the browser sees one
  origin. Keep `APP_ORIGIN` set to `http://localhost:4321`.

### Example sign-in form

```html
<form id="sign-in">
  <input type="email" name="email" required>
  <!-- Only when TURNSTILE_ENABLED is "true": -->
  <div class="cf-turnstile" data-sitekey="replace-with-turnstile-site-key"></div>
  <button>Email me a link</button>
</form>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<script>
  document.getElementById("sign-in").addEventListener("submit", async event => {
    event.preventDefault();
    const form = new FormData(event.target);
    await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), returnTo: "/admin", turnstileToken: form.get("cf-turnstile-response") }),
    });
  });
</script>
```

## Using sessions from other modules

Other modules should not write their own session SQL. Instead, they import
[`src/session.js`](src/session.js). Wrangler bundles relative imports, so the path can point
at this folder:

```js
import { AuthError, isSameOriginRequest, requireUser } from "../../auth/src/session.js";

// In a handler:
if (request.method !== "GET" && !isSameOriginRequest(request, env.APP_ORIGIN)) throw new HttpError(403, "Origin not allowed");
const user = await requireUser(request, env, ["editor", "admin"]); // AuthError 401 or 403

// In the router's catch:
if (error instanceof HttpError || error instanceof AuthError) return json({ error: error.message }, error.status);
```

If a module must stay self-contained, copy `session.js` into it unchanged and keep the
copy in step with this one.

The helper exports:
- **`sessionToken(request)`:** returns the Bearer token, or else the `auth_session` cookie.
- **`findSessionUser(request, env)`:** returns `{ id, email, role }` or `null`. It compares
  expiry as time, using `julianday`.
- **`requireUser(request, env, roles)`:** returns the user, or throws `AuthError` 401 or 403.
- **`isSameOriginRequest(request, appOrigin)`:** returns `false` for a foreign `Origin`, or
  for `Sec-Fetch-Site` set to `same-site` or `cross-site`. Use it on every state-changing
  route.
- **`AuthError`** (has `.status`), **`SESSION_COOKIE`**, **`ROLES`** and **`sha256`**.

## Upgrade note (0.2.0 → 0.3.0)

Nothing is required. 0.3.0 adds the optional Cloudflare Email Service sender
(`AUTH_EMAIL`, `AUTH_FROM_EMAIL`, `AUTH_FROM_NAME`). Without an `AUTH_EMAIL` binding the
module sends through Resend exactly as before.

## Upgrade note (0.1.0 → 0.2.0)

A site already using 0.1.0 must:

1. **Apply migration `0002_auth_request_ip.sql`** (`npm run migrate:remote`). It adds
   `auth_request_log.ip_hash` and two indexes. Until it is applied, `request-link` fails,
   because the column does not exist.
2. **Expect the new sign-in step.** The link in the email now opens a page with a
   **Sign in** button, and only the button's `POST /api/auth/verify` signs in. Links that
   were already sent keep working; they land on the page.
   - Code that called `GET /api/auth/verify` expecting a redirect or JSON must
     `POST /api/auth/verify` with `{ token }` instead.
   - The page and its POST must be served on `APP_ORIGIN`, because the POST checks
     `Origin`.
3. **Check sign-up.** `wrangler.jsonc` now ships `ALLOW_SELF_SIGNUP: "false"`; 0.1.0
   shipped `"true"`. A site that relies on open sign-up must set `"true"` itself, and should
   then turn on Turnstile.
4. **Set `RESEND_FROM_EMAIL` in `vars`** (it was already required). Any value still
   starting with `replace-with-` now counts as missing, so the module returns `503`.
5. **Keep the sign-in form on `APP_ORIGIN`.** `request-link` and the verify `POST` now also
   refuse requests whose `Sec-Fetch-Site` is `same-site` or `cross-site`, so a sign-in form
   on a sibling subdomain stops working.
6. **Expect some sign-outs.** Expiry is now exact. Sessions and links that had expired
   earlier the same UTC day (wrongly accepted by 0.1.0) are now refused, so some users
   will be signed out once.
7. **Nothing else changes for existing users.** The cookie name, cookie attributes and
   existing sessions stay the same. The new variables have safe defaults when they are
   missing.

## Security notes

- **Tokens.** Link and session tokens are 32 random bytes and are stored only as SHA-256
  hashes. A link is used up by one `UPDATE … RETURNING` that also checks expiry, so two
  racing POSTs cannot both sign in.
- **Cookie.** `HttpOnly; SameSite=Lax; Path=/`, plus `Secure` when `APP_ORIGIN` is
  `https`.
- **Unknown addresses** get the same `{ok: true}` as known ones.
- **API keys.** The Resend and Turnstile secrets are read only from the Worker
  environment. Resend error bodies are logged truncated, and keys are never logged.
- **Roles** (`member`, `editor`, `admin`) are read from `auth_users` on every request, so a
  role change applies at once.

## Testing

```bash
npm test        # node:test suite, 34 tests, no dependencies
npm run check   # syntax check of the Worker, the helper and the tests
```

The tests run `src/index.js` and `src/session.js` against:
- `node:sqlite` through a small D1 stand-in (`test/d1-shim.js`). It has foreign keys on,
  transactional `batch()` and D1's 100 bound-parameter limit.
- A mocked Resend, Turnstile and `send_email` binding.

They do not prove behavior on workerd, on real D1, or against the live Resend or Turnstile
APIs.

### Before production

1. Sign in once with a real inbox, including one that runs a link scanner (for example
   Outlook), and confirm that the button page appears and the sign-in works.
2. Turn on Turnstile and confirm that a request without a token gets `403`.
3. Confirm that `GET /health` reports nothing missing.

## Removal

Remove the routes and delete the Worker. Do this only after every module that depends on
this one has been removed. Then drop `auth_audit_events`, `auth_request_log`,
`auth_sessions`, `auth_magic_links` and `auth_users`, and delete their rows from
`d1_migrations`.

## Known limitations

These are open review findings 7–11 and other known gaps. They are not fixed yet.

- **Config values are not validated.** A non-numeric `MAGIC_LINK_TTL_MINUTES` or
  `SESSION_TTL_DAYS`, or a malformed `APP_ORIGIN`, causes a `500` instead of a clear
  configuration error.
- **Timing.** When sign-up is off, an unknown address skips the Resend call, so its reply
  comes back faster than a known address's reply.
- **No cleanup.** Old rows in `auth_request_log`, `auth_magic_links`, `auth_sessions` and
  `auth_audit_events` are never deleted.
- **Session hardening.**
  - The cookie has no `__Host-` prefix.
  - There is no session rotation or idle timeout (30 days fixed).
  - `logout` has no Origin check (`SameSite=Lax` already blocks cross-site logout).
  - The link pages are plain and unbranded.
- **Different database placeholder.** The D1 placeholder name `replace-with-project-auth`
  differs from the other modules' placeholders, though all of them must name the same
  database.
- **Turnstile.** `hostname` and `action` in the Turnstile reply are not checked.
- **Global cap.** When `ALLOW_SELF_SIGNUP` is `"true"`, a script can use up the global
  hourly cap and block sign-in for everyone for up to an hour. That is the trade-off for
  protecting the sender. Keep Turnstile on in that setup.
