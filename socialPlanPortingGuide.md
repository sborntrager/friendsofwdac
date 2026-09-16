# Social Plan Porting Guide

Use this guide to recreate the exact long-scrolling roadmap page on another site with minimal edits.

## Included Files

- `socialPlanTemplate.html`: Self-contained page (HTML + CSS + JS inline)
- `socialPlanPortingGuide.md`: This implementation and repurposing guide

## What This Template Already Includes

- Sticky left collapsible navigation with scrollspy
- Exact anchor flow:
  - `#top`
  - `#story-arc`
  - `#education`
  - `#humor`
  - `#month1`
  - `#month2`
  - `#month3`
  - `#modules`
  - `#metrics`
  - `#cta`
- Expand/collapse exhibit cards (`details` blocks)
- Artifact lightbox interaction
- Parallax hero accent
- `prefers-reduced-motion` support
- Mobile responsive layout

## Quick Start (Another Site)

1. Upload `socialPlanTemplate.html` to your new project.
2. Rename it to your route/page target (example: `roadmap.html`).
3. Link to it from your site navigation.
4. Replace placeholder text/tokens listed below.
5. Test desktop + mobile + reduced motion.

## Placeholder Tokens To Replace

Search and replace these values in `socialPlanTemplate.html`:

- `[Brand Name]`
- `[Month DD, YYYY]`
- `[Primary Outcome]`
- `[Primary CTA]`
- `[Secondary CTA]`

## Brand Styling Tokens (CSS)

At the top of the `<style>` block, update `:root` values first:

- `--ink`
- `--muted`
- `--surface`
- `--line`
- `--accent`
- `--accent-2`
- `--cool`
- `--shadow`
- `--radius-lg`
- `--radius-md`
- `--radius-sm`

These token edits recolor the whole page without structural changes.

## Content Replacement Order (Recommended)

1. Hero section (`#top`):
   - Headline
   - Subhead
   - Priority chips
   - CTA labels/links
2. Story Arc (`#story-arc`):
   - 5 narrative beats and examples
3. Education Engine (`#education`):
   - Keep card count, replace card content with your domain language
4. Humor + Viral (`#humor`):
   - Keep guardrail structure; rewrite examples per brand risk tolerance
5. Months 1-3 (`#month1`, `#month2`, `#month3`):
   - Replace deliverables and checkpoints
   - Update launch timeline times/tasks
6. Modules, Metrics, CTA (`#modules`, `#metrics`, `#cta`):
   - Replace module naming only if your component system differs
   - Replace metric placeholders with target KPIs

## Link Wiring

Template button links currently use `#` placeholders for external actions.

Replace these with real URLs:

- Left rail `Download PDF`
- Left rail secondary CTA
- Final CTA primary button
- Final CTA secondary button

## Behavior Notes

- Nav highlight is driven by section `id` + nav link `data-nav`.
- If you rename a section ID, update both values.
- Artifact lightbox opens from elements using `data-lightbox`.

## Accessibility / QA Checklist

- Confirm heading order remains valid (`h1` once, then section `h2`)
- Verify keyboard access:
  - nav links
  - `details/summary`
  - lightbox close button + `Esc`
- Verify contrast after token changes
- Verify mobile behavior under 980px width
- Verify reduced motion behavior

## Optional Integration Pattern

If your site uses a global CSS system:

1. Keep the HTML and JS as-is.
2. Move styles into a page-level stylesheet.
3. Replace the `:root` values with your design-system variables.
4. Keep class names stable to preserve behavior.

## Versioning Tip

Keep one canonical template and create brand variants via:

- Token overrides (preferred)
- Content JSON or CMS mapping (advanced)

This keeps the roadmap structure consistent across clients while allowing visual and copy customization.
