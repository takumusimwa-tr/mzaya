# Mzaya Batch 08.3.0 — Treasury, Banking & Cash Management

This batch adds the treasury operating layer above the immutable ledger,
settlements, provider reconciliation, tax and financial controls.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/treasury_cash_management.sql
```

## Register and export models

- `TreasuryAccount`
- `BankAccount`
- `BankStatementImport`
- `BankTransaction`
- `TreasuryReconciliation`
- `CashMovement`
- `TreasuryPaymentBatch`
- `TreasuryPaymentBatchItem`
- `LiquiditySnapshot`

Suggested associations:

```js
TreasuryAccount.hasMany(BankAccount, {
  foreignKey: 'treasury_account_id',
  as: 'bankAccounts',
});

BankAccount.belongsTo(TreasuryAccount, {
  foreignKey: 'treasury_account_id',
  as: 'treasuryAccount',
});

TreasuryPaymentBatch.hasMany(TreasuryPaymentBatchItem, {
  foreignKey: 'batch_id',
  as: 'items',
});
```

## Route mounts

```js
app.use('/api/treasury', require('./routes/treasury.routes'));
app.use(
  '/api/treasury-reconciliation',
  require('./routes/treasuryReconciliation.routes')
);
app.use(
  '/api/treasury-payment-batches',
  require('./routes/paymentBatch.routes')
);
```

All routes are administrator-only.

## Bank integrations

Store only tokenized account references. Never store raw bank credentials,
full account numbers, PINs, or online-banking passwords.

Provider adapters should update:

- current balance
- available balance
- last synced time
- bank transactions
- statement import status

## Reconciliation

Bank transactions may be matched to ledger transactions.

Statuses:

```text
unmatched
matched
discrepancy
ignored
```

Exact matches require equal amounts. Manual matches retain the difference.

## Payment batches

Payment batches are single-currency collections of approved outgoing payments.
Use Financial Controls from 08.2.3 before approval and submission.

Recommended workflow:

```text
draft
approved
submitted
completed / failed
```

## Liquidity snapshots

```js
const {
  startLiquiditySnapshotJob,
} = require('./jobs/liquiditySnapshot.job');

const liquiditySnapshotJob =
  startLiquiditySnapshotJob({ logger });
```

Optional:

```env
TREASURY_SNAPSHOT_CURRENCIES=USD,ZWL
```

## Frontend route

```jsx
<Route
  path="/admin/finance/treasury"
  element={<TreasuryDashboard />}
/>
```

Protect with the administrator route guard.

## Controls

- Keep bank data encrypted at rest.
- Require maker-checker approval for transfers and payment batches.
- Reconcile bank activity daily.
- Preserve imported statements and reconciliation evidence.
- Keep treasury balances separated by currency.
- Never infer foreign-exchange conversions silently.
- Treat liquidity dashboards as operational management views, not audited
  financial statements.

## Verification

```bash
cd backend
npm test -- liquidity.test.js
npm test -- treasuryForecast.test.js
npm test -- paymentBatch.test.js
node --check src/services/liquidity.service.js
node --check src/services/treasuryReconciliation.service.js
node --check src/services/paymentBatch.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
