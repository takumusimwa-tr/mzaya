# Batch 07.6H — Database isolation review

This batch adds an **offline source audit only**. It does not connect to PostgreSQL, run fixtures, modify application logic, or execute migrations.

## Finding

The existing `backend/scripts/pilot-transaction-gate.js` preflight accepts only a localhost database with the path `/mzaya`. The provider concurrency suite (`backend/tests/providerOutcomeConcurrency.e2e.test.js`) calls `resetDatabase()` from `backend/tests/setup.js`; that reset helper requires a database name containing `test` and may drop/recreate tables. The finance fixture (`checkout075r.finance.postgres.test.js`) separately requires a disposable local database named `mzaya` and explicit confirmation. These are **different testing environments** and must not be treated as one approved target.

**Do not run the provider-concurrency Jest suite with the 07.6G `--db` preflight as its sole safety check.** Do not rename or loosen the guards merely to make a test pass. Never use staging, production, or a database containing valuable data.

## Offline validation

From repository root:

```powershell
node backend/scripts/pilot-db-isolation-audit.js
cd backend
npx jest --runInBand tests/pilotDbIsolation.audit.test.js
npm run lint
cd ..
git diff --check
```

## Next decision

Before live testing, provision **separate disposable local PostgreSQL databases** and inspect the complete reset helper and each fixture's guards. For the reset suite, use a test-named database and its own reset safety controls. For the checkout finance fixture, use the explicitly allowed local `mzaya` disposable database. No live testing is authorized by this package.
