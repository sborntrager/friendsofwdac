# Zoho Admin Email Research

Date: 2026-05-13

## Implementation Status (Started 2026-05-28)

The first implementation pass is now in place in this repo:

- Worker routes added:
  - `GET /admin/mail/status`
  - `GET /admin/mail/connect`
  - `GET /admin/mail/callback`
  - `POST /admin/mail/send-test`
  - `POST /admin/mail/send-newsletter`
- Zoho OAuth state handling is implemented with signed + expiring state tokens.
- Zoho refresh token storage is implemented with AES-GCM encryption before saving to KV.
- Zoho access token refresh and API retry-on-401 flow is implemented.
- Admin newsletter buttons now call real backend routes instead of placeholders.

What is still required before live sends will work:

1. Set Cloudflare Worker secrets:
   - `ZOHO_CLIENT_ID`
   - `ZOHO_CLIENT_SECRET`
   - `ZOHO_TOKEN_ENCRYPTION_KEY`
2. Configure Zoho OAuth redirect URI to:
   - `https://friendsofwadc.org/admin/mail/callback`
   - (or set `ZOHO_REDIRECT_URI` if using a different domain)
3. Complete OAuth connect once from the admin dashboard (Newsletter panel -> Send test email).
4. Optionally set:
   - `ZOHO_MAIL_ACCOUNT_ID` (if mailbox selection must be pinned)

## Goal

Research what it would take to connect a Zoho-hosted email address to the Friends of WDAC admin so the client can send and receive email from the admin page.

## Current Repo State

This repo already has some email-related plumbing, but it is not a mailbox client.

- `wrangler.toml` currently uses Cloudflare `send_email` bindings for:
  - `CONTACT_EMAIL`
  - `ADMIN_RESET_EMAIL`
- `workers/subscribe.js` currently sends:
  - contact-form / online-form notifications
  - admin password reset emails
- `workers/subscribe.js` also has an internal `admin:inbox:` concept, but that is for website submissions saved in KV, not for real email messages.
- `public/admin/index.html` and `public/js/admin.js` include a newsletter compose area, but sending is still placeholder-only.

Important distinction:

- **Forms inbox** in this project = saved website submissions
- **Email inbox** for Zoho = real mailbox messages, folders, threads, replies, attachments, read states

Those are separate systems today.

## Existing Relevant Files

- `wrangler.toml`
- `workers/subscribe.js`
- `public/admin/index.html`
- `public/js/admin.js`
- `ADMIN_WIRING_AUDIT.md`

## What Zoho Provides

Based on Zoho Mail API documentation reviewed on 2026-05-13:

- OAuth 2.0 server-based app flow is supported.
- Access tokens are short-lived and refresh tokens are used for renewal.
- Mail APIs exist for:
  - getting accounts
  - listing folders
  - listing emails
  - reading message content
  - sending email
  - replying to email
  - marking messages read/unread
  - moving / deleting / labeling messages
  - attachment upload and download

Key endpoints documented by Zoho:

- `GET https://mail.zoho.com/api/accounts`
- `POST https://mail.zoho.com/api/accounts/{accountId}/messages`
- `GET https://mail.zoho.com/api/accounts/{accountId}/messages/view`

Key OAuth/scopes documented by Zoho:

- `ZohoMail.accounts.READ`
- `ZohoMail.messages.READ`
- `ZohoMail.messages.CREATE`
- `ZohoMail.messages.ALL`

Important implementation detail:

- Zoho requires the Authorization Code flow for a normal server-based app.
- Access tokens expire in about one hour.
- The Worker should use a stored refresh token to mint new access tokens.
- Zoho responses include `api_domain` and `accounts-server`, so multi-data-center handling matters.

## What This Means For This Project

The clean integration point is the existing Cloudflare Worker, not the browser.

Why:

- the repo already has authenticated admin routes in `workers/subscribe.js`
- the browser should not hold Zoho client secrets or refresh tokens
- the Worker already acts as the trusted backend for admin auth and admin data

So the architecture should be:

1. Admin browser talks only to the site Worker.
2. Worker talks to Zoho Mail API.
3. Worker stores and refreshes Zoho OAuth credentials.
4. Admin session auth remains the existing site admin auth, not Zoho sign-in.

## Two Different Scope Options

### Option A: Send-only integration

This is the smallest useful version.

What it would do:

- send test email from admin
- send newsletter from admin
- optionally send direct replies to form-submitters from the admin review drawer

What it would not do:

- show a live mailbox
- show inbound Zoho email threads
- sync folders, read state, spam, trash, attachments, etc.

This is the easiest path if the main business need is:

- “send from `contacts@friendsofwdac.org`”
- “use Zoho as the mail provider”

### Option B: Full mailbox inside admin

This is a real product feature, not a small wiring change.

What it would need:

- mailbox/folder list UI
- message list UI
- message reader UI
- compose/reply UI
- attachment handling
- read/unread state handling
- refresh / polling behavior
- error and expired-token handling
- pagination / search / filtering
- clear permissions model for which admins can use the mailbox

This is the path if the requirement is literally:

- “client can send and receive emails from the admin page”

## Required Zoho-Side Setup

Before code, Zoho itself has to be set up.

### 1. Mailbox decision

Decide which mailbox the website/admin should use.

Likely candidates:

- `contact@friendsofwdac.org`
- `contacts@friendsofwdac.org`

Note: the archive already contains a note that `contacts@friendsofWDAC.org` access via Zoho was requested for multiple people. That is a Zoho account admin task, separate from the website.

### 2. Zoho app registration

Create a Zoho OAuth app in the Zoho Developer Console as a **server-based app**.

Needed values:

- client ID
- client secret
- redirect URI

### 3. OAuth consent / refresh token

Authorize the target mailbox account and capture:

- refresh token
- API domain / accounts server details if needed for DC routing

### 4. Mailbox permissions / operating model

Decide whether:

- one shared mailbox token is used for all admins, or
- each admin connects their own Zoho account separately

For this site, a **single shared mailbox model** is probably simpler if the sender address is a shared organization address.

## Required Cloudflare / Worker Changes

### New secrets / vars

Add secrets similar to:

- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNTS_SERVER`
- `ZOHO_API_DOMAIN`
- `ZOHO_MAIL_ACCOUNT_ID`
- `ZOHO_FROM_ADDRESS`

If the account ID is not known up front, the Worker can fetch it from `GET /api/accounts` after token exchange.

### New backend code in `workers/subscribe.js`

At minimum, add helpers for:

- refresh Zoho access token
- call Zoho API with bearer token
- normalize Zoho responses into admin-safe JSON

Then add admin-protected routes such as:

- `GET /admin/mail/status`
- `GET /admin/mail/folders`
- `GET /admin/mail/messages`
- `GET /admin/mail/messages/:id`
- `POST /admin/mail/send`
- `POST /admin/mail/reply`
- `PUT /admin/mail/messages/:id/read`
- `PUT /admin/mail/messages/:id/unread`
- `PUT /admin/mail/messages/:id/move`

If attachments are required:

- `POST /admin/mail/attachments`
- `GET /admin/mail/messages/:id/attachments/:attachmentId`

## Required Admin UI Changes

### `public/admin/index.html`

Add a real **Mailbox** panel or expand Newsletter into a broader **Email** area.

Recommended sections:

- mailbox connection status
- sender identity
- folder list
- message list
- message preview pane
- compose / reply drawer
- newsletter send area

### `public/js/admin.js`

Replace the current placeholder actions with real API calls.

Today these are still placeholders:

- `Send test email`
- `Send newsletter`

Those buttons already exist and are the easiest first place to wire Zoho send functionality.

## Data Model Questions Still Needed

Before implementation, these decisions should be made:

1. Is the goal a **shared support mailbox** or only **newsletter / outbound sending**?
2. Which address is the source of truth:
   - `contact@friendsofwdac.org`
   - `contacts@friendsofwdac.org`
3. Should all admins send as the same mailbox?
4. Should incoming Zoho mail be shown live only, or should it also be synced into local storage?
5. Are attachments required on day one?
6. Is newsletter sending expected to be low-volume manual sending, or bulk mailing?

That last question matters:

- Zoho Mail API can send messages.
- Bulk newsletter sending may still be better handled by a mailing-specific service depending on recipient count, deliverability needs, unsubscribe handling, and bounce tracking.

## Important Product / Scope Warning

“Let the client send and receive emails from the admin page” is **not** the same scope as “wire newsletter sending.”

Roughly:

- **Send-only Zoho integration** = targeted backend feature
- **Mailbox inside admin** = new product slice

The second one needs:

- message UX
- mailbox state management
- attachment handling
- polling / refresh behavior
- mailbox security decisions
- much more testing

## Recommended Path

Recommended order for this repo:

### Phase 1: Zoho send-only

Implement first:

- `Send test email`
- `Send newsletter`
- optional direct reply from submission review drawer

This gives immediate value with the smallest risk.

### Phase 2: Read mailbox MVP

Implement next:

- folder list
- inbox list
- read message view
- reply action

Keep this limited to one mailbox and one or two folders at first.

### Phase 3: Full mailbox operations

Only after MVP proves useful:

- attachment compose/download
- search
- move/archive/spam/trash
- local caching or sync
- richer threading

## Practical Recommendation For Friends Of WDAC

If the real need is operationally:

- send from the organization mailbox
- reply to people from the same address
- maybe review incoming mail in one place

then the best starting point is:

1. use a shared Zoho mailbox such as `contacts@friendsofwdac.org`
2. connect it once through the Worker with OAuth
3. wire send/test/newsletter first
4. add read/reply mailbox UI second

That keeps the first build tractable and avoids jumping straight into a full custom mail client.

## Rough Implementation Impact

### Small / medium effort

- Zoho send-only from existing newsletter UI
- shared sender settings
- reply from admin review drawer

### Medium / high effort

- inbox list from Zoho
- message reader and reply panel
- folder switching

### High effort

- full custom mailbox experience
- attachments everywhere
- advanced state sync and search
- robust admin permissions around mailbox actions

## Bottom Line

Yes, this can be connected to Zoho.

The current stack is already well-positioned for it because:

- there is already a Cloudflare Worker backend
- there is already admin authentication
- there is already an admin UI with newsletter placeholders

But the true complexity depends on which of these you actually want:

- **send from Zoho** = straightforward next feature
- **send and receive inside admin like a mailbox** = significantly larger feature

If implementation starts, the cleanest first cut is to wire Zoho into the existing newsletter/test-email surfaces before building a full email inbox panel.
