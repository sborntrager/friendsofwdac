# Friends of WDAC Contrast Audit
Date: March 30, 2026
Scope: `site/public` working pages using `assets/site.css`

## Method
- Manual review of text/background combinations in shared CSS.
- Spot-check ratios calculated with WCAG relative luminance formula.
- Priority given to body text, buttons, chips/tags, and footer/UI text.

## Key Results
- `#4c677a` (muted text) on white and near-white backgrounds: **PASS** (5.55-5.95:1).
- `#0f5c86` on light blue chip backgrounds: **PASS** (~6.58-6.76:1).
- `#79580b` on yellow chip background: **PASS** (~5.52:1).
- `#8f2f2f` on light red chip background: **PASS** (~6.42:1).
- `#ffffff` on previous primary coral `#f45b5b`: **FAIL** (~3.23:1).

## Remediation Applied
- Updated primary button coral palette in `assets/site.css`:
  - `--coral-500: #cc3f3f` (white contrast now ~4.83:1, PASS)
  - `--coral-600: #b73636` (white contrast now ~5.84:1, PASS)
- Increased very small badge text for readability:
  - `.news-highlight-tag` from `10px` to `11px`
  - mobile `.news-highlight-tag` from `9px` to `10px`
  - mobile `.news-highlight-chips span` from `10px` to `11px`

## Remaining Manual Verification Items
- Text over image/gradient overlays (hero areas, pathway tiles, story band) should be re-checked in-browser at common viewport widths.
- Future visual changes should be re-audited, especially when introducing new accent backgrounds.
