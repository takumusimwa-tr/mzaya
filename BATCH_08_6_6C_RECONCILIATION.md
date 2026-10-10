# Batch 08.6.6C Companion — Read-only Migration Reconciliation

Adds `backend/scripts/reconcile-migrations.js`.

The checker compares common schema signatures declared by every `.sql` migration with the target PostgreSQL catalogues:
- tables
- views/materialized views
- indexes
- functions
- `ALTER TABLE ... ADD COLUMN`
- named constraints

It opens a transaction, explicitly marks it read-only, queries catalogues, and rolls it back. It never executes migration SQL.

Verdicts are evidence, not automatic authorization:
- `BASELINE_CANDIDATE`: every safely parsed signature was found.
- `EXECUTION_OR_REPAIR_REQUIRED`: at least one parsed signature is absent.
- `MANUAL_REVIEW`: the SQL has no safely parsed signature or needs semantic review.

Do not baseline automatically from this report. Review `MANUAL_REVIEW` and migrations with data/trigger/DDL semantics before changing staging.
