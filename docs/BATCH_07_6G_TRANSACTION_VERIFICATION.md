# Batch 07.6G — Isolated transaction verification preflight

This package introduces a read-only inventory, a local-DB guard, and offline Jest tests. It does **not** modify the application, database, or migrations.

## Default checks

From the repository root:

```powershell
node backend/scripts/pilot-transaction-gate.js
cd backend
npx jest --runInBand tests/pilotTransactionGate.audit.test.js tests/pilotLifecycleReadiness.audit.test.js tests/paymentDeliveryContract.audit.test.js
npm run lint
cd ..
git diff --check
```

## Optional isolated database testing — NOT a production release gate

**Only** on a disposable PostgreSQL database named `mzaya` running on localhost, with the schema already prepared. Existing fixtures may create, update, or delete rows, and the provider concurrency Jest suite invokes database-reset helpers. Back up any data first and never point these at staging or production.

```powershell
$env:CHECKOUT_FINANCE_CONFIRM = 'DISPOSABLE_LOCAL_DATABASE_ONLY'
$env:DB_URL = 'postgres://YOUR_LOCAL_USER:YOUR_LOCAL_PASSWORD@localhost:5432/mzaya'
node backend/scripts/pilot-transaction-gate.js --db
```

The `--db` option **only prints commands** after verifying the environment; it never executes tests or migrations. Review each existing test's own safety gates before running it. The provider-concurrency suite is especially destructive and must only be run on a disposable local database.

Passing offline checks does not certify real Paynow payments, deployment, migrations, or end-to-end reconciliation.
