# Batch 08.6.6D.8 — Regression Gate Repair

Repairs the application-level finance regressions exposed after the Jest database
boundary was corrected.

## Changes

- restores `orderFood` and related order-type compatibility;
- accepts minor-unit and persisted USD order money fields without double conversion;
- aligns order economics with the shared finance payload adapter;
- restores `calculateTaxMinor()` over the canonical tax calculator;
- restores the pure `calculateContribution()` profitability helper.

No migrations, provider calls, external money movement, or historical accounting
rewrites are included in D.8.

## Final integration note

During the final 08.6.6 closure, the hardened `backend/tests/env.js` and
`backend/tests/setup.js` files were intentionally included in commit
`424e71d6c72fdde7dd6d933899a77c39a64da543`.

Those test guards are therefore part of the authoritative baseline. They:

- force `NODE_ENV=test`;
- force mock-payment mode and blank Paynow credentials before app modules load;
- strongly prefer `TEST_DB_URL`;
- reject destructive setup unless the actual database name contains `test`;
- select local/remote PostgreSQL SSL before `config/db.js` loads;
- independently re-check the destructive target before `sequelize.sync({ force: true })`;
- sanitize database errors so connection credentials are not printed.

Final regression result: 129/129 suites and 260/260 tests passed.
