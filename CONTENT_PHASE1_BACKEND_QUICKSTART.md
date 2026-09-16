# Content CMS Backend Quickstart

This quickstart covers the minimum steps to activate and verify the site-content CMS endpoints across phases 1 through 3.

## 1) Deploy the Worker

From the site folder:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler deploy
```

## 2) Run the one-command smoke test

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1
```

Optional examples for later phases:

```powershell
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page membership
powershell -ExecutionPolicy Bypass -File .\verify-content-phase1.ps1 -Page history
```

It will prompt for admin email/password, then automatically:

- logs in
- loads the selected page draft
- saves a small draft update
- publishes the selected page
- verifies the public endpoint returns the new published value

## 3) Open admin and use Site Content

- Open `/admin/`
- Sign in
- Go to **Site Content CMS**
- Pick any supported page
- Save draft and Publish

## 4) If the smoke test fails

Check Worker logs:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler tail friendsofwadc-subscribe
```

Common checks:

- `ADMIN_SESSION_SECRET` exists and is valid.
- `ALLOWED_ORIGIN` includes the site origin(s).
- You are using an approved admin account from `ADMIN_ALLOWED_EMAILS`.

## Endpoint summary

Admin (auth required):

- `GET /admin/content/pages/{page}?phase={phase}&view=draft`
- `PUT /admin/content/pages/{page}?phase={phase}`
- `POST /admin/content/pages/{page}/publish?phase={phase}`

Public (published-only):

- `GET /content/pages/{page}?view=published&phase={phase}`

Phase 1 pages:

- `home`
- `about`

Phase 2 pages:

- `membership`
- `donate`

Phase 3 pages:

- `history`
- `docs`
- `news`

Full setup and Cloudflare checklist:

- `CONTENT_CMS_SETUP.md`
