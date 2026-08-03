# Mzaya Batch 08.4.4 — Executive Finance Analytics, KPI Governance & Board Reporting

This batch unifies the authoritative finance modules into a controlled
executive decision layer.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/executive_finance_reporting.sql
```

## Register and export models

- `FinanceKpiDefinition`
- `FinanceKpiSnapshot`
- `FinanceReportingPack`
- `FinanceReportingSection`
- `FinanceNarrative`
- `FinanceReportingSchedule`
- `FinanceReportingDistribution`
- `ExecutiveFinanceAlert`

Required associations:

```js
FinanceKpiDefinition.hasMany(FinanceKpiSnapshot, {
  foreignKey: 'kpi_definition_id',
  as: 'snapshots',
});

FinanceReportingPack.hasMany(FinanceReportingSection, {
  foreignKey: 'reporting_pack_id',
  as: 'sections',
});

FinanceReportingPack.hasMany(FinanceNarrative, {
  foreignKey: 'reporting_pack_id',
  as: 'narratives',
});
```

## Route mounts

```js
app.use(
  '/api/executive-finance',
  require('./routes/executiveFinance.routes')
);

app.use(
  '/api/finance-kpis',
  require('./routes/financeKpi.routes')
);

app.use(
  '/api/finance-reporting-packs',
  require('./routes/financeReportingPack.routes')
);
```

All routes are administrator-only.

## Seed KPI definitions

Recommended KPI keys:

```text
gross_order_value
recognized_revenue
contribution_margin_ratio
net_margin_ratio
revenue_per_order
contribution_per_order
available_cash
cash_runway_days
budget_variance_ratio
forecast_variance_ratio
close_completion_ratio
reconciliation_exception_count
```

Each KPI definition must document:

- business definition
- formula version
- authoritative data sources
- aggregation method
- unit
- owner
- favorable direction
- warning threshold
- critical threshold

## Reporting packs

Supported pack types:

```text
weekly
management
board
investor
```

Generated sections currently include:

- executive summary
- liquidity and treasury
- profitability
- budget and forecast
- close readiness

The export provider should generate PDF and spreadsheet files from approved
pack snapshots, not from live mutable queries.

## Jobs

```js
const {
  startFinanceKpiSnapshotJob,
} = require('./jobs/financeKpiSnapshot.job');

const {
  startManagementPackJob,
} = require('./jobs/managementPack.job');

const financeKpiSnapshotJob =
  startFinanceKpiSnapshotJob({ logger });

const managementPackJob =
  startManagementPackJob({ logger });
```

Optional configuration:

```env
FINANCE_KPI_CURRENCIES=USD,ZWL
FINANCE_REPORTING_CURRENCY=USD
```

## Socket.IO

```js
const {
  initializeExecutiveFinanceEventBridge,
} = require('./realtime/executiveFinanceEventBridge');

const closeExecutiveFinanceBridge =
  initializeExecutiveFinanceEventBridge(io);
```

Call the returned cleanup function during graceful shutdown.

## Frontend routes

```jsx
<Route
  path="/admin/finance/executive"
  element={<ExecutiveFinanceDashboard />}
/>

<Route
  path="/admin/finance/kpis"
  element={<FinanceKpiLibrary />}
/>

<Route
  path="/admin/finance/reporting"
  element={<ManagementReporting />}
/>
```

## Governance controls

- Executive KPIs must read from authoritative finance modules.
- Do not duplicate business calculations inside presentation code.
- Preserve source lineage for every KPI snapshot.
- Formula changes require a new formula version.
- Approved reporting packs must be immutable.
- Board packs require maker-checker approval.
- Narratives must distinguish factual results from management judgment.
- Exports should render from stored pack sections and approved narratives.
- Restrict reporting-pack distributions to approved recipients.
- Do not represent management dashboards as audited financial statements.

## Verification

```bash
cd backend
npm test -- financeKpi.test.js
npm test -- financeTrend.test.js
npm test -- reportingPack.test.js
node --check src/services/financeKpi.service.js
node --check src/services/executiveFinanceAnalytics.service.js
node --check src/services/financeReportingPack.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
