# Batch 08.6.6D.8 — Regression Gate Repair

Repairs the application-level finance regressions exposed after the Jest database
boundary was corrected.

Changes:
- restores `orderFood` and related order-type compatibility;
- accepts minor-unit and persisted USD order money fields without double conversion;
- aligns order economics with the shared finance payload adapter;
- restores `calculateTaxMinor()` over the canonical tax calculator;
- restores the pure `calculateContribution()` profitability helper.

No migrations, provider calls, external money movement, or historical accounting
rewrites are included.

The local `tests/env.js` and `tests/setup.js` safety changes are intentionally not
included because they are uncommitted local changes and are not present on GitHub
main. Preserve them when applying this patch.
