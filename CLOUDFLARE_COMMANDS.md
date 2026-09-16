# Cloudflare Commands (FriendsOfWADC)

Common commands for this project.

## Auth

```powershell
npx wrangler login
npx wrangler whoami
npx wrangler logout
```

## Pages (project: `wadc`)

This repo has a Worker `wrangler.toml` inside `site`, so run Pages deploy from the parent folder.

`site/wrangler.pages.toml` is configured for the public site, but for direct `wrangler pages deploy` uploads you should point at `site/public`.

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC
npx wrangler pages deploy .\site\public --project-name=wadc
```

Alternative from inside `site`:

```powershell
npx wrangler --cwd .. pages deploy .\site\public --project-name=wadc
```

List Pages projects:

```powershell
npx wrangler pages project list
```

List deployments for `wadc`:

```powershell
npx wrangler pages deployment list --project-name=wadc
```

Local Pages preview:

```powershell
npx wrangler pages dev .\site\public
```

## Worker (email signup + forms + admin)

Deploy Worker defined in `wrangler.toml`:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
cmd /c npx wrangler deploy --config .\wrangler.toml
```

This is the same Worker used for:

- homepage email signup
- homepage contact form email
- membership form submissions
- general donation form submissions
- admin account signup for approved emails
- admin login
- admin password reset emails
- admin password reset completion
- admin dashboard loading
- admin password changes

Tail Worker logs:

```powershell
cmd /c npx wrangler tail friendsofwadc-subscribe --config .\wrangler.toml
```

Set a Worker secret:

```powershell
npx wrangler secret put <SECRET_NAME>
```

Email sending binding for homepage contact form is configured in `wrangler.toml` as `CONTACT_EMAIL`.
Cloudflare Email Service / Email Routing for the domain must be set up before that endpoint will work.

Password reset email sending for admin accounts is configured in `wrangler.toml` as `ADMIN_RESET_EMAIL`.
The destination emails must be verified in Cloudflare Email Routing before reset emails will arrive.

Admin dashboard secrets for `workers/subscribe.js`:

```powershell
npx wrangler secret put ADMIN_SESSION_SECRET
```

Optional extra separation for reset tokens:

```powershell
npx wrangler secret put ADMIN_RESET_SECRET
```

## Content CMS (Phases 1-3)

Deploy updated Worker routes:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
cmd /c npx wrangler deploy --config .\wrangler.toml
```

Run backend smoke test (login, draft save, publish, public verify):

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1
```

Quickstart guide:

- `CONTENT_PHASE1_BACKEND_QUICKSTART.md`
- `CONTENT_CMS_SETUP.md`
