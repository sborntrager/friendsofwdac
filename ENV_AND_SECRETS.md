# Keys and secrets for Friends of WDAC

Updated 2026-11-04. Account `bae208b2f47b7699b7bb53fd6bb589fb` (friendsofwdac@atomicmail.io).

**Never write a real value in this file.** It records what is needed and where to put it. Enter each
secret at the `wrangler secret put` prompt. Keep the real values in the organization's credential
register.

Status key:
- `[x]` set and verified in the account
- `[ ] ENTER` you must supply the value
- `[ ] OPTIONAL` only if you want the feature

Every command runs from `site/`. Before any command, confirm the login with `npx wrangler whoami`
and set `CLOUDFLARE_ACCOUNT_ID=bae208b2f47b7699b7bb53fd6bb589fb`. The default wrangler login on this
machine may point at another client's account.

---

## 1. Worker `friendsofwdac-subscribe` (admin API, forms, newsletter)

Config: `wrangler.toml`. Set a secret with:
`npx wrangler secret put NAME --config wrangler.toml`

| Done | Secret | What it is | Where to get it |
|------|--------|------------|-----------------|
| [x] | `ADMIN_SESSION_SECRET` | Signs admin sessions | Set |
| [x] | `ADMIN_RESET_SECRET` | Signs password-reset links | Set |
| [x] | `ZOHO_CLIENT_ID` | Zoho OAuth client ID. **Same value as the old account** | Old Worker's saved copy, or the existing Zoho client in api-console.zoho.com |
| [x] | `ZOHO_CLIENT_SECRET` | Zoho OAuth client secret. **Same value as the old account** | Same existing Zoho client |
| [x] | `ZOHO_TOKEN_ENCRYPTION_KEY` | Encrypts the stored Zoho refresh token. **Must be the old value**, or the saved token cannot be decrypted | Old credential register. Generate a new one only if you reconnect Zoho: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| [ ] OPTIONAL | `ZOHO_MAIL_ACCOUNT_ID` | Pins one Zoho mailbox | Zoho Mail API, Accounts. Leave unset to use the default mailbox |
| [ ] OPTIONAL | `ZOHO_REDIRECT_URI` | Overrides the OAuth callback | Default `https://friendsofwdac.org/admin/mail/callback`. Register this exact URL in the Zoho client |
| [ ] OPTIONAL | `ADMIN_SUPPORT_FROM_EMAIL` | Sender for admin support mail | Falls back to `CONTACT_FORM_FROM_EMAIL` |

`ADMIN_PASSPHRASE` is an old fallback for the three secrets above. Do not set it.

Non-secret values already in `wrangler.toml`: `ALLOWED_ORIGIN`, `ADMIN_ALLOWED_EMAILS`,
`ADMIN_SITE_URL`, `ADMIN_RESET_FROM_EMAIL`, `CONTACT_FORM_TO_EMAIL`, `CONTACT_FORM_FROM_EMAIL`,
`ADMIN_SUPPORT_TO_EMAIL`, `ZOHO_ACCOUNTS_BASE_URL`, `ZOHO_MAIL_BASE_URL`, `ZOHO_OAUTH_SCOPE`,
`ZOHO_FROM_EMAIL`.

Check each before launch:
- [ ] ENTER `ADMIN_ALLOWED_EMAILS` lists only the people who may sign in to `/admin`.
- [ ] ENTER `ZOHO_ACCOUNTS_BASE_URL` and `ZOHO_MAIL_BASE_URL` match the Zoho data center of the
      mailbox (`.com` is US. EU is `.eu`, India `.in`, and so on).

## 2. Worker `friendsofwdac-buffer-social` (Buffer posting)

Config: `wrangler.buffer-social.toml`. Set a secret with:
`npx wrangler secret put NAME --config wrangler.buffer-social.toml`

| Done | Secret | What it is | Where to get it |
|------|--------|------------|-----------------|
| [x] | `BUFFER_API_KEY` | Buffer API access | Set. Rotate at once if it leaks or an admin leaves |

Non-secret values in `wrangler.buffer-social.toml`, all set:
- [x] `BUFFER_ORGANIZATION_ID`
- [x] `PUBLIC_MEDIA_BASE_URL` (`https://media.friendsofwdac.org`)

## 3. Worker `friendsofwdac-auth` (magic-link sign-in)

Config: `wrangler.auth.toml`. Set a secret with:
`npx wrangler secret put NAME --config wrangler.auth.toml`

| Done | Secret | What it is | Where to get it |
|------|--------|------------|-----------------|
| [x] | `AUTH_IP_HASH_SECRET` | Hashes IPs for rate limits | Set |
| [ ] OPTIONAL | `TURNSTILE_SECRET` | Cloudflare Turnstile secret key | Only if you set `TURNSTILE_ENABLED = "true"`. Cloudflare dashboard, Turnstile |

Sign-in links are sent through Cloudflare Email Service (`AUTH_EMAIL`). There is no key to enter.
Use of this Worker is on hold. Social posting uses the existing admin login.

## 4. Cloudflare account setup that is not a key

- [ ] ENTER Email Sending: onboard `friendsofwdac.org` in Cloudflare (Email, Email Sending). Until
      then, mail reaches only verified destination addresses in this account.
- [ ] ENTER Email Routing: confirm `contact@friendsofwdac.org` is a verified destination.
- [x] R2 bucket `friendsofwdac-social-media` and domain `media.friendsofwdac.org`.
- [x] KV `friendsofwdac-subscribers` (`0445d85134e645e9873716de86555871`).
- [x] D1 `friendsofwdac-admin` (`a6756294-1c90-417e-8f50-50fd682f33ac`).

## 5. Zoho connection

No Zoho console change and no reconnect. The redirect URI is the same, and the migrated KV already
holds the connection record (`admin:zoho:connection`, mailbox `contact@friendsofwdac.org`, status
connected). The Worker secrets do not copy across accounts, so enter the same three values as the old
Worker (section 1). Then check `GET /admin/mail/status` (signed in) reports connected.

If the old encryption key is lost, set a new one and use Connect Zoho in `/admin` once.

## 6. Check what is set

```bash
npx wrangler secret list --name friendsofwdac-subscribe
npx wrangler secret list --name friendsofwdac-buffer-social
npx wrangler secret list --name friendsofwdac-auth
```

This lists names only, never values.
