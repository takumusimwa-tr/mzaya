# Batch 08.6.6C — Selective Migration Baseline Hardening

Staging reports 44/44 SQL migrations pending, but read-only probes show a partially bootstrapped schema. Blanket baseline is therefore disabled.

The runner now supports only explicit metadata-only baselines:
- `node scripts/migrate.js baseline --file <filename>`
- `node scripts/migrate.js baseline --through <filename>`

A baseline also requires `MIGRATION_BASELINE_CONFIRM=I_HAVE_VERIFIED_THE_SCHEMA`. Baseline never executes migration SQL and writes its selected tracking rows in one transaction.

Do not baseline `20261010_order_ratings.sql` on the currently verified staging schema: `orders.rating` and `orders.review` are absent. Do not run `migrate` against staging until the legacy inventory is reconciled.
