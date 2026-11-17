# Batch 07.6I — Local database readiness preflight

This batch adds an **offline** environment classifier and Jest regression tests. It never opens a database connection, runs migrations, changes data, or prints credentials. It does not establish that a database is disposable.

## Run

From the repository root:

```powershell
node backend/scripts/pilot-local-db-preflight.js
cd backend
npx jest --runInBand tests/pilotLocalDbPreflight.audit.test.js
npm run lint
cd ..
git diff --check
```

`REVIEW` on the environment checks is expected when local database configuration is absent. Do not set any confirmation flags merely to make the preflight green.

## Important distinctions

- Claim fixture uses `CHECKOUT_CLAIM_CONFIRM`.
- Lifecycle fixture uses `CHECKOUT_LIFECYCLE_CONFIRM`.
- Finance fixture uses `CHECKOUT_FINANCE_CONFIRM` and requires a local database named `mzaya`.
- Provider concurrency uses `tests/setup.js`, which invokes `sequelize.sync({ force: true })` and requires a database name containing `test` plus `NODE_ENV=test`.

These fixtures **cannot safely be treated as one suite against one DB_URL**. Run no database-backed tests until you have independently confirmed a truly disposable local database and understood each fixture's cleanup/reset behavior. Never share connection strings or `.env` contents.
