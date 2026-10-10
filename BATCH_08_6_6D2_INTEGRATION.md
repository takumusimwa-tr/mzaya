# Batch 08.6.6D.2 — Wave-1 Finance Timestamp Repair

This patch adds one **new additive migration**. It does not edit historical migrations.

The deep staging audit proved that several existing finance tables were created before the canonical SQL migrations and are missing `created_at` columns expected by those migrations. This repair adds only those verified timestamp columns, using `ADD COLUMN IF NOT EXISTS ... DEFAULT NOW()`.

Important: do **not** run the normal migration runner yet. Because older migrations remain pending, `npm run migrate` would still start with unrelated pending files in filename order.

First probe this new repair migration:

    node --check scripts/probe-migration.js
    node scripts/probe-migration.js --file 20261011_staging_finance_timestamp_repair.sql

Return the output. A probe PASS still does not authorize real execution.

Excluded deliberately:
- `orders.rating/review` — genuine current product migration, not legacy repair.
- `payments_hardening.sql` reported `payment_attempts.so/a` — parser artifact requiring separate inspection.
- treasury FX missing columns — belongs to later treasury expansion/dependency wave.
