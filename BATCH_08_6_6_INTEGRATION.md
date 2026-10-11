# Batch 08.6.6 — Final Integration Record

> Final-state correction. This document supersedes the original 08.6.6 draft guidance.

## Canonical migration architecture

Mzaya uses the custom SQL migration runner at `backend/scripts/migrate.js`.
`sequelize-cli` is **not** part of the migration architecture.

The final runner is deliberately selective:

- `node scripts/migrate.js status`
- `node scripts/migrate.js baseline --file <filename>`
- `node scripts/migrate.js baseline --through <filename>`
- `node scripts/migrate.js migrate --file <filename>`

Blanket migration execution is disabled. Real execution requires the exact migration file
plus `MIGRATION_EXECUTE_CONFIRM=I_HAVE_PROBED_THIS_MIGRATION`. Selective baselining
requires `MIGRATION_BASELINE_CONFIRM=I_HAVE_VERIFIED_THE_SCHEMA`.

Staging and production must not use `sequelize.sync()` at application boot.

## Final verified gate

The completed 08.6.6 sequence reached:

- 129/129 Jest suites passed;
- 260/260 Jest tests passed;
- 50 SQL migrations recorded;
- 0 pending migrations;
- 0 changed migration checksums;
- production dependency audit: 0 high/critical findings, 2 moderate findings in the
  Sequelize -> uuid advisory chain;
- `npm audit fix --force` rejected because the proposed path is breaking.

The reconciliation checker still reports one known parser artifact for
`20261011_staging_treasury_fx_rate_parity_repair.sql` (`table if`). This is not
authorization to mutate the database.

## Test database safety

`backend/tests/env.js` and `backend/tests/setup.js` are part of the committed final
baseline. They isolate Jest from staging/production, require a test-named database
for destructive setup, blank provider credentials, force mock payments, and avoid
printing raw database URLs.

## Preserved finance boundaries

- finance replay/outbox processing must never execute external money movement;
- provider/bank/Paynow/EcoCash transfers remain explicit operational actions;
- treasury/cutover controls preserve maker-checker expectations;
- rollback changes future routing only and never rewrites historical accounting;
- historical migrations are not edited to repair deployed schema.

The authoritative completed baseline is commit `424e71d6c72fdde7dd6d933899a77c39a64da543`.
