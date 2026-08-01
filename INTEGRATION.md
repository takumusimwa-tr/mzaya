# Mzaya Batch 08.3.1 — Bank Statement Imports & Automated Reconciliation

This batch extends Treasury 08.3.0 with durable statement imports, row-level
normalization, duplicate protection, match scoring, automatic reconciliation,
and human review.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/bank_statement_automation.sql
```

## Register and export models

- `BankStatementImport`
- `BankStatementImportRow`
- `TreasuryReconciliation`
- `TreasuryReconciliationCandidate`
- `TreasuryReconciliationReview`

Required associations:

```js
BankStatementImport.hasMany(BankStatementImportRow, {
  foreignKey: 'statement_import_id',
  as: 'rows',
});

TreasuryReconciliationCandidate.belongsTo(LedgerTransaction, {
  foreignKey: 'ledger_transaction_id',
  as: 'ledgerTransaction',
});
```

## Route mounts

```js
app.use(
  '/api/bank-statement-imports',
  require('./routes/bankStatementImport.routes')
);

app.use(
  '/api/treasury-reconciliation-review',
  require('./routes/treasuryReconciliationReview.routes')
);
```

All routes are administrator-only.

## Import behavior

Supported normalized input formats:

```text
csv
xlsx
json
api
```

The HTTP route receives parsed rows. File parsing should occur in a dedicated
upload worker so large files do not block the API.

Each row is retained with:

- original raw data
- normalized data
- row number
- processing status
- error details

Duplicate bank transactions are blocked by bank account and provider reference.

## Match scoring

The reconciliation engine scores candidates using:

```text
55% amount similarity
20% transaction-date proximity
15% reference similarity
10% description similarity
```

Default auto-match threshold:

```env
TREASURY_AUTO_MATCH_THRESHOLD=0.93
```

Only high-confidence matches are automatically confirmed. Lower-confidence
matches remain available for human review.

## Automated reconciliation job

```js
const {
  startAutomatedTreasuryReconciliation,
} = require('./jobs/automatedTreasuryReconciliation.job');

const automatedTreasuryReconciliation =
  startAutomatedTreasuryReconciliation({ logger });
```

Stop it during graceful shutdown.

## Socket.IO

```js
const {
  initializeTreasuryReconciliationEventBridge,
} = require('./realtime/treasuryReconciliationEventBridge');

const closeTreasuryReconciliationBridge =
  initializeTreasuryReconciliationEventBridge(io);
```

Call the returned cleanup function during graceful shutdown.

## Frontend

Suggested route:

```jsx
<Route
  path="/admin/finance/treasury/statements"
  element={<BankStatementOperations />}
/>
```

`ReconciliationCandidateList` should be embedded in the existing reconciliation
detail panel.

## Controls

- Preserve original statement files in private storage.
- Store import hashes to strengthen duplicate-file protection.
- Require manual review for low-confidence matches.
- Never auto-create ledger transactions from statement text alone.
- Keep bank transaction and ledger transaction currencies identical.
- Record all manual accept and reject decisions.
- Require maker-checker approval for reconciliation overrides above policy
  thresholds.

## Verification

```bash
cd backend
npm test -- bankStatementParser.test.js
npm test -- reconciliationScoring.test.js
node --check src/services/bankStatementImport.service.js
node --check src/services/automatedTreasuryReconciliation.service.js
node --check src/services/treasuryReconciliationReview.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
