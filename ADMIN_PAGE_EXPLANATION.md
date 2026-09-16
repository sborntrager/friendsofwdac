# Admin Page Explanation

Current-state note:

- This file describes the intended admin product direction.
- For a source-backed inventory of what is actually wired today, see `ADMIN_WIRING_AUDIT.md`.

## Purpose

This page should not be treated as a small utility dashboard. It should function as a lightweight operations hub for Friends of WDAC.

The client does not just need to see recent form submissions. They need one place to:

- review incoming supporter activity
- maintain member records
- maintain donor records
- import existing data from CSV files
- export current records to CSV files
- manage newsletter audiences
- create and send newsletters

In practice, this page is closer to a simple CRM than a basic admin screen.

## What The Client Really Needs

The client needs the admin area to support the real day-to-day work behind the organization, not just form viewing.

That means the page should support:

- raw submission review
- official member records
- official donor records
- mailing list management
- newsletter composition and sending
- CSV upload and download workflows
- basic follow-up and record maintenance

## Forms And Intake Streams

Based on the current site, the main intake streams for admin purposes are:

1. Membership form
2. General donation form
3. Newsletter / email signup

There are also PDF-based workflows currently shown on the Docs page:

- T-shirt order
- Legacy / planned giving
- Photo release

These may not all need full online admin workflows immediately, but they should still be accounted for in the long-term plan.

## Core Recommendation

The system should revolve around a shared `person` record rather than isolated form entries.

Without that, the same individual could appear multiple times as:

- a membership form submission
- a donor
- a newsletter contact
- an imported CSV record

That would quickly become messy.

Instead, one person record should be able to connect to:

- membership status
- donor history
- newsletter eligibility
- notes
- imports
- manual edits

## Main Sections The Admin Page Should Have

## 1. Dashboard

This should be the landing view.

It should show:

- recent submissions
- recent newsletter signups
- current member count
- current paid donor count
- pending imports
- draft newsletters
- records that need review or follow-up

The dashboard should answer: "What needs attention right now?"

## 2. Forms Inbox

This area should hold incoming raw submissions before they are treated as clean official records.

It should include:

- membership submissions
- donation submissions
- newsletter signups

Useful actions:

- review
- mark processed
- convert into member record
- convert into donor record
- merge with existing person

## 3. People

This should be the master contact list.

It should allow admins to:

- search by name or email
- edit contact details
- merge duplicates
- view whether someone is a member, donor, or newsletter contact

This section is important because one person may belong to more than one category.

## 4. Members

This should be the official member records section.

It should include:

- active members
- lapsed members
- pending members
- imported members

Each member record should ideally include:

- name
- email
- phone
- address
- join date
- renewal date if applicable
- membership status
- notes

Required functionality:

- upload CSV of existing members
- download CSV of all members
- edit member records

## 5. Donors

This should be the official donor records section.

It should include:

- paid donors
- pledged or unconfirmed donors
- imported donor records
- donation history where possible

Each donor record should ideally include:

- name
- email
- phone
- donation amount
- donation date
- payment status
- recurring or one-time status
- notes

Required functionality:

- upload CSV of paid donors
- download CSV of all donors
- edit donor records

Important distinction:

A donation form submission is not automatically the same thing as a confirmed paid donor record.

The system should separate:

- donation submission
- payment confirmation
- donor record

## 6. Newsletter

This should be a real working section, not just a list export.

The client wants:

- a way to create a newsletter
- a way to send it
- a way to edit the recipient list

The default audience should be:

- members
- paid donors

The newsletter area should include:

- draft creation
- subject line
- body editor
- test send
- final send
- recipient list preview
- manual add/remove tools

Helpful audience options:

- all members
- all paid donors
- members + paid donors
- manual custom list

Also needed:

- unsubscribe management
- bounced/invalid email handling

## 7. Imports / Exports

This should likely be its own section or a shared utility area.

It should support:

- upload members CSV
- upload donors CSV
- download all members CSV
- download all donors CSV
- download newsletter audience CSV if needed

Good import tools should also help with:

- duplicate detection
- field mapping
- preview before import
- import success/error reporting

## 8. Settings / Admin Management

This section should cover operational setup such as:

- admin users
- sender name and sender email for newsletters
- default list rules
- import templates
- password/security settings

## Suggested MVP

The first strong version of this admin page should include:

1. Dashboard
2. Forms inbox
3. People records
4. Members section with CSV upload/download
5. Donors section with CSV upload/download
6. Newsletter composer with editable recipient list
7. Basic unsubscribe handling

This would give the client a meaningful tool without trying to build every future feature at once.

## Suggested Phase 2 Features

After the MVP, useful next additions would be:

- duplicate merge tools
- newsletter templates
- scheduled sends
- renewal reminders
- donor tags and segmentation
- donation reconciliation from payment platforms
- audit/history logs

## Final Summary

The client needs more than a page that displays recent submissions.

They need a central admin space that can manage:

- supporters
- members
- donors
- mailing audiences
- imports and exports
- newsletters

The best way to think about this page is:

**a lightweight CRM and communications hub for Friends of WDAC**

That framing should guide both the layout and the backend decisions going forward.
