# Batch 08.6.6D.3 — Selective Migration Execution Gate

This **supersedes the local 08.6.6C `backend/scripts/migrate.js`** and preserves its selective baseline controls.

New safety behavior:
- blanket migration execution is disabled;
- real execution requires exactly `migrate --file <filename>`;
- `--through` is not accepted for execution;
- the exact file must exist in the migration directory;
- already-applied migration checksums are verified before execution;
- explicit `MIGRATION_EXECUTE_CONFIRM=I_HAVE_PROBED_THIS_MIGRATION` is required;
- migration SQL and the `schema_migrations` insert commit in the same transaction;
- failures roll back both.

For the already-probed 08.6.6D.2 repair only:

    $env:MIGRATION_EXECUTE_CONFIRM="I_HAVE_PROBED_THIS_MIGRATION"
    node scripts/migrate.js migrate --file 20261011_staging_finance_timestamp_repair.sql
    Remove-Item Env:MIGRATION_EXECUTE_CONFIRM
    npm run migrate:status

Do not execute another pending migration from this batch merely because the runner now supports `--file`.
