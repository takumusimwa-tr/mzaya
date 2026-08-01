# Mzaya Batch 08.4.0 — Financial Close, Trial Balance & Statements

This batch adds the accounting close layer above the immutable ledger,
reconciliation, treasury, settlements, tax, and financial controls.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/financial_close_reporting.sql
```

## Register and export models

- `FinancialCloseCycle`
- `FinancialCloseTask`
- `TrialBalanceSnapshot`
- `TrialBalanceLine`
- `FinancialStatementSnapshot`
- `CloseAdjustment`
- `CloseAdjustmentLine`

Required associations:

```js
FinancialCloseCycle.hasMany(FinancialCloseTask, {
  foreignKey: 'close_cycle_id',
  as: 'tasks',
});

TrialBalanceSnapshot.hasMany(TrialBalanceLine, {
  foreignKey: 'snapshot_id',
  as: 'lines',
});
```

## Route mount

```js
app.use(
  '/api/financial-close',
  require('./routes/financialClose.routes')
);
```

All routes are administrator-only.

## Close workflow

```text
period opened
   ↓
close cycle started
   ↓
reconciliation tasks completed
   ↓
settlement and tax review
   ↓
trial balance generated
   ↓
financial statements generated
   ↓
management sign-off
   ↓
period closed
```

## Trial balance

The trial balance aggregates posted ledger entries by payment account and
currency. It preserves:

- debit total
- credit total
- account-level net balance
- snapshot type
- generation timestamp
- preparer identity

A close cannot complete without a balanced final trial balance.

## Financial statements

The included statement builders provide the technical foundation for:

- income statement
- balance sheet

Final account mappings must be confirmed before production use. Account types
must be normalized so revenue, expense, asset, liability, and equity accounts
are classified consistently.

## Close adjustments

Use close adjustments for approved period-end entries only. Each adjustment
must:

- balance debits and credits
- pass maker-checker approval
- post through the immutable ledger
- preserve the resulting ledger transaction
- remain linked to the close cycle

## Frontend route

```jsx
<Route
  path="/admin/finance/close"
  element={<FinancialCloseDashboard />}
/>
```

## Controls

- Do not complete a close with unresolved reconciliation exceptions.
- Require a balanced final trial balance.
- Require management sign-off.
- Preserve all trial-balance and statement versions.
- Do not overwrite approved statement snapshots.
- Reopening a completed close must use Financial Controls from Batch 08.2.3.
- Tax and treasury reporting remain operational views until professionally
  reviewed and mapped to final accounting policies.

## Verification

```bash
cd backend
npm test -- financialStatements.test.js
npm test -- financialClose.test.js
node --check src/services/trialBalance.service.js
node --check src/services/financialClose.service.js
node --check src/services/financialStatements.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
