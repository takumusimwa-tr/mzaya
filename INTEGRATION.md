# Mzaya Batch 08.4.6 — Finance Master Data Governance & Change Control

This batch governs finance configuration used by ledger, treasury, tax,
settlements, close, FP&A, consolidation, profitability, reporting, and audit.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/finance_master_data_governance.sql
```

## Register models and associations

Export:
`FinanceMasterDataDomain`, `FinanceMasterDataRecord`,
`FinanceMasterDataVersion`, `FinanceChangeRequest`, `FinanceChangeApproval`,
`FinanceValidationRule`, `FinanceDataQualityResult`, `FinancePeriodLock`.

```js
FinanceMasterDataDomain.hasMany(FinanceMasterDataRecord, {
  foreignKey: 'domain_id',
  as: 'records',
});

FinanceMasterDataRecord.belongsTo(FinanceMasterDataVersion, {
  foreignKey: 'current_version_id',
  as: 'currentVersion',
});

FinanceChangeRequest.hasMany(FinanceChangeApproval, {
  foreignKey: 'change_request_id',
  as: 'approvals',
});
```

## Route mounts

```js
app.use('/api/finance-master-data', require('./routes/financeMasterData.routes'));
app.use('/api/finance-change-requests', require('./routes/financeChangeRequest.routes'));
app.use('/api/finance-data-quality', require('./routes/financeDataQuality.routes'));
```

## Recommended domains

`chart_of_accounts`, `currency`, `fx_pair`, `tax_code`, `department`,
`cost_center`, `bank_account`, `treasury_account`, `legal_entity`,
`consolidation_mapping`, `financial_period`, `approval_policy`, `revenue_rule`.

## Period-lock enforcement

Call `assertPeriodOpen()` before ledger posting, close adjustments, tax journals,
revenue-recognition journals, treasury journals, reconciliation journals, and
consolidation adjustments.

## Jobs

```js
const { startFinanceDataQualityJob } = require('./jobs/financeDataQuality.job');
const financeDataQualityJob = startFinanceDataQualityJob({ logger });
```

## Frontend routes

```jsx
<Route path="/admin/finance/master-data" element={<FinanceMasterDataDashboard />} />
<Route path="/admin/finance/master-data/changes" element={<FinanceChangeRequests />} />
<Route path="/admin/finance/master-data/quality" element={<FinanceDataQualityDashboard />} />
```

## Controls

- Never edit active financial configuration in place.
- Require independent approval for material changes.
- Preserve every payload version and hash.
- Use effective dates for time-sensitive configuration.
- Block accounting mutations behind hard period locks.
- Require an independent user to unlock a period.
- Extend data-quality rules for duplicate account codes, unsupported FX pairs,
  orphaned cost centers, missing consolidation mappings, retired tax codes,
  and bank accounts without treasury mappings.
