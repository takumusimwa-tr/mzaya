# Mzaya Batch 08.4.2 — Consolidation, Multi-Entity & Group Reporting

This batch adds legal entities, ownership structures, intercompany activity,
eliminations, currency translation, consolidation runs, and group reports.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/multi_entity_consolidation.sql
```

## Register and export models

- `LegalEntity`
- `ConsolidationGroup`
- `ConsolidationMember`
- `EntityAccountMapping`
- `IntercompanyTransaction`
- `ConsolidationRun`
- `EliminationEntry`
- `CurrencyTranslationAdjustment`
- `GroupReportSnapshot`

Required associations:

```js
LegalEntity.hasMany(LegalEntity, {
  foreignKey: 'parent_entity_id',
  as: 'children',
});

ConsolidationGroup.hasMany(ConsolidationMember, {
  foreignKey: 'consolidation_group_id',
  as: 'members',
});

ConsolidationMember.belongsTo(LegalEntity, {
  foreignKey: 'legal_entity_id',
  as: 'legalEntity',
});
```

## Route mounts

```js
app.use(
  '/api/consolidation',
  require('./routes/consolidation.routes')
);

app.use(
  '/api/intercompany',
  require('./routes/intercompany.routes')
);

app.use(
  '/api/group-reports',
  require('./routes/groupReports.routes')
);
```

All routes are administrator-only.

## Consolidation workflow

```text
entity trial balances
      ↓
account mapping
      ↓
currency translation
      ↓
intercompany matching
      ↓
elimination entries
      ↓
group aggregation
      ↓
consolidated reports
```

## Consolidation methods

Supported foundation:

```text
full
proportional
equity
```

The current service performs the full-consolidation framework. Proportional,
equity-method, minority-interest, goodwill, and acquisition accounting require
separate policy-driven extensions.

## Intercompany controls

- Record both source and counterparty entities.
- Preserve both ledger transaction references.
- Match balances before elimination.
- Do not eliminate unmatched transactions.
- Retain every elimination entry by consolidation run.

## Currency translation

Currency translation uses the treasury FX rate service from Batch 08.3.2.

Production accounting policy must define:

- closing rates
- average income-statement rates
- historical equity rates
- translation reserve treatment

## Nightly consolidation

```js
const {
  startNightlyConsolidationJob,
} = require('./jobs/nightlyConsolidation.job');

const nightlyConsolidationJob =
  startNightlyConsolidationJob({ logger });
```

Stop it during graceful shutdown.

## Frontend routes

```jsx
<Route
  path="/admin/finance/consolidation"
  element={<ConsolidationDashboard />}
/>

<Route
  path="/admin/finance/intercompany"
  element={<IntercompanyDashboard />}
/>

<Route
  path="/admin/finance/group-reporting"
  element={<GroupReportingDashboard />}
/>
```

## Important accounting limitation

This package is a technical consolidation foundation. It is not a replacement
for professionally approved group accounting policies. Ownership changes,
minority interests, goodwill, acquisition accounting, tax consolidation,
hyperinflation accounting, and statutory group reporting require qualified
accounting review before production use.

## Verification

```bash
cd backend
npm test -- currencyTranslation.test.js
npm test -- groupReporting.test.js
node --check src/services/consolidation.service.js
node --check src/services/elimination.service.js
node --check src/services/intercompany.service.js
node --check src/services/currencyTranslation.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
