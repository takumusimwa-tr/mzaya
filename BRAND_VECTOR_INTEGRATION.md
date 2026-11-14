# Mzaya approved vector identity — Batch 02

Source: approved Figma vector exports supplied in the conversation, including `Mzaya — Wordmark Master.svg`.

## Included
Approved primary and white vector symbol, wordmark, horizontal and stacked lockups; compatibility marks; React brand components; brand asset integrity checker.

The wordmark and lockups retain outlined vector letterforms; no font substitute is used. The lockups do not contain the tagline inside the SVG; React renders `Tumai Mzaya.` separately.

## Validation
From `frontend/` run:

```bash
npm run brand:check
npm run lint
npm run build
```

## Outstanding
Public-facing brand assets under `frontend/public/brand/` (app icons, favicons, splash art) require dedicated review; do not assume the `src/assets` SVGs are accessible as public `/brand/logos/` URLs. The Vite chunk-size warning is unrelated to this identity pass.
