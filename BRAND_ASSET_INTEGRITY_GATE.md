# Mzaya brand asset integrity — release gate

The approved identity is the **custom vector** symbol and five-letter wordmark in the Figma master file. The official deep emerald is **#052A25**. Generic font-rendered `mzaya` is **not** an approved logo.

## Current repository findings (2026-11-09)

- `frontend/src/assets/brand/logos/mzaya-lockup-horizontal-primary.svg` contains live `<text>` for the wordmark, including Arial and a script tagline. This is **not** the approved custom vector lettering.
- `mzaya-mark-green.svg` and `mzaya-symbol-primary.svg` include legacy bright-green colors such as `#00A651`. The latter also has a gradient that does not match the flat approved emerald identity.
- The application components `MzayaIcon.jsx` and `MzayaLockup.jsx` still reference these legacy SVGs. Their replacement must be coordinated, not simulated with CSS filters or text fonts.

## Required next integration

1. Export canonical symbol, wordmark, horizontal/stacked lockups, and inverse/mono SVGs directly from the approved Figma vector masters.
2. Review path geometry, clear space, small-size legibility, and transparency.
3. Replace the exact files consumed by `MzayaIcon` and `MzayaLockup`, preserving import paths and accessibility.
4. Run `npm run brand:check` from `frontend/` and `npm run build`. Fix failures before merging.

The check intentionally fails against known legacy SVGs until they are replaced. It is an **audit gate**, not an automatic redesign or a claim that the assets are already fixed. This branch does not change the existing product appearance.
