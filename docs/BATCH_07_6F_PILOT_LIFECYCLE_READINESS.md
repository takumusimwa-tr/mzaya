# Mzaya Batch 07.6F — Pilot Lifecycle Readiness Inventory

This batch adds **read-only offline checks**. It does not alter payments, orders, migrations, or production configuration.

## Scope

Customer checkout → payment confirmation → vendor fulfillment → dispatch/claim → delivery proof → finance event → reconciliation.

The script verifies expected files and selected source markers. It **does not prove** the complete lifecycle works. In particular, vendor acceptance, actual provider settlement, concurrency, database state, webhook delivery, and financial reconciliation require isolated integration and sandbox tests.

## Run (repository root)

```powershell
node backend/scripts/pilot-lifecycle-readiness.js
cd backend
npx jest --runInBand tests/pilotLifecycleReadiness.audit.test.js tests/paymentDeliveryContract.audit.test.js
npm run lint
cd ..
git diff --check
```

Do **not** run disposable PostgreSQL tests against staging/production. Existing `checkout075r.finance.postgres.test.js` requires explicit local disposable DB confirmation.

## Next manual gates

1. Confirm production-mode mock payment prohibition and sandbox Paynow callback verification.
2. Verify unpaid/delivered, failed/retried, and duplicate webhook outcomes on isolated fixtures.
3. Test vendor acceptance and rider assignment with two concurrent claimants.
4. Test delivery proof, duplicate delivered replay, earnings, and finance outbox atomicity.
5. Reconcile payment attempts, provider references, order payment status, ledger, and vendor/rider payables.
6. Verify rollback and migration readiness without modifying live databases.
