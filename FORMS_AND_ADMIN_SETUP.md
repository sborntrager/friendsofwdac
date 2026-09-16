# Forms and Admin Setup

This file is the practical setup guide for the current Friends of WDAC forms, email signup, and admin dashboard.

It reflects what is actually wired in the repo right now, not just the earlier planning notes.

For a feature-by-feature audit of the admin page, see `ADMIN_WIRING_AUDIT.md`.

Important: although the Worker is still named `friendsofwadc-subscribe`, it is not subscriber-only. This same Worker currently handles homepage email signup, both online forms, and the admin dashboard.

## What is live now

- The public site is deployed from `site/public` through Cloudflare Pages.
- A Cloudflare Worker handles:
  - homepage email signup
  - membership form submissions
  - general donation form submissions
  - admin login
  - admin dashboard data loading
  - foundational admin record routes for people, members, donors, imports, and inbox actions
  - site-content draft, publish, and public-content delivery routes for the CMS-backed pages
- Cloudflare KV is the current storage layer.
- The admin page currently lets you view recent submissions, export JSON, create and update member and donor records, persist CSV import batches, and edit/publish supported public-page content.
- GiveButter is not yet directly connected to these forms.
- The admin page now includes a field-based Site Content CMS for the main marketing pages.

## Repo locations

- Worker config: `site/wrangler.toml`
- Pages config: `site/wrangler.pages.toml`
- Worker code: `site/workers/subscribe.js`
- Homepage email signup: `site/public/index.html`
- Membership form page: `site/public/forms/membership/index.html`
- Donation form page: `site/public/forms/donation/index.html`
- Shared form submit JS: `site/public/js/forms.js`
- Admin page: `site/public/admin/index.html`
- Admin dashboard JS: `site/public/js/admin.js`
- Admin content editor JS: `site/public/js/admin-content-phase1.js`
- General site JS with email signup: `site/public/js/site.js`

## Current architecture

### Reusable admin auth pattern

The admin auth layer is intentionally isolated around:

- allowlisted admin emails in `ADMIN_ALLOWED_EMAILS`
- admin user KV records under the `admin:user:` prefix
- password reset token KV records under the `admin:reset:` prefix
- `/admin/*` Worker routes for signup, login, reset, password change, and dashboard access
- the dedicated admin page files:
  - `site/public/admin/index.html`
  - `site/public/js/admin.js`

That means you can reuse this pattern in another project by copying the admin routes, the admin page, the two KV key prefixes, and the `send_email` binding for reset emails without pulling along the membership or donation form logic.

### Public Pages site

Cloudflare Pages serves the static files in `site/public`.

### Worker

The Worker name in `wrangler.toml` is currently:

```toml
name = "friendsofwadc-subscribe"
```

That name is historical. You do not need a second separate Worker for the membership and donation forms unless you intentionally want to split the system later.

Current routes handled by the Worker:

- `POST /`
  - homepage email signup
- `POST /contact`
  - homepage contact form submission and email send
- `POST /forms`
  - membership and general donation form submissions
- `GET /admin/status`
  - returns whether admin signup is enabled and how many approved admin accounts already exist
- `POST /admin/signup`
  - creates an approved admin account with email and password
- `POST /admin/login`
  - admin email/password login
- `POST /admin/request-password-reset`
  - sends a one-time reset link to an approved admin email
- `POST /admin/reset-password`
  - consumes a one-time reset link and sets a new password
- `POST /admin/change-password`
  - changes the signed-in admin password
- `GET /admin/dashboard`
  - admin dashboard data
- `GET /admin/people`
  - lists persistent people records
- `GET /admin/members`
  - lists persistent member records
- `POST /admin/members`
  - creates a persistent member record
- `PATCH /admin/members/:id`
  - updates a persistent member record
- `GET /admin/donors`
  - lists persistent donor records
- `POST /admin/donors`
  - creates a persistent donor record
- `PATCH /admin/donors/:id`
  - updates a persistent donor record
- `GET /admin/imports`
  - lists persistent import batches
- `POST /admin/imports`
  - creates a persistent import batch record and can save imported member or donor rows from CSV uploads
- `POST /admin/inbox/:id/process`
  - saves inbox processing status for a raw submission
- `POST /admin/inbox/:id/convert`
  - converts a raw submission into a persistent member or donor record
- `GET /admin/content/pages/:page?phase=:phase&view=draft`
  - loads the draft and published CMS record for a supported page
- `PUT /admin/content/pages/:page?phase=:phase`
  - saves a draft CMS payload for a supported page
- `POST /admin/content/pages/:page/publish?phase=:phase`
  - publishes the current CMS draft for a supported page
- `GET /content/pages/:page?view=published&phase=:phase`
  - returns published-only content for the public site

### Cloudflare KV

The Worker uses a KV binding named `SUBSCRIBERS`.

That KV currently stores:

- email signups under keys like `email:someone@example.com`
- form submissions under keys like `form:membership:...` or `form:general-donation:...`
- admin users under keys like `admin:user:admin@example.com`
- admin password reset tokens under keys like `admin:reset:...`
- people records under keys like `admin:person:...`
- member records under keys like `admin:member:...`
- donor records under keys like `admin:donor:...`
- import batches under keys like `admin:import:...`
- inbox status records under keys like `admin:inbox:...`
- content page records under keys like `admin:content:2:membership`

The Worker also uses `send_email` bindings for email-driven workflows:

- binding name: `CONTACT_EMAIL`
- destination address: `contact@friendsofwdac.org`
- binding name: `ADMIN_RESET_EMAIL`
- allowed destination addresses: `shannonborntrager@gmail.com`, `contact@friendsofwdac.org`

## Before you start

You need:

- a Cloudflare account with access to the Friends of WDAC project
- Node.js and `npm`
- Wrangler CLI available through `npx wrangler`

Optional but helpful:

- access to the Cloudflare dashboard for Pages, Workers, and KV

## Fast PowerShell path

There is now a helper script in the `site` folder:

```powershell
.\setup-forms-admin.ps1
```

Useful variants:

```powershell
.\setup-forms-admin.ps1 -CheckOnly
.\setup-forms-admin.ps1 -DeployPages
.\setup-forms-admin.ps1 -RotateSecrets -DeployPages
```

What it does:

- verifies Wrangler auth
- verifies the configured KV namespace exists
- checks whether `ADMIN_SESSION_SECRET` exists
- generates a fresh admin session secret
- deploys the Worker
- optionally deploys Pages
- verifies admin status and safely probes the forms/signup endpoints without writing real test submissions

## One-time Cloudflare setup

### 1. Sign in to Wrangler

From a terminal:

```powershell
npx wrangler login
npx wrangler whoami
```

### 2. Confirm the Worker config

Open `site/wrangler.toml` and verify:

- `name` is the Worker you want to deploy
- `account_id` is correct
- `kv_namespaces` points at the correct KV namespace
- `send_email` includes the contact email binding
- `send_email` includes the admin reset email binding
- `ALLOWED_ORIGIN` contains the site domains you want the Worker to accept

The repo currently has:

- Worker name: `friendsofwadc-subscribe`
- KV binding name: `SUBSCRIBERS`
- KV namespace ID: `45958fcabdd3437fbb30845d9541d46f`
- email binding name: `CONTACT_EMAIL`
- admin reset binding name: `ADMIN_RESET_EMAIL`
- allowed admin emails: `shannonborntrager@gmail.com`, `contact@friendsofwdac.org`

If you ever create a fresh KV namespace, update the `id` in `wrangler.toml`.

### 3. Create or verify the KV namespace

If you need a new namespace:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler kv namespace create SUBSCRIBERS
```

Then copy the returned namespace ID into `site/wrangler.toml` under:

```toml
kv_namespaces = [
  { binding = "SUBSCRIBERS", id = "PUT_NEW_ID_HERE" }
]
```

If you are using the existing live namespace, keep the current ID.

### 4. Set the admin secrets

From `site`:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler secret put ADMIN_SESSION_SECRET
```

Notes:

- `ADMIN_SESSION_SECRET` signs admin sessions.
- `ADMIN_RESET_SECRET` is optional. If you do not set it, password reset tokens reuse the session secret with a separate scope.
- For backward compatibility, the Worker will also fall back to legacy `ADMIN_PASSPHRASE` if it already exists.
- Admin signup is restricted to the approved email allowlist in `ADMIN_ALLOWED_EMAILS`.

### 5. Configure Cloudflare email sending for the contact form and admin password reset

The homepage contact form uses Cloudflare's Worker email sending binding.

Before deployment works fully, make sure:

- the domain is onboarded in Cloudflare Email Service / Email Routing
- the `send_email` binding in `site/wrangler.toml` is present
- the sender address in `CONTACT_FORM_FROM_EMAIL` is valid for the configured domain
- the two approved admin reset destination emails are verified in Cloudflare Email Routing if you want reset emails to reach them

The repo currently points contact form mail to:

- `CONTACT_FORM_TO_EMAIL = "contact@friendsofwdac.org"`
- `CONTACT_FORM_FROM_EMAIL = "contact@friendsofwdac.org"`
- `ADMIN_RESET_FROM_EMAIL = "contact@friendsofwdac.org"`
- `ADMIN_SITE_URL = "https://friendsofwdac.org"`

If you later want a dedicated sender, change `CONTACT_FORM_FROM_EMAIL` to something like `website@friendsofwdac.org` after that sender is ready in your domain setup.

### 6. Verify allowed origins

The Worker only accepts requests from allowed origins.

`site/wrangler.toml` currently allows:

```toml
ALLOWED_ORIGIN = "https://friendsofwdac.org,https://www.friendsofwdac.org,https://friendsofwadc.org,https://www.friendsofwadc.org"
```

The Worker also automatically allows:

- `http://localhost`
- `http://127.0.0.1`
- any `*.pages.dev` preview domain

If you add or change production domains, update `ALLOWED_ORIGIN` and redeploy the Worker.

## Deploy order

Use this order when setting everything up or refreshing production:

1. Deploy the Worker
2. Deploy the Pages site
3. Test the homepage signup, homepage contact form, both online forms, and admin setup/login

### Deploy the Worker

From `site`:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler deploy
```

To watch logs:

```powershell
npx wrangler tail friendsofwadc-subscribe
```

### Deploy the Pages site

From the parent `FriendsOfWADC` folder:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC
npx wrangler pages deploy .\site\public --project-name=wadc
```

Alternative from inside `site`:

```powershell
npx wrangler --cwd .. pages deploy .\site\public --project-name=wadc
```

`site/wrangler.pages.toml` is already set to:

```toml
pages_build_output_dir = "public"
```

Important:

- for direct `wrangler pages deploy` uploads, pass the built static directory `site/public`
- if you deploy `site` instead of `site/public`, Cloudflare will publish the wrong files and routes like `/admin/index.html` may 404

## Local preview

You can preview the static site locally with:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC
npx wrangler pages dev .\site\public
```

Important:

- the public pages are local in this mode
- the forms and admin page still call the deployed Worker URL unless you change those HTML attributes
- localhost is already allowed by the Worker origin checks

## Current live endpoints in the site

Right now the public pages point to this Worker URL:

```text
https://friendsofwadc-subscribe.shannonborntrager.workers.dev
```

If the Worker URL ever changes, update these files:

- `site/public/index.html`
  - homepage email signup form uses `data-endpoint`
- `site/public/forms/membership/index.html`
  - membership form uses `data-json-endpoint`
- `site/public/forms/donation/index.html`
  - donation form uses `data-json-endpoint`
- `site/public/admin/index.html`
  - admin section uses `data-admin-api-base`

If you forget this step, the site may still talk to the old Worker even after a new deployment.

## Forms setup details

### Membership form

File:

- `site/public/forms/membership/index.html`

The membership form currently submits:

- first name
- last name
- email
- phone
- street
- city
- state
- zip
- participation interests
- donation intent
- donation amount
- comments
- consent

The Worker expects:

- `formType = "membership"`
- valid first name
- valid last name
- valid email
- consent checked

Donation amount is optional on membership.

### General donation form

File:

- `site/public/forms/donation/index.html`

The donation form currently submits:

- first name
- last name
- email
- phone
- donation amount
- donation frequency
- designation
- tribute name
- special instructions
- comments
- consent

The Worker expects:

- `formType = "general-donation"`
- valid first name
- valid last name
- valid email
- donation amount
- donation frequency
- consent checked

### Shared form behavior

File:

- `site/public/js/forms.js`

This script:

- collects the form values
- converts repeated fields like checkboxes into arrays
- sends JSON to the Worker
- shows a success or error note on the page

## Homepage email signup setup

Files:

- `site/public/index.html`
- `site/public/js/site.js`

The homepage email form sends:

```json
{ "email": "supporter@example.com" }
```

to:

```text
POST https://friendsofwadc-subscribe.shannonborntrager.workers.dev
```

If the email is valid, the Worker stores it in KV unless that email key already exists.

## Homepage contact form setup

Files:

- `site/public/index_working4.html`
- `site/public/js/site.js`
- `site/workers/subscribe.js`

The homepage contact form posts JSON to:

```text
POST https://friendsofwadc-subscribe.shannonborntrager.workers.dev/contact
```

The Worker:

- validates name, email, and message
- ignores a simple hidden honeypot field if bots fill it
- sends the message to `contact@friendsofwdac.org` through the `CONTACT_EMAIL` binding
- uses the visitor email as `replyTo`

Important:

- this only works after Cloudflare email sending is configured for the domain
- if email sending is not configured, the Worker returns a configuration error

## Admin page setup

Files:

- `site/public/admin/index.html`
- `site/public/js/admin.js`

The admin page works like this:

1. The page defaults to a normal email/password sign-in form.
2. A separate Create account option opens the signup form for approved admin emails.
3. If the email is approved and no account exists yet, the admin sets the password twice and is signed in automatically.
4. A separate Forgot password option sends a one-time reset link to an approved admin email.
5. The Worker returns a signed token after signup, login, or password reset.
5. The browser stores that token in `sessionStorage`.
6. The page loads `GET /admin/dashboard` with `Authorization: Bearer <token>`.

Current behavior:

- admin sessions last 8 hours
- admin export downloads JSON
- signed-in admins can change their password from the admin page
- approved admins can request a one-time reset link from the sign-in screen
- only approved admin emails can create or use admin accounts
- the Worker now includes persistent admin record routes for people, members, donors, imports, and inbox status
- the dashboard shows:
  - total online forms
  - membership forms
  - donation forms
  - email sign-ups
  - recent form records
  - recent email sign-ups

Important:

- the current admin UI still mixes older dashboard preview rendering in `site/public/js/admin.js` with newer persistent record and CMS workflows
- the new persistent member, donor, people, import, inbox, and content routes are live backend foundations for the broader admin product

Important:

- this admin page now edits the supported CMS-backed public pages
- the visible member and donor editing flows are connected to the persistent backend routes

## If you change the forms later

When adding, removing, or renaming form fields, update both the page and the Worker.

### Update the HTML form page

Edit one of:

- `site/public/forms/membership/index.html`
- `site/public/forms/donation/index.html`

### Update Worker validation and normalization

Edit:

- `site/workers/subscribe.js`

Specifically update the `parseFormPayload` logic so the Worker accepts and saves the new field correctly.

### Admin dashboard rendering

Usually no special admin change is needed because the admin page renders saved fields dynamically.

You may still want to adjust:

- pill labels in `site/public/js/admin.js`
- summary wording in the admin cards

## Recommended setup checklist

Use this checklist when setting everything up from scratch:

1. Confirm Cloudflare account access works with `npx wrangler whoami`.
2. Confirm `site/wrangler.toml` has the right Worker name, account ID, KV namespace ID, and allowed origins.
3. Create the KV namespace only if you are not using the existing one.
4. Set `ADMIN_SESSION_SECRET`.
6. Deploy the Worker from `site`.
7. Deploy Pages from the parent `FriendsOfWADC` folder.
8. Open the homepage and submit a test email signup.
9. Open the homepage and submit a test contact message.
10. Open the membership form and submit a test entry.
11. Open the donation form and submit a test entry.
12. Open the admin page and create the first admin account with one of the approved email addresses.
13. Sign out and sign back in with the new email/password login.
14. Request a password reset email and verify the reset screen loads from the emailed link.
15. Confirm the counts and recent records appear.
16. Test the JSON export button.

## Troubleshooting

### `Origin not allowed`

Cause:

- the request domain is not allowed by `ALLOWED_ORIGIN`

Fix:

- add the domain to `ALLOWED_ORIGIN`
- redeploy the Worker

### `Missing KV binding`

Cause:

- `SUBSCRIBERS` is not configured correctly in `wrangler.toml`

Fix:

- verify the KV namespace exists
- verify the namespace ID in `wrangler.toml`
- redeploy the Worker

### `Admin session secret is not configured`

Cause:

- `ADMIN_SESSION_SECRET` is missing and the Worker cannot create a session token

Fix:

```powershell
cd C:\Users\shann\Documents\Projects\FriendsOfWADC\site
npx wrangler secret put ADMIN_SESSION_SECRET
```

### `Sign-in failed`

Cause:

- the entered admin email or password is incorrect

Fix:

- enter the correct email/password
- or sign in and change the password from the admin page if you still have access on another device

### `Admin account has not been created yet`

Cause:

- the Worker is deployed, but the first admin account has not been created through `/admin/signup`

Fix:

- open the admin page
- create the first admin account with one of the approved admin email addresses

### `Password reset email is not configured yet`

Cause:

- the `ADMIN_RESET_EMAIL` binding is missing
- the approved reset destination email has not been verified in Cloudflare Email Routing

Fix:

- confirm `[[send_email]]` for `ADMIN_RESET_EMAIL` exists in `site/wrangler.toml`
- confirm `shannonborntrager@gmail.com` and `contact@friendsofwdac.org` are valid verified destination addresses in Cloudflare Email Routing
- redeploy the Worker

### Form submission fails

Possible causes:

- Worker URL in the page is outdated
- required fields are missing
- donation amount or frequency is missing on the donation form
- allowed origin does not include the current domain
- Worker deployment is outdated

### `Contact email delivery is not configured yet`

Cause:

- the Worker `send_email` binding is missing or Cloudflare Email Service is not set up for the domain

Fix:

- confirm `[[send_email]]` exists in `site/wrangler.toml`
- confirm the domain is configured for Cloudflare email sending
- redeploy the Worker

### Admin page opens but no recent records show

Possible causes:

- no records have been submitted yet
- the Worker is talking to the wrong KV namespace
- the session has expired
- the Worker URL in `site/public/admin/index.html` points to the wrong place

## Current limitations to remember

- storage is Cloudflare KV, not a relational database
- export is JSON, not CSV
- GiveButter is not yet directly wired into form submission or payment confirmation
- the admin page is a submission viewer, not a website editing tool

## Suggested next improvements

If you want this setup to go further later, the most useful next upgrades would be:

1. switch admin export from JSON to CSV
2. move the Worker base URL into one shared config location instead of hard-coding it in multiple HTML files
3. add a clearer post-submit handoff to GiveButter where needed
4. optionally split email signups and form records into separate KV namespaces or a different storage layer
