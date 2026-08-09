# Mzaya Batch 08.4.7 — Finance Integration Hub & Accounting Event Engine

This batch provides the accounting-event layer between Mzaya operational
services and the immutable finance ledger.

Operational services should publish business events. They should not construct
ledger journals directly.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/finance_event_engine.sql
```

## Register and export models

- `FinanceBusinessEvent`
- `FinanceAccountingEvent`
- `FinancePostingRule`
- `FinancePostingTemplate`
- `FinanceJournalBatch`
- `FinanceJournalBatchEvent`
- `FinancePostingFailure`
- `FinanceReplayQueue`
- `FinanceIntegrationLog`

Recommended associations:

```js
FinanceBusinessEvent.hasOne(FinanceAccountingEvent, {
  foreignKey: 'business_event_id',
  as: 'accountingEvent',
});

FinanceAccountingEvent.belongsTo(FinanceBusinessEvent, {
  foreignKey: 'business_event_id',
  as: 'businessEvent',
});

FinanceJournalBatch.belongsToMany(FinanceAccountingEvent, {
  through: FinanceJournalBatchEvent,
  foreignKey: 'journal_batch_id',
  otherKey: 'accounting_event_id',
  as: 'accountingEvents',
});
```

## Route mounts

```js
app.use(
  '/api/finance-events',
  require('./routes/financeEventEngine.routes')
);

app.use(
  '/api/finance-posting',
  require('./routes/financePosting.routes')
);

app.use(
  '/api/finance-replay',
  require('./routes/financeReplay.routes')
);
```

## Event contract

Every event must provide:

```json
{
  "eventType": "payment.captured",
  "sourceSystem": "payments",
  "sourceEntityType": "payment",
  "sourceEntityId": "uuid",
  "sourceReference": "PAY-12345",
  "occurredAt": "2026-08-09T10:00:00Z",
  "currency": "USD",
  "amountMinor": 1250,
  "payload": {},
  "idempotencyKey": "payments:PAY-12345:captured:v1"
}
```

The idempotency key must uniquely identify one business fact.

## Initial event taxonomy

Recommended operational events:

```text
order.created
order.completed
order.cancelled

payment.authorized
payment.captured
payment.failed
payment.refunded
payment.chargeback

vendor.settlement_due
vendor.settlement_paid

mzaya.payout_due
mzaya.payout_paid

procurement.completed
delivery.completed

promotion.applied
subscription.invoiced
subscription.paid

treasury.transfer_completed
tax.liability_created
```

## Posting templates

Posting templates contain declarative journal lines.

Example:

```json
{
  "templateKey": "payment_capture_customer_funds",
  "lines": [
    {
      "accountCode": "CASH_AT_BANK",
      "direction": "debit",
      "amountSource": "event.amount_minor"
    },
    {
      "accountCode": "CUSTOMER_FUNDS_PAYABLE",
      "direction": "credit",
      "amountSource": "event.amount_minor"
    }
  ]
}
```

The posting engine rejects any generated journal where total debits do not
equal total credits.

## Ledger adapter

Batch 08.4.7 deliberately prepares accounting events before final ledger
posting. Connect the prepared journal payload to the existing immutable ledger
service rather than duplicating ledger logic here.

Production sequence:

```text
business event
   ↓
posting rule resolution
   ↓
posting template
   ↓
balanced accounting event
   ↓
period lock validation
   ↓
immutable ledger posting
   ↓
ledger transaction reference stored
```

Use the `assertPeriodOpen()` service introduced in Batch 08.4.6 before final
ledger posting.

## Idempotency

Both layers are protected:

```text
business event:
  UNIQUE idempotency_key

accounting event:
  UNIQUE business_event_id
```

A duplicate event with the same key and payload returns the existing event.

A duplicate event with the same key but a different payload must fail with:

```text
FINANCE_EVENT_IDEMPOTENCY_CONFLICT
```

## Replay and dead-letter handling

Failed events enter a controlled replay queue.

Retries use exponential backoff and stop at eight attempts, after which the
queue item becomes:

```text
dead_letter
```

Do not retry payment, treasury, or external-provider side effects from this
engine. Replay accounting interpretation only.

## Jobs

```js
const {
  startFinanceReplayJob,
} = require('./jobs/financeReplay.job');

const {
  startPostingFailureJob,
} = require('./jobs/postingFailure.job');

const {
  startOrphanEventJob,
} = require('./jobs/orphanEvent.job');

const financeReplayJob =
  startFinanceReplayJob({ logger });

const postingFailureJob =
  startPostingFailureJob({ logger });

const orphanEventJob =
  startOrphanEventJob({ logger });
```

## Socket.IO

```js
const {
  initializeFinanceEventBridge,
} = require('./realtime/financeEventBridge');

const closeFinanceEventBridge =
  initializeFinanceEventBridge(io);
```

Call the cleanup function during graceful shutdown.

## Frontend routes

```jsx
<Route
  path="/admin/finance/events"
  element={<FinanceEventEngine />}
/>

<Route
  path="/admin/finance/posting"
  element={<FinancePostingCenter />}
/>

<Route
  path="/admin/finance/replay"
  element={<FinanceReplayQueue />}
/>
```

## Integration rule for operational modules

Do not replace existing operational state changes.

Instead:

```text
operational transaction commits
      ↓
publish finance business event
      ↓
finance event engine processes independently
```

For production reliability, migrate event publication to a transactional
outbox pattern so an operational commit and its finance event cannot diverge.

## Important controls

- Operational services never create ledger entries directly.
- Posting templates must use account codes governed by finance master data.
- Every event must carry a stable idempotency key.
- Generated journals must balance before posting.
- Posting to locked periods must fail.
- Failed interpretation may be replayed; external provider actions must not be.
- Preserve business events, accounting events, failures, and integration logs.
- Posting rule changes must use master-data change control from Batch 08.4.6.
- The ledger remains the accounting system of record; this engine is the
  controlled integration layer feeding it.

## Verification

```bash
cd backend

npm test -- postingRules.test.js
npm test -- idempotency.test.js
npm test -- balancing.test.js
npm test -- replay.test.js

node --check src/services/financeEventEngine.service.js
node --check src/services/financePostingEngine.service.js
node --check src/services/financePostingRule.service.js
node --check src/services/financeReplay.service.js

npm run lint
```

```bash
cd frontend

npm run lint
npm run build
```
