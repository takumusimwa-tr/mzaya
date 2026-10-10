# Batch 08.6.6D.5B — Treasury FX Rate Parity Repair

Verified staging schema showed that `treasury_transfers` contains the current
bank-account/currency/amount/request fields but is missing the `fx_rate_id`
contract expected by `treasury_fx_cash_pooling.sql`.

This patch adds only:

- nullable `treasury_transfers.fx_rate_id UUID`
- FK to `treasury_fx_rates(id)` with `ON DELETE SET NULL`
- partial lookup index for non-null FX-rate references

It does not remove the harmless legacy nullable `failed_at` column. Removing
that extra column is unnecessary for functional contract parity and would be
destructive rather than additive.

## Gate

Probe first:

`node scripts/probe-migration.js --file 20261011_staging_treasury_fx_rate_parity_repair.sql`

Do not execute unless the probe passes. After selective execution, rerun the
treasury column/constraint inspection and `npm run migrate:status`.
