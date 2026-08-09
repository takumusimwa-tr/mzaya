# Mzaya Batch 08.5.3 — Vendor Settlements → Finance Event Integration

This batch connects vendor settlement liabilities and payouts to the finance
event engine introduced in Batch 08.4.7 and the transactional outbox introduced
in Batch 08.4.8.

## Existing-code note

The currently searchable project snapshot shows the existing backend structure
and order models, but did not return a live vendor settlement implementation.
Accordingly, this package keeps the new integration under the already-existing
`vendor` terminology and provides:

```text
backend/src/services/vendor/vendorSettlement.integration.example.js
```

Merge that file into the existing vendor domain rather than creating a
parallel `merchant` or second vendor hierarchy.

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/vendor_settlement_finance_integration.sql
```

## Models and associations

Export:

```js
VendorSettlement
VendorSettlementItem
VendorSettlementFinanceReconciliationResult
```

Recommended associations:

```js
VendorSettlement.hasMany(VendorSettlementItem, {
  foreignKey: 'settlement_id',
  as: 'items',
});

VendorSettlementItem.belongsTo(VendorSettlement, {
  foreignKey: 'settlement_id',
  as: 'settlement',
});
```

Connect `vendor_id` to the authoritative existing vendor model once its live
model name is confirmed.

## Route mount

```js
app.use(
  '/api/vendor-settlements',
  require('./routes/vendorSettlement.routes')
);
```

## Settlement lifecycle

```text
draft
  ↓
approved
  ↓
vendor.settlement_due
  ↓
payment initiated externally
  ↓
paid / partially_paid
  ↓
vendor.settlement_paid
  ↓
finance event engine
  ↓
ledger
```

The approval transaction and `vendor.settlement_due` outbox event are atomic.

The final `vendor.settlement_paid` event is emitted only when the settlement is
fully paid.

## Settlement calculation

The settlement engine keeps these components separate:

```text
gross sales
- refunds
- discounts
- commission
- platform fees
- withholding tax
+/- adjustments
= vendor amount due
```

Vendor gross sales are not a Mzaya expense.

The payable is the amount contractually owed to the vendor after deductions.

## Posting templates

Seed:

```text
vendorSettlementDue.js
vendorSettlementPaid.js
```

Expected accounting flow:

```text
settlement due:
  Dr CUSTOMER_FUNDS_CLEARING
  Cr VENDOR_PAYABLE

settlement paid:
  Dr VENDOR_PAYABLE
  Cr CASH_AT_BANK
```

Map these account codes to the governed chart of accounts before production.

## Payment-provider safeguard

Do not use this finance integration service to call bank, Paynow, mobile-money,
or other payout providers.

The provider payout remains an operational treasury/vendor action.

Only after provider confirmation should:

```js
markVendorSettlementPaid(...)
```

be called.

This keeps financial replay safe: accounting events may be replayed, external
money movements must never be duplicated.

## Reconciliation

The settlement control traces:

```text
vendor settlement
      ↓
finance outbox
      ↓
finance business event
      ↓
accounting event
      ↓
ledger
```

Exceptions include:

```text
SETTLEMENT_WITHOUT_OUTBOX
SETTLEMENT_OUTBOX_WITHOUT_FINANCE_EVENT
SETTLEMENT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
SETTLEMENT_ACCOUNTING_EVENT_NOT_POSTED
SETTLEMENT_AMOUNT_MISMATCH
SETTLEMENT_CURRENCY_MISMATCH
```

## Background job

```js
const {
  startVendorSettlementReconciliationJob,
} = require('./jobs/vendorSettlementReconciliation.job');

const vendorSettlementReconciliationJob =
  startVendorSettlementReconciliationJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/vendor-settlements"
  element={<VendorSettlementDashboard />}
/>

<Route
  path="/admin/finance/vendor-settlements/reconciliation"
  element={<VendorSettlementReconciliation />}
/>
```

## Controls

- Use `vendor`, not a parallel merchant settlement domain.
- Settlement approval must be separate from external payout execution.
- Never pay more than `amount_due_minor`.
- Keep partial payments explicit.
- Do not emit the final paid event until fully settled.
- Preserve order-level settlement items.
- Withholding tax must remain separately identifiable.
- Provider references must be retained.
- External payout execution must remain idempotent.
- Accounting replay must never re-trigger cash movement.
- Reconcile vendor payouts to treasury and bank activity later in Batch 08.5.6.

## Verification

```bash
cd backend

npm test -- vendorSettlementCalculator.test.js
npm test -- vendorSettlementFinanceEvents.test.js
npm test -- vendorSettlementAtomicity.test.js
npm test -- vendorSettlementOverpayment.test.js
npm test -- vendorSettlementReconciliation.test.js

node --check src/services/vendorSettlementCalculator.service.js
node --check src/services/vendorSettlementFinanceEvents.service.js
node --check src/services/vendorSettlement.service.js
node --check src/services/vendorSettlementReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

Proceed to Batch 08.5.4 — Mzaya payouts → Finance Event Integration.
