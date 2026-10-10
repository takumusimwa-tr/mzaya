# Batch 08.6.6B — Dependency Security, Migration Baseline & Deployment Hardening

## Migration architecture
Mzaya already has a deliberate custom SQL migration runner at `backend/scripts/migrate.js`.
It is the canonical migration mechanism. Do not add `sequelize-cli`.

Existing commands:
- `npm run migrate:status`
- `npm run migrate`
- `npm run migrate:baseline`

For the already-bootstrapped staging database, `migrate:baseline` records all existing
`.sql` migrations in `schema_migrations` without executing their DDL. On a fresh
production database, do NOT baseline; run `npm run migrate` so the full SQL history
is applied in filename order.

Staging and production continue to skip `sequelize.sync()` at application boot.

## Dependency security
Use:
- `npm run security:audit`
- `npm run security:audit:json`

The production-only audit supplied at the 08.6.6 gate reported 2 moderate findings
and 0 high findings, through Sequelize -> uuid. npm's proposed forced remediation
would introduce a breaking Sequelize change, so `npm audit fix --force` is prohibited.

## Runtime
Supported runtime policy is Node 24.x (`>=24 <25`) and npm 11.x.

## Deployment order
For an already-baselined environment:
1. `npm ci`
2. `npm run migrate`
3. `node src/index.js`
4. verify PostgreSQL, Redis, finance runtime, realtime bridges, and HTTP health.

For staging's one-time adoption of the existing schema, run `npm run migrate:baseline`
only after reviewing `npm run migrate:status`.
