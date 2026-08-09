# Mzaya Batch 08.5.6 — Treasury & Bank Movement → Finance Event Integration

This batch connects real cash movement to the finance event pipeline.

## Core rule

Finance replay may replay accounting interpretation.

It must never initiate a bank, Paynow, EcoCash, mobile-money, or other external
cash movement.

External transfer execution stays in the treasury/provider integration layer.

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/treasury_bank_finance_integration.sql
```

## Models

Export:

```js
TreasuryTransfer
BankMovement
TreasuryFinanceReconciliationResult
```

## Route mount

```js
app.use(
  '/api/treasury-finance',
  require('./routes/treasuryFinance.routes')
);
```

## Transfer lifecycle

```text
draft
  ↓
independent approval
  ↓
treasury.transfer_approved
  ↓
external provider executes cash movement
  ↓
provider confirmation
  ↓
completed
  ↓
treasury.transfer_completed
  ↓
accounting event
  ↓
ledger
  ↓
bank movement match
```

The transfer initiator cannot approve the same transfer.

## Provider confirmation

`confirmTreasuryTransferCompleted()` must be called only after the external
provider confirms success.

The `provider_reference` should be the provider/bank identifier used later for
bank reconciliation.

## Bank movements

Populate `bank_movements` from:

- bank statement import,
- provider settlement reports,
- Open Banking/API feeds if available,
- manual admin entry as a fallback.

Matching priority should be:

```text
1. explicit treasury_transfer_id
2. provider/bank reference
3. amount + currency + date window
4. manual review
```

Do not auto-match ambiguous movements.

## Vendor and Mzaya payout bridges

Merge-safe examples are included:

```text
backend/src/services/treasury/vendorSettlementTreasury.integration.example.js
backend/src/services/treasury/mzayaPayoutTreasury.integration.example.js
```

These create treasury transfer instructions from approved payables.

They do not execute money movement.

## Posting templates

Seed:

```text
treasuryTransferApproved.js
treasuryTransferCompleted.js
```

Approved events are trace-only.

Completed events drive the actual accounting cash movement.

Temporary account codes must be mapped to governed bank/treasury account master
data before production.

## Reconciliation

The control traces:

```text
treasury transfer
      ↓
finance outbox
      ↓
finance business event
      ↓
accounting event
      ↓
ledger
      ↓
bank movement
```

Exceptions include:

```text
TREASURY_TRANSFER_WITHOUT_OUTBOX
TREASURY_OUTBOX_WITHOUT_FINANCE_EVENT
TREASURY_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
TREASURY_ACCOUNTING_EVENT_NOT_POSTED
TREASURY_TRANSFER_WITHOUT_BANK_MOVEMENT
TREASURY_BANK_AMOUNT_MISMATCH
TREASURY_BANK_CURRENCY_MISMATCH
```

## Jobs

```js
const {
  startTreasuryFinanceReconciliationJob,
} = require('./jobs/treasuryFinanceReconciliation.job');

const {
  startBankMovementMatchingJob,
} = require('./jobs/bankMovementMatching.job');

const treasuryReconciliation =
  startTreasuryFinanceReconciliationJob({ logger });

const bankMovementMatching =
  startBankMovementMatchingJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/treasury"
  element={<TreasuryFinanceDashboard />}
/>

<Route
  path="/admin/finance/treasury/reconciliation"
  element={<TreasuryFinanceReconciliation />}
/>
```

## Controls

- Transfer initiator cannot approve their own transfer.
- Only provider-confirmed transfers become `completed`.
- Provider references must be retained.
- Finance replay cannot call external payment providers.
- Ambiguous bank movements stay unmatched.
- Bank account IDs must use governed treasury master data from Batch 08.4.6.
- Final ledger posting should enforce period locks.
- Vendor and Mzaya payouts should flow through treasury for cash execution.
- Refunds should flow through treasury/payment integration, not direct ledger posting.

## Verification

```bash
cd backend

npm test -- treasuryMakerChecker.test.js
npm test -- treasuryFinanceEvents.test.js
npm test -- bankMovementMatching.test.js
npm test -- treasuryAtomicity.test.js
npm test -- treasuryReconciliation.test.js

node --check src/services/treasuryFinanceEvents.service.js
node --check src/services/treasuryTransfer.service.js
node --check src/services/bankMovementMatching.service.js
node --check src/services/treasuryReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

Proceed to Batch 08.5.7 — Tax Event Integration.
