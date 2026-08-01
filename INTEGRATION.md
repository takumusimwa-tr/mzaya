# Mzaya Batch 08.3.3 — Treasury Execution, FX Deals & Liquidity Forecasting

This batch adds the controlled execution layer for treasury transfers, the FX
deal lifecycle, and versioned liquidity scenario forecasting.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/treasury_execution_forecasting.sql
```

## Register and export models

- `TreasuryTransferAttempt`
- `TreasuryTransferAudit`
- `LiquidityForecastScenario`
- `LiquidityForecastVersion`
- `LiquidityForecastLine`

Required associations:

```js
TreasuryTransfer.hasMany(TreasuryTransferAttempt, {
  foreignKey: 'treasury_transfer_id',
  as: 'attempts',
});

LiquidityForecastVersion.hasMany(LiquidityForecastLine, {
  foreignKey: 'forecast_version_id',
  as: 'lines',
});
```

## Route mounts

```js
app.use(
  '/api/treasury-execution',
  require('./routes/treasuryExecution.routes')
);

app.use('/api/fx-deals', require('./routes/fxDeal.routes'));

app.use(
  '/api/liquidity-forecasts',
  require('./routes/liquidityForecast.routes')
);
```

## Treasury transfer workflow

```text
draft
  ↓
approved
  ↓
processing
  ↓
completed / failed
```

The requester cannot approve the same transfer.

Production execution belongs inside:

```text
backend/src/services/treasuryTransferGateway.service.js
```

Keep disabled until a real bank adapter is configured:

```env
TREASURY_TRANSFER_MODE=disabled
```

## Execution accounting

Bank balances are updated only after the provider confirms success.

Completed transfers must also be represented in the immutable ledger and later
reconciled against imported bank statements. Add the final ledger posting when
the treasury bank-account ledger mapping is confirmed.

## FX deals

FX deals support:

- booked
- approved
- settled
- failed
- cancelled

The included settlement service records provider and external references.

## Liquidity forecasts

Scenarios can represent:

```text
base
upside
downside
stress
```

Scenario assumptions may include:

- inflow multiplier
- outflow multiplier
- confidence ratio
- delayed collections
- accelerated settlement outflows

Forecast lines preserve daily inflow, outflow, net movement, and closing cash.

## Retry job

```js
const {
  startTreasuryTransferRetryJob,
} = require('./jobs/treasuryTransferRetry.job');

const treasuryTransferRetryJob =
  startTreasuryTransferRetryJob({ logger });
```

Automated retries should remain disabled or tightly controlled until the bank
provider's idempotency behavior is verified.

## Frontend route

```jsx
<Route
  path="/admin/finance/treasury/execution"
  element={<TreasuryExecutionDashboard />}
/>
```

## Controls

- Require maker-checker approval.
- Use transfer reference as provider idempotency key.
- Never update balances before provider confirmation.
- Never retry blindly against providers without idempotency support.
- Reconcile all completed transfers.
- Preserve all execution attempts and provider responses.
- Require approved FX rates for cross-currency transfers.
- Keep forecast assumptions versioned and auditable.

## Verification

```bash
cd backend
npm test -- treasuryTransferExecution.test.js
npm test -- liquidityForecast.test.js
node --check src/services/treasuryTransferExecution.service.js
node --check src/services/liquidityForecast.service.js
node --check src/services/fxDeal.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
