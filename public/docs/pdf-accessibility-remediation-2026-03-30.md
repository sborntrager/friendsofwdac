# PDF Accessibility Remediation Log
Date: March 30, 2026
Scope: `site/public/assets/docs/*.pdf`

## What was remediated in this pass
- Added a dedicated web page for alternatives and support workflow:
  - `site/public/docs/accessibility-options.html`
- Added prominent entry point from Docs home page:
  - `site/public/docs/index.html`
- Added cross-link from Accessibility Statement:
  - `site/public/accessibility/index.html`
- Provided equivalent in-site web destinations for major PDF topics (history timeline, testimonials, donation and membership instructions).
- Added clear support channel for alternate formats:
  - `contact@FriendsofWDAC.org`

## Current document-level status
- The binary PDFs themselves were not programmatically retagged in this environment (no PDF tagging/editing toolchain available in workspace).
- This remediation pass focuses on user-facing alternatives and accommodation workflow while deeper source-PDF remediation is planned.

## Next step for full PDF conformance
- Open each source PDF in an authoring tool that supports PDF/UA and WCAG-oriented tagging.
- Add/verify: document language, title metadata, heading tags, reading order, table tags where needed, form field labels/tooltips, and export accessibility checks.
- Re-export and replace files in `site/public/assets/docs/`.
