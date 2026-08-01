# Mzaya Batch 08.4.1 — Budgeting, Forecasting & Variance Analysis

This batch introduces FP&A capabilities above the ledger, close, treasury,
settlement, and tax layers.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/budgeting_forecasting_variance.sql
```

## Register and export models

- `Budget`
- `BudgetVersion`
- `BudgetLine`
- `BudgetAllocation`
- `Forecast`
- `ForecastVersion`
- `ForecastLine`
- `VarianceReport`
- `VarianceReportLine`

Required associations:

```js
Budget.hasMany(BudgetVersion, {
  foreignKey: 'budget_id',
  as: 'versions',
});

BudgetVersion.hasMany(BudgetLine, {
  foreignKey: 'budget_version_id',
  as: 'lines',
});

Forecast.hasMany(ForecastVersion, {
  foreignKey: 'forecast_id',
  as: 'versions',
});

ForecastVersion.hasMany(ForecastLine, {
  foreignKey: 'forecast_version_id',
  as: 'lines',
});

VarianceReport.hasMany(VarianceReportLine, {
  foreignKey: 'variance_report_id',
  as: 'lines',
});
```

## Route mounts

```js
app.use('/api/budgets', require('./routes/budget.routes'));
app.use('/api/forecasts', require('./routes/forecast.routes'));
app.use(
  '/api/variance-reports',
  require('./routes/variance.routes')
);
```

## Budget workflow

```text
draft
  ↓
approved
  ↓
active
  ↓
superseded
```

Budget creators cannot approve their own versions.

## Forecasting

Forecasts support:

```text
base
upside
downside
stress
```

The forecast service applies growth and confidence assumptions while preserving
integer minor units.

## Variance analysis

Supported report types:

```text
actual_vs_budget
actual_vs_forecast
```

Variance favorability rules:

- revenue above comparator is favorable
- expense below comparator is favorable

## Scheduled variance generation

```js
const {
  startBudgetVarianceJob,
} = require('./jobs/budgetVariance.job');

const budgetVarianceJob =
  startBudgetVarianceJob({ logger });
```

## Frontend routes

```jsx
<Route path="/admin/finance/budgets" element={<BudgetDashboard />} />
<Route path="/admin/finance/forecasts" element={<ForecastDashboard />} />
<Route path="/admin/finance/variance" element={<VarianceDashboard />} />
```

## Controls

- Require maker-checker approval for budget versions.
- Preserve every approved budget and forecast version.
- Never overwrite historical assumptions.
- Map departments and cost centers consistently.
- Keep actuals sourced from the immutable ledger.
- Do not treat forecasts as commitments.
- Variance reports should be regenerated after material close adjustments.

## Verification

```bash
cd backend
npm test -- budget.test.js
npm test -- forecast.test.js
npm test -- variance.test.js
node --check src/services/budget.service.js
node --check src/services/forecast.service.js
node --check src/services/variance.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
