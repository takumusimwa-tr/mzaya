# Mzaya Batch 08.4.8 — Transactional Outbox, Event Delivery & Finance Reliability

This batch hardens Batch 08.4.7 for distributed production use.

The critical invariant is:

```text
business state change
      +
finance outbox write
      =
same database transaction
```

If the transaction commits, both exist. If it rolls back, neither exists.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/finance_event_delivery.sql
```

## Register and export models

- `FinanceOutboxEvent`
- `FinanceDeliveryLease`
- `FinanceDeliveryAttempt`
- `FinanceConsumerOffset`
- `FinanceDeadLetter`
- `FinanceReliabilitySnapshot`

Recommended associations:

```js
FinanceOutboxEvent.hasMany(FinanceDeliveryAttempt, {
  foreignKey: 'outbox_event_id',
  as: 'deliveryAttempts',
});

FinanceOutboxEvent.hasMany(FinanceDeliveryLease, {
  foreignKey: 'outbox_event_id',
  as: 'leases',
});

FinanceOutboxEvent.hasMany(FinanceDeadLetter, {
  foreignKey: 'outbox_event_id',
  as: 'deadLetters',
});
```

## Route mounts

```js
app.use(
  '/api/finance-delivery',
  require('./routes/financeDelivery.routes')
);

app.use(
  '/api/finance-dead-letters',
  require('./routes/financeDeadLetter.routes')
);

app.use(
  '/api/finance-reliability',
  require('./routes/financeReliability.routes')
);
```

## Operational integration pattern

Inside the existing operational transaction:

```js
const { sequelize } = require('../config/db');
const {
  enqueueFinanceOutboxEvent,
} = require('../services/financeOutbox.service');

await sequelize.transaction(async (transaction) => {
  const payment = await Payment.update(
    { status: 'captured' },
    {
      where: { id: paymentId },
      transaction,
      returning: true,
    }
  );

  await enqueueFinanceOutboxEvent({
    transaction,
    aggregateType: 'payment',
    aggregateId: paymentId,
    eventType: 'payment.captured',
    sourceSystem: 'payments',
    payload: {
      paymentId,
      currency: 'USD',
      amountMinor: 1250,
    },
    idempotencyKey: `payment:${paymentId}:captured:v1`,
  });
});
```

Never enqueue the outbox event after the transaction has committed.

## First Mzaya domains to wire

Recommended sequence:

```text
1. payment.captured
2. payment.refunded
3. order.completed
4. vendor.settlement_paid
5. mzaya.payout_paid
6. procurement.completed
7. treasury.transfer_completed
8. tax.liability_created
```

## Delivery behavior

Outbox rows move through:

```text
pending
   ↓
publishing
   ↓
published
```

On failure:

```text
publishing
   ↓
retry
   ↓
retry...
   ↓
dead_letter
```

Retries use bounded exponential backoff.

## Delivery leases

Multiple workers may run the publisher concurrently.

A worker must acquire a short-lived lease before delivery.

Expired leases are recovered automatically and the associated event is moved
back to `retry`.

## Duplicate tolerance

The delivery layer is at-least-once.

Exactly-once effects are achieved by downstream idempotency:

```text
outbox:
  UNIQUE idempotency_key

finance business event:
  UNIQUE idempotency_key
```

The publisher may safely redeliver an event after uncertainty.

## Dead-letter handling

Events are quarantined after eight failed attempts.

Dead-letter replay must be explicit and should happen only after the underlying
configuration or data issue has been corrected.

Do not automatically replay external provider side effects.

## Jobs

```js
const {
  startFinanceOutboxPublisherJob,
} = require('./jobs/financeOutboxPublisher.job');

const {
  startFinanceDeliveryRecoveryJob,
} = require('./jobs/financeDeliveryRecovery.job');

const {
  startFinanceDeadLetterEscalationJob,
} = require('./jobs/financeDeadLetterEscalation.job');

const {
  startFinanceReliabilitySnapshotJob,
} = require('./jobs/financeReliabilitySnapshot.job');

const outboxPublisher =
  startFinanceOutboxPublisherJob({ logger });

const deliveryRecovery =
  startFinanceDeliveryRecoveryJob({ logger });

const deadLetterEscalation =
  startFinanceDeadLetterEscalationJob({ logger });

const reliabilitySnapshots =
  startFinanceReliabilitySnapshotJob({ logger });
```

## Socket.IO

```js
const {
  initializeFinanceDeliveryEventBridge,
} = require('./realtime/financeDeliveryEventBridge');

const closeFinanceDeliveryBridge =
  initializeFinanceDeliveryEventBridge(io);
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/delivery"
  element={<FinanceDeliveryMonitor />}
/>

<Route
  path="/admin/finance/dead-letters"
  element={<FinanceDeadLetterQueue />}
/>

<Route
  path="/admin/finance/reliability"
  element={<FinanceReliabilityDashboard />}
/>
```

## Reliability targets

Suggested initial operating objectives:

```text
delivery success rate        > 99.9%
p95 delivery latency         < 60 seconds
oldest pending event age     < 5 minutes
stale active leases          = 0
dead-letter queue            = 0 unresolved
consumer lag                 < 5 minutes
```

Tune these after real production traffic is available.

## Critical controls

- Never publish finance events outside the operational database transaction.
- Delivery is at-least-once; consumers must remain idempotent.
- Do not mark an outbox event published until the finance event engine accepts it.
- Recover stale leases automatically.
- Quarantine poison events instead of retrying forever.
- Preserve every delivery attempt for audit.
- Do not replay external payment, settlement, or treasury provider actions.
- Reconcile published outbox events to finance business events.
- Monitor event age, consumer lag, stale leases, and dead letters.
- Use database-backed workers or a durable queue before horizontal scale.

## Verification

```bash
cd backend

npm test -- outboxAtomicity.test.js
npm test -- eventDelivery.test.js
npm test -- leaseSafety.test.js
npm test -- deadLetter.test.js
npm test -- recovery.test.js

node --check src/services/financeOutbox.service.js
node --check src/services/financeEventDelivery.service.js
node --check src/services/financeDeliveryLease.service.js
node --check src/services/financeDeadLetter.service.js
node --check src/services/financeReliability.service.js

npm run lint
```

```bash
cd frontend

npm run lint
npm run build
```

## Next integration step

After this batch, stop expanding finance infrastructure horizontally.

Start wiring the existing operational modules into the outbox pattern one
domain at a time, beginning with payments and refunds because they have the
highest accounting and reconciliation sensitivity.
