# Mzaya Batch 08.5.5 — Procurement → Finance Event Integration

This batch connects procurement activity to the finance event engine and
transactional outbox.

## Architecture

Procurement should remain an operational service. Finance consumes its events.

```text
customer procurement request
      ↓
funds authorized
      ↓
procurement approved
      ↓
procurement.approved
      ↓
sourcing / purchasing
      ↓
procurement completed
      ↓
procurement.completed
      ↓
unused funds?
      ├─ no
      └─ yes → procurement.refund_due
```

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/procurement_finance_integration.sql
```

## Models

Export:

```js
ProcurementRun
ProcurementItem
ProcurementFinanceReconciliationResult
```

Recommended associations:

```js
ProcurementRun.hasMany(ProcurementItem, {
  foreignKey: 'procurement_id',
  as: 'items',
});

ProcurementItem.belongsTo(ProcurementRun, {
  foreignKey: 'procurement_id',
  as: 'procurement',
});
```

Link customer, order, and vendor identifiers to existing authoritative models.

## Route mount

```js
app.use(
  '/api/procurement-finance',
  require('./routes/procurementFinance.routes')
);
```

## Critical accounting principle

Procured merchandise cost is not automatically Mzaya revenue.

Keep these distinct:

```text
customer authorized amount
merchandise cost
procurement fee
delivery fee
tax
discount
reimbursement
unused/refundable funds
```

Only the contractual procurement fee should be recognized as procurement
revenue.

## Transactional completion

The authoritative completion transaction should contain:

```text
procurement status = completed
        +
procurement.completed outbox event
        +
procurement.refund_due outbox event when applicable
        =
one transaction
```

Use:

```text
backend/src/services/procurement/procurementFinance.integration.example.js
```

as the merge-safe integration point.

## Posting templates

Seed:

```text
procurementApproved.js
procurementCompleted.js
procurementFeeEarned.js
procurementRefundDue.js
```

Illustrative flows:

```text
procurement merchandise:
  Dr PROCUREMENT_COST_OR_CLEARING
  Cr CUSTOMER_FUNDS_CLEARING

procurement fee:
  Dr CUSTOMER_FUNDS_CLEARING
  Cr PROCUREMENT_REVENUE

unused authorized funds:
  Dr CUSTOMER_FUNDS_CLEARING
  Cr CUSTOMER_REFUND_PAYABLE
```

Temporary account names must be mapped to governed chart-of-accounts codes.

## Refund safeguard

`procurement.refund_due` creates an accounting liability only.

It must not itself trigger external money movement.

Actual refund execution remains in the payment/treasury domain and should
ultimately flow through the payment refund integration from Batch 08.5.1.

## Reconciliation

The control traces:

```text
procurement
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
PROCUREMENT_WITHOUT_OUTBOX
PROCUREMENT_OUTBOX_WITHOUT_FINANCE_EVENT
PROCUREMENT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
PROCUREMENT_ACCOUNTING_EVENT_NOT_POSTED
PROCUREMENT_AMOUNT_MISMATCH
PROCUREMENT_CURRENCY_MISMATCH
```

## Background job

```js
const {
  startProcurementFinanceReconciliationJob,
} = require('./jobs/procurementFinanceReconciliation.job');

const procurementFinanceReconciliationJob =
  startProcurementFinanceReconciliationJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/procurement"
  element={<ProcurementFinanceDashboard />}
/>

<Route
  path="/admin/finance/procurement/reconciliation"
  element={<ProcurementFinanceReconciliation />}
/>
```

## Controls

- Do not recognize merchandise cost as Mzaya revenue.
- Keep procurement fee and delivery fee separate.
- Preserve item-level sourcing detail.
- Do not allow negative procurement spend.
- Do not publish completion events outside the operational transaction.
- Unused authorized funds become a refund liability, not instant cash movement.
- Keep vendor identity and order linkage where applicable.
- Procurement accounting replay must never duplicate purchases or refunds.
- Reconcile procurement-related refunds through the payment/treasury layers.

## Verification

```bash
cd backend

npm test -- procurementCalculator.test.js
npm test -- procurementFinanceEvents.test.js
npm test -- procurementAtomicity.test.js
npm test -- procurementRefund.test.js
npm test -- procurementReconciliation.test.js

node --check src/services/procurementCalculator.service.js
node --check src/services/procurementFinanceEvents.service.js
node --check src/services/procurement.service.js
node --check src/services/procurementReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

Proceed to Batch 08.5.6 — Treasury & Bank Movement → Finance Event Integration.
