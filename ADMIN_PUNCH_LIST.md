# Admin Punch List

Created: 2026-04-21

This is the execution checklist that follows `ADMIN_WIRING_AUDIT.md`.

Use this file for implementation planning and progress tracking.

## Build Order

Recommended order:

1. Honest UI pass so the page stops implying features that do not exist.
2. Persistent record model for people, members, donors, and imports.
3. Real member and donor record views plus edit flows.
4. Forms inbox workflow actions.
5. Persistent CSV imports and exports.
6. Newsletter audience management and sending.
7. Admin settings beyond password changes.
8. QA, deployment verification, and documentation cleanup.

## Phase 0: Honest UI Pass

Goal: stop the admin page from looking broken or deceptive.

- [x] Replace placeholder click behavior for `Edit records`, `Send test email`, `Send newsletter`, and non-working settings buttons with visibly disabled or clearly labeled `Coming soon` states.
- [x] Replace static `Enabled` labels in the newsletter email-handling card with honest copy until unsubscribe and bounce handling are real.
- [x] Add temporary explanatory text to the Members, Donors, and People panels that these views are derived from recent forms and current-session imports.
- [x] Clarify that `Custom list` is not yet a true audience builder.
- [x] Clarify that `Preview import results` is only a session summary, not a full mapping/review flow.

Primary files:

- `public/admin/index.html`
- `public/js/admin.js`
- `public/assets/admin-page.css`

Definition of done:

- A client can no longer reasonably assume unfinished features are live.
- Non-working controls do not feel broken when clicked.

## Phase 1: Persistent Data Foundation

Goal: create real stored records instead of deriving everything from recent forms.

- [x] Decide the storage approach for admin records.
- [x] Define record shapes for:
  - person
  - member
  - donor
  - import batch
  - inbox item status
- [ ] Define newsletter audience membership storage.
- [x] Add Worker helpers for loading and saving those records.
- [x] Add Worker routes for members, donors, people, imports, and inbox actions.
- [x] Keep existing form-submission storage intact while the new record layer is introduced.
- [x] Document the key prefixes or storage conventions in `FORMS_AND_ADMIN_SETUP.md`.
- [x] Connect the current admin UI to the new persistent routes.

Recommended Worker routes to add:

- `GET /admin/people`
- `GET /admin/members`
- `POST /admin/members`
- `PATCH /admin/members/:id`
- `GET /admin/donors`
- `POST /admin/donors`
- `PATCH /admin/donors/:id`
- `POST /admin/imports`
- `GET /admin/imports`
- `POST /admin/inbox/:id/process`
- `POST /admin/inbox/:id/convert`

Primary files:

- `workers/subscribe.js`
- `FORMS_AND_ADMIN_SETUP.md`

Definition of done:

- Members and donors exist as first-class stored records.
- Admin views no longer depend only on recent forms plus browser memory.

## Phase 2: Real Member And Donor Record Management

Goal: make `Edit records` actually work.

- [x] Add member and donor tables or detail panels that list real stored records.
- [x] Implement record edit UI for members.
- [x] Implement record edit UI for donors.
- [x] Support create, update, and cancel flows.
- [x] Show save success and error states.
- [x] Refresh dashboard counts from saved records, not derived front-end estimates.

Suggested fields for members:

- name
- email
- phone
- address
- join date
- renewal date
- status
- notes

Suggested fields for donors:

- name
- email
- phone
- donation amount
- donation date
- payment status
- recurring / one-time
- notes

Primary files:

- `public/admin/index.html`
- `public/js/admin.js`
- `public/assets/admin-page.css`
- `workers/subscribe.js`

Definition of done:

- Clicking `Edit records` opens a real editable workflow.
- Saving a record persists changes and survives refresh and sign-out.

## Phase 3: Forms Inbox Workflow

Goal: make the inbox useful beyond read-only review.

- [ ] Add inbox actions for:
  - mark processed
  - convert to member
  - convert to donor
  - merge with existing person
- [ ] Track inbox status so reviewed items can leave the `New` state.
- [ ] Preserve raw submission data alongside converted records.
- [ ] Add duplicate suggestions based on email, phone, and name.
- [ ] Add visible processed / pending / converted states in the inbox UI.

Primary files:

- `public/admin/index.html`
- `public/js/admin.js`
- `workers/subscribe.js`

Definition of done:

- Admins can move an item from raw submission to maintained record without leaving the dashboard.

## Phase 4: Persistent CSV Import / Export

Goal: turn imports from temporary browser staging into real admin tools.

- [x] Save import batches server-side.
- [ ] Store import metadata:
  - file name
  - uploaded at
  - row count
  - type
  - success / error state
- [ ] Add preview and confirmation flow before records are committed.
- [ ] Add duplicate detection during import.
- [ ] Add field-mapping defaults instead of relying only on header aliases in the front end.
- [x] Export members and donors from persistent records instead of front-end projections.
- [ ] Keep template downloads, but separate them clearly from real exports.

Primary files:

- `public/js/admin.js`
- `workers/subscribe.js`
- `public/admin/index.html`

Definition of done:

- Imports survive refresh and sign-in cycles.
- Exports match the saved record set, not only the current browser session.

## Phase 5: Newsletter Tools

Goal: move newsletter from mock workflow to real workflow.

- [ ] Define what source of truth should feed the mailing list:
  - members
  - paid donors
  - combined audience
  - custom list
- [ ] Build a real recipient list preview instead of a count-only estimate.
- [ ] Build a real custom audience editor.
- [ ] Add newsletter draft save capability.
- [ ] Add `Send test email`.
- [ ] Add `Send newsletter`.
- [ ] Add unsubscribe state management.
- [ ] Add bounced / invalid email handling.
- [ ] Replace static email-handling labels with real status from the backend.

Primary files:

- `public/admin/index.html`
- `public/js/admin.js`
- `workers/subscribe.js`
- possibly `wrangler.toml` if new email bindings or config are needed

Definition of done:

- A draft can be composed, previewed, test-sent, and sent to a controlled audience.

## Phase 6: Settings

Goal: make the Settings panel something more than placeholders.

- [ ] Add admin-user management view if multiple admins will be supported.
- [ ] Add sender name and sender email configuration.
- [ ] Add default list-rule settings.
- [ ] Add import template / mapping defaults if import workflows remain important.
- [ ] Keep password change under Security, but separate it visually from broader admin settings.

Primary files:

- `public/admin/index.html`
- `public/js/admin.js`
- `workers/subscribe.js`
- `FORMS_AND_ADMIN_SETUP.md`

Definition of done:

- Each visible settings button opens a real configuration workflow or is intentionally removed.

## Phase 7: QA And Cleanup

Goal: make the admin area reliable enough to hand off confidently.

- [ ] Test signup, login, logout, reset, and password change end to end.
- [ ] Test forms inbox with fresh membership and donation submissions.
- [ ] Test import and export with real CSV samples.
- [ ] Test edit-record flows for both members and donors.
- [ ] Test session expiry handling.
- [ ] Test empty states and zero-record states.
- [ ] Update `FORMS_AND_ADMIN_SETUP.md` to match the new admin capabilities.
- [ ] Update `ADMIN_WIRING_AUDIT.md` after major features land.

Definition of done:

- The docs match the deployed behavior.
- The client can complete the main admin workflows without hidden caveats.

## Priority Summary

If we want the shortest path to a credible admin tool, do these first:

1. Honest UI pass
2. Persistent member and donor records
3. Real `Edit records` flows
4. Inbox conversion actions
5. Persistent imports and exports

If we want the shortest path to client trust, the single most important visible fix is:

- make the page honest about what is not live yet

If we want the shortest path to actual operations usefulness, the single most important product fix is:

- create real saved member and donor records
