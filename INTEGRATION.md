# Mzaya Batch 08.5.4 — Mzaya Payouts → Finance Event Integration

This batch connects delivery-partner earnings and payouts to the transactional
outbox and accounting event engine.

## Terminology

The product term is **Mzaya**, not rider.

If the existing backend still uses legacy `rider_id` fields internally, keep
those fields temporarily for compatibility, but expose new payout flows,
interfaces, and finance events using `Mzaya`.

Do not create another parallel courier/rider payout domain.

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/mzaya_payout_finance_integration.sql
```

## Models

Export:

```js
MzayaPayout
MzayaPayoutItem
MzayaPayoutFinanceReconciliationResult
```

Recommended associations:

```js
MzayaPayout.hasMany(MzayaPayoutItem, {
  foreignKey: 'payout_id',
  as: 'items',
});

MzayaPayoutItem.belongsTo(MzayaPayout, {
  foreignKey: 'payout_id',
  as: 'payout',
});
```

Connect `mzaya_id` to the authoritative delivery-partner/user model once its
current live model name is confirmed.

## Route mount

```js
app.use(
  '/api/mzaya-payouts',
  require('./routes/mzayaPayout.routes')
);
```

## Payout lifecycle

```text
earnings accrued from completed deliveries
      ↓
draft payout
      ↓
approved
      ↓
mzaya.payout_due
      ↓
external payout provider executes transfer
      ↓
paid / partially_paid
      ↓
mzaya.payout_paid
      ↓
finance event engine
      ↓
ledger
```

Approval and the `mzaya.payout_due` outbox event are atomic.

The final paid event is emitted only when the payout is fully settled.

## Earnings calculation

The payout calculation separates:

```text
delivery earnings
+ tips
+ incentives
+ reimbursements
- penalties
- withholding
+/- adjustments
= amount due to Mzaya
```

This separation is important for:

- operational transparency,
- tax reporting,
- profitability,
- disputes,
- future incentive analysis,
- rider-to-Mzaya terminology migration.

## Posting templates

Seed:

```text
mzayaPayoutDue.js
mzayaPayoutPaid.js
```

Illustrative accounting:

```text
payout due:
  Dr DELIVERY_COST_OR_CLEARING
  Cr MZAYA_PAYABLE

payout paid:
  Dr MZAYA_PAYABLE
  Cr CASH_AT_BANK
```

Map the temporary account codes to the governed chart of accounts before
production.

Whether delivery earnings should be recognized as direct delivery cost,
contractor expense, or clearing depends on the final legal/accounting structure
and should be confirmed before production.

## Provider safeguard

The finance service does **not** initiate EcoCash, bank, mobile-money, Paynow,
or other external transfers.

Provider payout execution belongs to the operational payout/treasury layer.

Only after provider confirmation should:

```js
markMzayaPayoutPaid(...)
```

be called.

This prevents replaying accounting from duplicating real cash movement.

## Order linkage

`MzayaPayoutItem` supports:

```text
order_id
order_type
delivery earning
tip
incentive
reimbursement
penalty
withholding
adjustment
net due
```

Populate payout items from the authoritative completed-delivery records.

Do not calculate earnings again independently if an authoritative earnings
module already exists; adapt this service to consume that module.

## Reconciliation

The control traces:

```text
Mzaya payout
      ↓
finance outbox
      ↓
finance business event
      ↓
accounting event
      ↓
ledger
```

Exceptions include:

```text
MZAYA_PAYOUT_WITHOUT_OUTBOX
MZAYA_PAYOUT_OUTBOX_WITHOUT_FINANCE_EVENT
MZAYA_PAYOUT_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
MZAYA_PAYOUT_ACCOUNTING_EVENT_NOT_POSTED
MZAYA_PAYOUT_AMOUNT_MISMATCH
MZAYA_PAYOUT_CURRENCY_MISMATCH
```

## Background job

```js
const {
  startMzayaPayoutReconciliationJob,
} = require('./jobs/mzayaPayoutReconciliation.job');

const mzayaPayoutReconciliationJob =
  startMzayaPayoutReconciliationJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/mzaya-payouts"
  element={<MzayaPayoutDashboard />}
/>

<Route
  path="/admin/finance/mzaya-payouts/reconciliation"
  element={<MzayaPayoutReconciliation />}
/>
```

## Existing-code integration

Use:

```text
backend/src/services/mzaya/mzayaPayout.integration.example.js
```

as the merge point.

If the live project currently has a `rider` folder, migrate carefully rather
than duplicating it. New UI and domain terminology should say Mzaya, while
database/legacy aliases can remain until the broader terminology migration is
completed safely.

## Controls

- Never pay more than the approved payout amount.
- Keep partial payouts explicit.
- Preserve tips separately from delivery earnings.
- Preserve withholding separately from penalties.
- Provider references are mandatory for final production payout confirmation.
- External money movement must remain independently idempotent.
- Finance replay must never trigger external payout execution.
- Reconcile Mzaya payouts to treasury/bank movement in Batch 08.5.6.
- Use `Mzaya` in UI copy and new domain naming.

## Verification

```bash
cd backend

npm test -- mzayaPayoutCalculator.test.js
npm test -- mzayaPayoutFinanceEvents.test.js
npm test -- mzayaPayoutAtomicity.test.js
npm test -- mzayaPayoutOverpayment.test.js
npm test -- mzayaPayoutReconciliation.test.js

node --check src/services/mzayaPayoutCalculator.service.js
node --check src/services/mzayaPayoutFinanceEvents.service.js
node --check src/services/mzayaPayout.service.js
node --check src/services/mzayaPayoutReconciliation.service.js

npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```

## Next domain

Proceed to Batch 08.5.5 — Procurement → Finance Event Integration.
