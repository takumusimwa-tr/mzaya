# Batch 08.6.6D.1 — Deep Schema Drift Audit

Read-only companion to the migration reconciliation/probe tooling.

It parses columns declared by `CREATE TABLE` and `ALTER TABLE ... ADD COLUMN` statements in every SQL migration and compares them with `information_schema.columns` on the selected database.

It does **not** execute migration SQL, modify `schema_migrations`, or perform DDL/DML.

Run:

    node --check scripts/audit-migration-schema.js
    node scripts/audit-migration-schema.js

Keep `DB_URL` pointed at staging and `NODE_ENV=staging`. Return the complete output before any migration/baseline operation.

Classification:
- `COLUMNS_PRESENT`: all parsed expected columns exist; this does not prove indexes/constraints/triggers/data semantics.
- `COLUMN_DRIFT`: referenced tables exist but expected columns are missing.
- `ABSENT_OR_NEW`: at least one migration-created table is absent; likely genuinely unapplied/new domain work.

This is evidence gathering only. Do not use the result as automatic migration authorization.
