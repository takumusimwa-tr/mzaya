# Mzaya Batch 08.1.5 — Provider Webhooks & Automated Reconciliation

This batch completes the finance platform's provider-integration layer with
durable webhook ingestion, signature verification, retries, dead-letter states,
and scheduled reconciliation runs.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/provider_webhooks.sql
```

## Register and export models

- `ProviderWebhookEvent`
- `ProviderWebhookAttempt`
- `ReconciliationRun`

Suggested associations:

```js
ProviderWebhookEvent.hasMany(ProviderWebhookAttempt, {
  foreignKey: 'webhook_event_id',
  as: 'attempts',
});

ProviderWebhookAttempt.belongsTo(ProviderWebhookEvent, {
  foreignKey: 'webhook_event_id',
  as: 'event',
});
```

## Route mounting order

Webhook routes must be mounted before the global JSON body parser when exact
raw-body verification is required:

```js
app.use(
  '/api/provider-webhooks',
  require('./routes/providerWebhook.routes')
);

app.use(express.json());

app.use(
  '/api/provider-webhook-admin',
  require('./routes/providerWebhookAdmin.routes')
);
```

## Provider signature verification

Production verification belongs in:

```text
backend/src/services/providerSignature.service.js
```

The Paynow branch is intentionally disabled except in explicit test mode:

```env
PAYNOW_WEBHOOK_VERIFICATION_MODE=disabled
```

Do not enable production processing until verification matches official
provider documentation.

For generic HMAC testing:

```env
GENERIC_WEBHOOK_SECRET=replace-me
```

## Processor job

```js
const {
  startProviderWebhookProcessor,
} = require('./jobs/providerWebhookProcessor.job');

const providerWebhookProcessor =
  startProviderWebhookProcessor({ logger });
```

The processor runs every two minutes and uses exponential retry delays.

Optional:

```env
WEBHOOK_MAX_ATTEMPTS=8
```

Terminal failures move to `dead_letter`.

## Reconciliation automation

Inject provider statement adapters:

```js
const {
  runAutomatedReconciliation,
} = require(
  './services/reconciliationAutomation.service'
);

const {
  startReconciliationAutomation,
} = require(
  './jobs/reconciliationAutomation.job'
);

const reconciliationAutomation =
  startReconciliationAutomation({
    logger,
    runAutomatedReconciliation,
    providers: [
      {
        name: 'paynow',
        adapter: paynowStatementAdapter,
      },
    ],
  });
```

Adapter contract:

```js
adapter.fetchStatement({ statementDate })
```

Each returned record should contain:

```js
{
  providerReference,
  internalReference,
  recordType,
  currency,
  amountMinor,
  payload
}
```

## Socket.IO

```js
const {
  initializeProviderWebhookEventBridge,
} = require('./realtime/providerWebhookEventBridge');

const closeProviderWebhookBridge =
  initializeProviderWebhookEventBridge(io);
```

Call `closeProviderWebhookBridge()` during graceful shutdown.

## Frontend route

```jsx
<Route
  path="/admin/finance/providers"
  element={<ProviderOperations />}
/>
```

Protect it with the existing administrator route guard.

## Capabilities

- Raw provider webhook ingestion
- Signature-verification boundary
- Duplicate-event protection
- Durable event storage
- Asynchronous processing
- Exponential retries
- Dead-letter state
- Manual administrator retries
- Payment-status routing
- Refund-status routing
- Chargeback registration
- Automatic reconciliation records
- Scheduled statement reconciliation
- Reconciliation run history
- Real-time finance dashboard invalidation
- Provider operations interface

## Security and controls

- Never trust unsigned provider requests.
- Do not log secrets or full authorization headers.
- Keep provider integration keys server-side.
- Store the original webhook payload once.
- Processing is idempotent by provider event ID.
- Manual retries remain administrator-only.
- Finance dashboards receive refresh signals, not raw provider payloads.
- Raw payload retention should follow the final privacy policy.

## Verification

```bash
cd backend
npm test -- providerSignature.test.js
npm test -- providerWebhookProcessor.test.js
node --check src/services/providerWebhook.service.js
node --check src/services/providerWebhookProcessor.service.js
node --check src/services/reconciliationAutomation.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Finance milestone complete

```text
08.1.1 Payment Ledger Core
08.1.2 Refunds, Chargebacks & Disputes
08.1.3 Vendor & Mzaya Settlement Engine
08.1.4 Finance Operations Dashboard
08.1.5 Provider Webhooks & Automated Reconciliation
```

The next major milestone is:

```text
08.2 — Tax, Compliance & Financial Governance
```
