# Batch 07.6D — Payment/delivery contract audit

Baseline: `73e6876736cd21e7e1822271c82312f12ccd4337` on `feat/advertising-platform-20261114`.

## Files to add (do not replace existing files)
- `backend/scripts/audit-payment-delivery-contract.js`
- `backend/tests/paymentDeliveryContract.audit.test.js`
- `docs/BATCH_07_6D_PAYMENT_DELIVERY_CONTRACT.md`

## Purpose
Offline regression tripwires around **separate** delivery and payment state. The current backend completes a delivery with proof, emits finance events, and updates courier earnings within a transaction. Payment status is recomputed from successful provider attempts. The customer order page explicitly distinguishes delivered-but-unpaid orders.

This patch **does not** change whether a courier can deliver an unpaid order, payment capture, ledger posting, database schema, or provider callbacks. Changing business rules requires deciding how cash-on-delivery, delayed settlement, and failed mobile-money attempts should behave.

## Run (from repo root)
```powershell
node backend/scripts/audit-payment-delivery-contract.js
cd backend
npx jest --runInBand tests/paymentDeliveryContract.audit.test.js
npm run lint
cd ..
git diff --check
```

## Limitations
This is a source-contract check, not a production payment test or proof of accounting reconciliation. It deliberately fails if implementation patterns are refactored; update the audit alongside an intentional refactor. Follow with disposable-local PostgreSQL transactional tests and sandbox Paynow callback tests before pilot launch. Do not run checkout finance fixtures against a real database.
