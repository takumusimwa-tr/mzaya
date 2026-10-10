# Batch 08.6.6D.4 — Favorites Brand Uniqueness Repair

Staging already has `favorites.brand_id` as UUID/NOT NULL, no `vendor_id`, the brand FK,
and zero favorite rows. The historical `favorites_to_brands.sql` cannot safely execute
because its backfill still references `favorites.vendor_id`.

This repair adds only the missing `favorites_customer_id_brand_id_key` UNIQUE constraint
on `(customer_id, brand_id)`. It performs no backfill, delete, or row rewrite.

## Gate

Probe first:

    node scripts/probe-migration.js --file 20261011_staging_favorites_brand_uniqueness_repair.sql

Do not execute until that probe passes. After execution through the selective migration
gate, rerun `node scripts/reconcile-migrations.js`. Only if `favorites_to_brands.sql`
then reports `BASELINE_CANDIDATE` should that historical migration be selectively
baselined; it must not be executed.

Commit remains on hold.
