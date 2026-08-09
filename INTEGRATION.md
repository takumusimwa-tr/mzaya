# Mzaya Batch 08.5.1 — Payments & Refunds → Finance Event Integration

This batch is the first operational integration into the Batch 08.4.7/08.4.8
finance event pipeline.

## Important baseline note

The current Mzaya source ZIP was not available to this runtime, so this package
does **not** blindly overwrite `paymentService.js` or `payment.controller.js`.

Instead it provides:
- production integration services,
- refund workflow,
- posting-template seeds,
- reconciliation controls,
- route/controller additions,
- and `paymentService.integration.example.js` showing exactly how to merge the
  outbox write into the existing payment transaction.

Merge that pattern into the current payment service after inspecting the
provider-specific Paynow/payment implementation in the working tree.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/payment_finance_integration.sql
```

## Models

Export and associate:

```js
Payment.hasMany(PaymentRefund, {
  foreignKey: 'payment_id',
  as: 'refunds',
});

PaymentRefund.belongsTo(Payment, {
  foreignKey: 'payment_id',
  as: 'payment',
});
```

Also export:
- `PaymentFinanceReconciliationResult`

## Route mount

```js
app.use(
  '/api/payment-finance',
  require('./routes/paymentFinance.routes')
);
```

## Payment capture integration

Inside the **existing** payment capture transaction:

```js
await payment.update({
  status: 'captured',
  provider_reference: providerReference,
}, { transaction });

await emitPaymentCaptured({
  payment,
  transaction,
});
```

The state update and outbox insert must be in the same DB transaction.

## Refund integration

Use `requestRefund()` for a controlled refund record and finance event.

Only after the provider confirms the refund should `markRefundCompleted()` be
called.

Do not emit `payment.refunded` before provider confirmation.

## Posting templates

Seed the four templates from:

```text
backend/src/config/financePostingTemplates/paymentCaptured.js
backend/src/config/financePostingTemplates/paymentRefunded.js
backend/src/config/financePostingTemplates/paymentChargeback.js
backend/src/config/financePostingTemplates/gatewayFeePosted.js
```

Account codes must be mapped to the governed chart of accounts before
production.

## Reconciliation control

The reconciliation service checks:

```text
payment
  ↓
finance outbox
  ↓
finance business event
  ↓
accounting event
  ↓
ledger transaction
```

Detected exceptions include:
- `CAPTURE_WITHOUT_OUTBOX`
- `OUTBOX_WITHOUT_FINANCE_EVENT`
- `FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT`
- `ACCOUNTING_EVENT_NOT_POSTED`
- `PAYMENT_LEDGER_AMOUNT_MISMATCH`
- `PAYMENT_ACCOUNTING_CURRENCY_MISMATCH`

## Background job

```js
const {
  startPaymentFinanceReconciliationJob,
} = require('./jobs/paymentFinanceReconciliation.job');

const paymentFinanceReconciliationJob =
  startPaymentFinanceReconciliationJob({ logger });
```

## Frontend route

```jsx
<Route
  path="/admin/finance/payment-reconciliation"
  element={<PaymentFinanceReconciliation />}
/>
```

## Verification

```bash
cd backend

npm test -- paymentCapturedFinance.test.js
npm test -- refundFinance.test.js
npm test -- paymentIdempotency.test.js
npm test -- paymentOutboxAtomicity.test.js
npm test -- paymentFinanceReconciliation.test.js

node --check src/services/paymentFinanceEvents.service.js
node --check src/services/refundFinanceEvents.service.js
node --check src/services/paymentRefund.service.js
node --check src/services/paymentAccountingReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

After payment capture/refund integration is merged into the live payment
service, proceed to Batch 08.5.2: order and delivery completion → finance
events.
