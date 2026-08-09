# Mzaya Batch 08.5.2 — Orders & Delivery Completion → Finance Event Integration

This batch connects Mzaya's existing food, grocery, and materials order flows
to the transactional outbox and finance event engine.

## Source-baseline note

The current source ZIP still was not available in the accessible File Library.
However, the project history confirms the existing operational models include:

```text
backend/src/models/orderFoodModel.js
backend/src/models/orderGroceryModel.js
backend/src/models/orderMaterialsModel.js
```

Therefore this package deliberately does not overwrite those files or existing
order controllers/services. It provides merge-safe integration services and
exact completion-flow examples.

## Database

Review actual Sequelize table names before running the migration.

The migration currently assumes:

```text
orderFood
orderGrocery
orderMaterials
```

If the live models define different `tableName` values, adjust the ALTER TABLE
targets first.

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/order_delivery_finance_integration.sql
```

## Models

Export:

```js
OrderFinanceReconciliationResult
```

The reconciliation service expects existing aliases:

```js
OrderFood
OrderGrocery
OrderMaterials
```

If `associations.js` exports the current models under different names, update
the imports only; do not duplicate models.

## Route mount

```js
app.use(
  '/api/order-finance',
  require('./routes/orderFinance.routes')
);
```

## Completion integration

For every order type, the critical transaction is:

```text
order status update
      +
order.completed outbox event
      +
delivery.completed outbox event
      +
order economics upsert
      =
one DB transaction
```

Use the integration examples:

```text
backend/src/services/orderFoodService.integration.example.js
backend/src/services/orderGroceryService.integration.example.js
backend/src/services/orderMaterialsService.integration.example.js
```

Merge them into the existing completion/matching service rather than replacing
existing operational logic.

## Why two completion events?

`order.completed` means the commercial service obligation is completed.

`delivery.completed` means the delivery obligation is completed.

They may happen together today, but keeping them semantically distinct allows
future cases such as:

- collection orders,
- vendor-arranged delivery,
- partial procurement,
- multi-stop delivery,
- split fulfillment,
- scheduled delivery.

## Order economics

On completion, call:

```js
await upsertOrderEconomics({
  order,
  orderType: 'food',
  transaction,
});
```

This preserves the finance principle:

```text
gross order value != Mzaya revenue
```

The order-economics record stores GOV separately from:

- platform revenue,
- delivery revenue,
- procurement revenue,
- discounts,
- taxes.

## Posting templates

Seed:

```text
orderCompleted.js
deliveryCompleted.js
orderCancelled.js
```

The example completion posting recognizes only the relevant platform or
delivery fee. It does not post total order value as revenue.

Account codes must be mapped to the governed chart of accounts before
production.

## Reconciliation

The control traces:

```text
operational order
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
COMPLETED_ORDER_WITHOUT_OUTBOX
ORDER_OUTBOX_WITHOUT_FINANCE_EVENT
ORDER_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
ORDER_ACCOUNTING_EVENT_NOT_POSTED
ORDER_GOV_MISMATCH
```

## Background job

```js
const {
  startOrderFinanceReconciliationJob,
} = require('./jobs/orderFinanceReconciliation.job');

const orderFinanceReconciliationJob =
  startOrderFinanceReconciliationJob({ logger });
```

## Frontend route

```jsx
<Route
  path="/admin/finance/order-reconciliation"
  element={<OrderFinanceReconciliation />}
/>
```

## Existing-code safeguards

Before merging each example:

1. Find the existing status transition that marks the order completed/delivered.
2. Preserve all existing:
   - matching logic,
   - customer notifications,
   - vendor notifications,
   - Mzaya assignment,
   - ETA/tracking updates,
   - analytics hooks,
   - inventory changes.
3. Wrap only the financial state mutation and outbox insert in the same
   transaction.
4. Ensure completion is idempotent.
5. Do not publish events after commit.
6. Do not directly create ledger entries.

## Verification

```bash
cd backend

npm test -- orderFinanceEvents.test.js
npm test -- deliveryFinanceEvents.test.js
npm test -- orderFinanceAtomicity.test.js
npm test -- orderEconomicsIntegration.test.js
npm test -- orderFinanceReconciliation.test.js

node --check src/services/orderFinanceEvents.service.js
node --check src/services/deliveryFinanceEvents.service.js
node --check src/services/orderEconomicsIntegration.service.js
node --check src/services/orderFinanceReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

Batch 08.5.3 should integrate vendor settlements into the same event pipeline.
