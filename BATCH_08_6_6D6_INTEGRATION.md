# Batch 08.6.6D.6 — Missing Finance Prerequisites

This patch adds one additive staging-repair migration:

`backend/migrations/20261011_staging_missing_finance_prerequisites.sql`

It introduces the three prerequisite structures that are absent from staging but
referenced by the two remaining historical migrations:

- `tax_jurisdictions`
- `tax_invoices`
- `financial_periods`

The verified staging row counts for tax transactions/liabilities/remittances and
ledger transactions/entries were all zero before this repair, so no historical
row reconciliation or backfill is included.

## Gate

1. Copy the migration into `backend/migrations/`.
2. Probe it first:

   `node scripts/probe-migration.js --file 20261011_staging_missing_finance_prerequisites.sql`

3. Do not execute it unless the probe passes.
4. After selective execution, reprobe:
   - `tax_reporting_operations.sql`
   - `financial_close_reporting.sql`

Do not edit or baseline the historical migrations.
