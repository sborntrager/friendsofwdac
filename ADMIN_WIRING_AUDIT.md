# Admin Wiring Audit

Audit date: 2026-04-21

This file captures what the current admin page actually does today, based on the source in:

- [public/admin/index.html](/c:/Users/shann/Documents/Projects/FriendsOfWADC/site/public/admin/index.html)
- [public/js/admin.js](/c:/Users/shann/Documents/Projects/FriendsOfWADC/site/public/js/admin.js)
- [workers/subscribe.js](/c:/Users/shann/Documents/Projects/FriendsOfWADC/site/workers/subscribe.js)

It is intentionally separate from `ADMIN_PAGE_EXPLANATION.md`, which describes the desired operations-hub vision.

For the prioritized implementation checklist, see `ADMIN_PUNCH_LIST.md`.

Current phase note:

- The Worker now includes foundational persistent admin record routes for people, members, donors, imports, and inbox status.
- The current dashboard UI now loads Members, Donors, and Imports from the persistent Worker routes.
- Member and donor record workbenches now support create and update flows from the dashboard itself.
- The visible admin experience is still mixed overall: People remains a blended preview, the inbox is still review-only, and newsletter/settings work is still unfinished.

## Backend-Wired And Working

These features have real Worker routes or real in-browser behavior and are currently wired:

- Admin signup for allowlisted emails
- Admin login
- Password reset request
- Password reset from emailed token
- Password change while signed in
- Dashboard data load from `GET /admin/dashboard`
- Refresh data
- Log out
- Export JSON snapshot
- Member CSV upload to persistent member records
- Donor CSV upload to persistent donor records
- Persistent import-batch save and load
- Members CSV download from persistent member records
- Donors CSV download from persistent donor records
- Member record table and inline create/edit workflow
- Donor record table and inline create/edit workflow
- Forms inbox table rendering
- Submission review drawer for recent forms and newsletter signups
- People search
- People duplicate filter toggle
- Newsletter preview in a new tab
- CSV template download

## Working, But Only In The Browser

These features do something real in the UI, but they do not persist to the backend:

- Recipient counts in the newsletter panel
- People preview and newsletter audience preview built from recent forms, newsletter signups, and saved member/donor records

Important limitation:

- The visible People table is still a client-side blended view, not a dedicated master people CRM.
- CSV imports now persist member or donor records immediately, but there is still no true mapping, duplicate-review, or confirmation workflow before save.
- Inbox process and convert routes exist in the Worker, but the front end still does not call them yet.

## Present In UI, But Not Really Wired

These controls are visible, but there is no backend support behind them:

- `Send test email`
- `Send newsletter`
- Settings buttons for:
  - Admin users
  - Sender name and email
  - Default list rules
  - Import templates
  - Field mapping defaults

What they do now:

- Most of these buttons only call `showNote(...)` in [public/js/admin.js](/c:/Users/shann/Documents/Projects/FriendsOfWADC/site/public/js/admin.js) and display a message that the feature belongs in a later build.
- The `Security & access` setting is the exception. It opens the password-change area and is genuinely wired.
- `Edit records` in Members and Donors are no longer placeholders. They now open the inline record editors inside each panel.

## Misleading Or Partial UX

These areas look more complete than they really are:

- Members panel
  - The counts and exports now come from persistent member records.
  - The panel now includes a real saved-record table plus inline create/edit workflow.
  - It still does not provide delete, merge, or bulk-edit tools.
- Donors panel
  - The counts and exports now come from persistent donor records.
  - The panel now includes a real saved-record table plus inline create/edit workflow.
  - It still does not provide delete, merge, or bulk-edit tools.
- People panel
  - This is a merged preview assembled on the client from recent forms, newsletter signups, and saved member/donor records.
  - It is not a true saved CRM-style people database.
- Newsletter audience `Custom list`
  - It does not open a custom list builder.
  - It currently falls back to the same member-plus-donor pool used by the combined audience option.
- `View list` in Newsletter
  - It only scrolls the page to the People preview and shows a note.
- `Preview import results`
  - It now shows a one-line summary of saved import batches.
  - It still does not provide field mapping, duplicate review, or a true pre-commit import workflow.
- Email handling card
  - The UI now labels unsubscribe and bounced email handling as planned.
  - There is no backend route in the Worker for either workflow, so this is currently just static text.
- Forms inbox
  - You can review records in the current UI, but you still cannot trigger processing or conversion from the dashboard itself.
  - The Worker now has foundational inbox process and convert routes, but the front end does not call them yet.

## Worker Routes That Exist Today

The Worker currently exposes these admin routes in [workers/subscribe.js](/c:/Users/shann/Documents/Projects/FriendsOfWADC/site/workers/subscribe.js):

- `GET /admin/status`
- `POST /admin/signup`
- `POST /admin/login`
- `POST /admin/request-password-reset`
- `POST /admin/reset-password`
- `POST /admin/change-password`
- `GET /admin/dashboard`
- `GET /admin/people`
- `GET /admin/members`
- `POST /admin/members`
- `PATCH /admin/members/:id`
- `GET /admin/donors`
- `POST /admin/donors`
- `PATCH /admin/donors/:id`
- `GET /admin/imports`
- `POST /admin/imports`
- `POST /admin/inbox/:id/process`
- `POST /admin/inbox/:id/convert`

There are no current Worker routes for:

- managing newsletter audiences
- sending test emails
- sending newsletters
- managing unsubscribe or bounce status
- saving admin settings other than password changes

## Highest-Priority Gaps

If we want the admin page to behave like the UI suggests, the highest-value next steps are:

1. Switch the visible dashboard views over to the new persistent member and donor storage instead of deriving them from recent forms.
2. Add delete, merge, or bulk-edit management tools for saved member and donor records.
3. Add a proper import review flow instead of immediate save-on-upload.
4. Connect inbox workflow actions such as mark processed and convert to the new backend routes, then add merge support.
5. Either wire newsletter sending and audience management, or clearly label those controls as not yet available.

## Quick Bottom Line

Today the admin page is strongest in these areas:

- authentication
- loading recent submission data
- persistent member and donor summaries
- inline member and donor editing
- persistent CSV imports and exports
- reviewing submissions
- exporting snapshots

Today it is weakest in these areas:

- editing
- newsletter sending
- settings management
- import workflow depth

The page now has a real persistent record layer for members, donors, and imports, but it still behaves more like a polished operations dashboard than a full CRM-style admin system.
