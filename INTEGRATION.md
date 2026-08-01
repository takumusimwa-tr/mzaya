# Mzaya Batch 08.3.2 — Treasury FX, Cash Pooling & Exposure Management

This batch completes the core treasury layer with FX rates, currency exposure,
internal transfers, cash pools, concentration planning, limits and alerts.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/treasury_fx_cash_pooling.sql
```

## Register and export models

- `TreasuryFxRate`
- `TreasuryFxExposure`
- `TreasuryFxDeal`
- `TreasuryTransfer`
- `TreasuryCashPool`
- `TreasuryCashPoolMember`
- `TreasuryLimit`
- `TreasuryAlert`
- `LiquidityForecastVersion`

Suggested associations:

```js
TreasuryCashPool.hasMany(TreasuryCashPoolMember, {
  foreignKey: 'cash_pool_id',
  as: 'members',
});

TreasuryCashPoolMember.belongsTo(BankAccount, {
  foreignKey: 'bank_account_id',
  as: 'bankAccount',
});
```

## Route mounts

```js
app.use('/api/fx', require('./routes/fx.routes'));
app.use(
  '/api/treasury-transfers',
  require('./routes/treasuryTransfer.routes')
);
app.use('/api/cash-pools', require('./routes/cashPool.routes'));
app.use(
  '/api/treasury-risk',
  require('./routes/treasuryRisk.routes')
);
```

All routes are administrator-only.

## FX rates

FX rates are effective-dated and provider-sourced. Do not silently reuse stale
rates. Production adapters should deactivate expired rates and preserve source
metadata.

## Treasury transfers

Transfers support:

```text
internal
cash_pool
fx_conversion
```

Apply maker-checker approval from Batch 08.2.3 before execution.

## Cash pooling

The cash pool service creates a sweep plan only. It does not execute bank
transfers automatically.

Sweep directions:

```text
to_header
from_header
both
```

Each sweep must become a controlled treasury transfer.

## Exposure monitoring

Exposure is currently derived from available bank cash minus pending settlement
obligations by currency.

Reporting conversion requires a current FX rate.

## Limits and alerts

Treasury limits may monitor:

- FX exposure
- minimum liquidity
- concentration risk
- single-bank exposure
- payment-batch size
- forecast reserve gap

Open alerts remain visible until acknowledged or resolved.

## Exposure job

```js
const {
  startTreasuryExposureJob,
} = require('./jobs/treasuryExposure.job');

const treasuryExposureJob =
  startTreasuryExposureJob({ logger });
```

Optional configuration:

```env
TREASURY_EXPOSURE_CURRENCIES=USD,ZWL
TREASURY_REPORTING_CURRENCY=USD
```

## Frontend route

```jsx
<Route
  path="/admin/finance/treasury/risk"
  element={<TreasuryRiskDashboard />}
/>
```

## Controls

- Require approval for all treasury transfers.
- Never convert currencies without an explicit rate.
- Preserve FX rate source and timestamp.
- Do not auto-execute cash pool sweep plans.
- Keep transfer execution separate from planning.
- Reconcile completed transfers against bank statements.
- Set conservative exposure limits before enabling alerts in production.

## Verification

```bash
cd backend
npm test -- fxRate.test.js
npm test -- cashPooling.test.js
node --check src/services/fxRate.service.js
node --check src/services/fxExposure.service.js
node --check src/services/treasuryTransfer.service.js
node --check src/services/cashPooling.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
