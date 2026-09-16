# Content CMS Setup

This is the end-to-end setup checklist for the Friends of WDAC site-content CMS.

It covers:

- Cloudflare setup
- Wrangler auth
- KV and email bindings
- secrets and config values
- Worker and Pages deploys
- admin bootstrap
- smoke testing for all CMS phases

## What this CMS covers

The site-content CMS is field-based. It edits key copy and CTA fields without changing page layout.

Supported pages:

- Phase 1: `home`, `about`
- Phase 2: `membership`, `donate`
- Phase 3: `history`, `docs`, `news`

Not in this CMS right now:

- legal and policy pages such as Privacy, Terms, Accessibility Statement, and Donation Policy
- newsletter sending infrastructure
- dynamic list content like the full News timeline or Docs library entries

## 1. Prerequisites

You need:

- a Cloudflare account with access to the Friends of WDAC zone/project
- Node.js and npm
- permission to deploy the Worker and Pages project
- access to the approved admin email inbox if you want to test password reset

Recommended local tools:

- PowerShell
- `npx wrangler`

From the repo root used in this guide:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
```

## 2. Cloudflare pieces used by this repo

This repo uses:

- Cloudflare Pages for the static site in `public`
- one Cloudflare Worker named `friendsofwadc-subscribe`
- one KV namespace bound as `SUBSCRIBERS`
- Cloudflare `send_email` bindings for contact and admin reset email flows

The current Worker config is in `wrangler.toml`.

## 3. Sign in to Cloudflare from Wrangler

For local/manual deployment, the simplest path is browser auth:

```powershell
npx wrangler login
npx wrangler whoami
```

If you deploy from CI instead, you can use a Cloudflare API token instead of `wrangler login`.

Recommended token scope for CI should include the minimum needed to:

- deploy Workers
- update KV bindings if needed
- deploy Pages

For local work, you do not need a separate API key if `wrangler login` is working.

## 4. Verify `wrangler.toml`

Open `wrangler.toml` and verify these values:

```toml
name = "friendsofwadc-subscribe"
main = "workers/subscribe.js"
account_id = "76aabaa129c678bccd33db90833b8232"
```

Also verify the KV binding exists:

```toml
kv_namespaces = [
  { binding = "SUBSCRIBERS", id = "45958fcabdd3437fbb30845d9541d46f" }
]
```

If you create a new namespace, replace the `id` with the new one.

## 5. Verify or create the KV namespace

To create a new namespace if required:

```powershell
npx wrangler kv namespace create SUBSCRIBERS
```

Then copy the returned namespace ID into `wrangler.toml`.

## 6. Verify email bindings in Cloudflare

The Worker config expects these bindings:

- `CONTACT_EMAIL`
- `ADMIN_RESET_EMAIL`

Current config:

```toml
[[send_email]]
name = "CONTACT_EMAIL"
destination_address = "contact@friendsofwdac.org"

[[send_email]]
name = "ADMIN_RESET_EMAIL"
allowed_destination_addresses = [ "shannonborntrager@gmail.com", "contact@friendsofwdac.org" ]
```

What to verify in Cloudflare:

1. Email Routing / Email Workers is enabled for the domain as needed.
2. The destination email addresses are valid and verified.
3. Reset emails are allowed to reach the listed destination addresses.

If reset email is not important for the first deploy, the CMS can still work as long as admin login and `ADMIN_SESSION_SECRET` are configured.

## 7. Review non-secret environment variables

The Worker reads these values from `wrangler.toml` `[vars]`:

```toml
ALLOWED_ORIGIN = "https://friendsofwadc.org,https://www.friendsofwadc.org,https://friendsofwadc.org,https://www.friendsofwadc.org"
ADMIN_ALLOWED_EMAILS = "shannonborntrager@gmail.com,contact@friendsofwdac.org"
ADMIN_SITE_URL = "https://friendsofwadc.org"
ADMIN_RESET_FROM_EMAIL = "contact@friendsofwdac.org"
CONTACT_FORM_TO_EMAIL = "contact@friendsofwdac.org"
CONTACT_FORM_FROM_EMAIL = "contact@friendsofwdac.org"
```

What each one does:

- `ALLOWED_ORIGIN`: which browser origins can call the Worker
- `ADMIN_ALLOWED_EMAILS`: who is allowed to create and use admin accounts
- `ADMIN_SITE_URL`: base URL used in admin flows like reset links
- `ADMIN_RESET_FROM_EMAIL`: sender address used for reset-related email behavior
- `CONTACT_FORM_TO_EMAIL`: where contact-form messages should go
- `CONTACT_FORM_FROM_EMAIL`: the sender identity used for contact-form email behavior

Before deploy, confirm `ALLOWED_ORIGIN` includes every site origin you will actually use.

## 8. Set required secrets

Required:

```powershell
npx wrangler secret put ADMIN_SESSION_SECRET
```

Optional but recommended:

```powershell
npx wrangler secret put ADMIN_RESET_SECRET
```

What they do:

- `ADMIN_SESSION_SECRET`: signs admin auth/session tokens
- `ADMIN_RESET_SECRET`: gives reset-token generation a separate secret boundary

There is no separate CMS API key you need to create for content editing.

The CMS admin API uses the same admin login token returned by:

- `POST /admin/login`

## 9. Deploy the Worker

From the site folder:

```powershell
npx wrangler deploy
```

Useful follow-up:

```powershell
npx wrangler tail friendsofwadc-subscribe
```

Use `tail` if the admin UI or public content fetches start returning unexpected 4xx/5xx errors.

## 10. Deploy Cloudflare Pages

The Pages output directory is already configured in `wrangler.pages.toml`:

```toml
pages_build_output_dir = "public"
```

If you deploy Pages with Wrangler:

```powershell
npx wrangler pages deploy public
```

If Pages is already connected through the Cloudflare dashboard, use your normal production workflow instead.

Important:

- Deploying Pages updates the HTML, CSS, and browser JavaScript only.
- Deploying Pages does not update the CMS API routes in the Worker.
- If you change `workers/subscribe.js`, you must also run `npx wrangler deploy` from the `site` folder.

## 11. Create or verify an admin account

The content CMS uses the same admin auth system as the rest of the admin page.

Typical first-time flow:

1. Open `/admin/`.
2. Use an email that appears in `ADMIN_ALLOWED_EMAILS`.
3. Create the admin account if one does not exist yet.
4. Sign in.
5. Open the `Site Content CMS` panel.

If signup is disabled because an account already exists, use an approved existing admin account instead.

## 12. Verify the CMS with the smoke test script

The repo includes a generic CMS smoke test:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1
```

Default behavior:

- logs in
- loads the `home` draft
- updates one editable field
- publishes that page
- checks the public endpoint for the new value

Examples for later phases:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page membership
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page donate
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page history
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page docs
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page news
```

The script automatically uses the correct phase for the page you choose.

## 13. Verify from the admin UI

Manual admin verification:

1. Open `/admin/`.
2. Sign in.
3. Go to `Site Content CMS`.
4. Choose a page.
5. Click `Load content`.
6. Change a field.
7. Click `Save draft`.
8. Click `Publish`.
9. Open the public page and confirm the change appears.

## 14. Endpoint reference

Admin endpoints:

- `GET /admin/content/pages/{page}?phase={phase}&view=draft`
- `PUT /admin/content/pages/{page}?phase={phase}`
- `POST /admin/content/pages/{page}/publish?phase={phase}`

Public endpoint:

- `GET /content/pages/{page}?view=published&phase={phase}`

Phase map:

- Phase 1: `home`, `about`
- Phase 2: `membership`, `donate`
- Phase 3: `history`, `docs`, `news`

The phase must match the page. The Worker rejects mismatched page/phase pairs.

## 15. Troubleshooting checklist

If admin content calls fail:

1. Confirm `ADMIN_SESSION_SECRET` is set.
2. Confirm the admin email is listed in `ADMIN_ALLOWED_EMAILS`.
3. Confirm the browser origin is listed in `ALLOWED_ORIGIN`.
4. Confirm the Worker deploy completed successfully.
5. Confirm the public page includes the CMS metadata and content hooks.
6. Check live logs with `npx wrangler tail friendsofwadc-subscribe`.

If public pages do not update:

1. Make sure you clicked `Publish`, not only `Save draft`.
2. Confirm the page is one of the supported CMS pages.
3. Confirm the page is requesting the correct phase.
4. Confirm the public HTML was deployed to Pages after the CMS hooks were added.

If password reset emails do not arrive:

1. Verify Cloudflare Email Routing / email binding setup.
2. Verify the destination addresses are allowed and verified.
3. Confirm `ADMIN_RESET_EMAIL` is configured in `wrangler.toml`.

## 16. Related repo docs

- `CONTENT_PHASE1_BACKEND_QUICKSTART.md`
- `CLOUDFLARE_COMMANDS.md`
- `FORMS_AND_ADMIN_SETUP.md`