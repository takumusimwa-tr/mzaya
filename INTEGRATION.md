# Mzaya Batch 08.5.7 — Tax Event Integration

This batch connects tax facts and liabilities to the finance event engine.

## Important tax-design rule

This batch intentionally does **not** hard-code Zimbabwe tax rates, thresholds,
registration rules, filing frequencies, or statutory tax treatments.

Tax rules change and depend on entity facts.

Production tax rates and treatments must come from:
- governed tax master data,
- an approved tax engine,
- and qualified tax/accounting review.

The code provides the accounting/event infrastructure only.

## Database

```bash
psql "$DATABASE_URL" \
  -f backend/migrations/tax_finance_integration.sql
```

## Models

Export:

```js
TaxTransaction
TaxLiability
TaxRemittance
TaxFinanceReconciliationResult
```

Recommended associations:

```js
TaxLiability.hasMany(TaxRemittance, {
  foreignKey: 'liability_id',
  as: 'remittances',
});

TaxRemittance.belongsTo(TaxLiability, {
  foreignKey: 'liability_id',
  as: 'liability',
});
```

## Route mount

```js
app.use(
  '/api/tax-finance',
  require('./routes/taxFinance.routes')
);
```

## Event lifecycle

```text
operational taxable event
      ↓
approved tax rule / rate
      ↓
tax transaction
      ↓
tax.liability_created
      ↓
finance event engine
      ↓
ledger
      ↓
period liability aggregation
      ↓
treasury tax remittance
      ↓
bank confirmation
```

## Tax transaction design

A tax fact keeps:

```text
source record
jurisdiction
tax code
tax type
currency
taxable base
rate
tax amount
inclusive/exclusive flag
payable/receivable direction
```

Do not store only a final tax amount; retain the basis for auditability.

## Integration examples

```text
backend/src/services/tax/orderTax.integration.example.js
backend/src/services/tax/procurementTax.integration.example.js
```

These deliberately require the caller to provide governed:

```text
taxCode
taxType
jurisdictionCode
taxRateBps
```

No statutory assumptions are embedded.

## Posting templates

Seed:

```text
taxLiabilityCreated.js
taxLiabilityReversed.js
```

Temporary account names:

```text
TAX_EXPENSE_OR_CLEARING
TAX_PAYABLE
```

Map them to the governed chart of accounts before production.

Some taxes may be collected from customers rather than expensed by Mzaya.
Therefore the debit side must be tailored to the actual tax treatment and
source transaction.

## Liability aggregation

`refreshTaxLiability()` aggregates recognized tax transactions into a period
liability.

Before production, add period boundaries to the query using the authoritative
tax calendar from finance master data.

Do not aggregate all historical transactions into every period.

## Remittances

Tax remittances create treasury transfer instructions using Batch 08.5.6.

The tax module does not execute money movement.

Provider/bank completion still occurs through treasury.

## Reconciliation

The tax control traces:

```text
tax transaction
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
TAX_TRANSACTION_WITHOUT_OUTBOX
TAX_OUTBOX_WITHOUT_FINANCE_EVENT
TAX_FINANCE_EVENT_WITHOUT_ACCOUNTING_EVENT
TAX_ACCOUNTING_EVENT_NOT_POSTED
TAX_AMOUNT_MISMATCH
TAX_CURRENCY_MISMATCH
```

## Background job

```js
const {
  startTaxFinanceReconciliationJob,
} = require('./jobs/taxFinanceReconciliation.job');

const taxFinanceReconciliationJob =
  startTaxFinanceReconciliationJob({ logger });
```

## Frontend routes

```jsx
<Route
  path="/admin/finance/tax"
  element={<TaxFinanceDashboard />}
/>

<Route
  path="/admin/finance/tax/reconciliation"
  element={<TaxFinanceReconciliation />}
/>
```

## Controls

- Do not hard-code statutory tax rates in service code.
- Tax codes/rates must be governed master data.
- Preserve taxable base and tax amount separately.
- Record tax-inclusive vs tax-exclusive treatment.
- Reversals must preserve the original tax fact.
- Tax remittances must not exceed outstanding liabilities.
- Tax payments execute through treasury, not accounting replay.
- Period locks must apply before tax journals post.
- Tax configuration changes must use Batch 08.4.6 change control.
- Validate production tax logic with qualified Zimbabwe tax/accounting
  professionals before go-live.

## Verification

```bash
cd backend

npm test -- taxCalculation.test.js
npm test -- taxFinanceEvents.test.js
npm test -- taxAtomicity.test.js
npm test -- taxRemittance.test.js
npm test -- taxReconciliation.test.js

node --check src/services/taxCalculation.service.js
node --check src/services/taxFinanceEvents.service.js
node --check src/services/taxTransaction.service.js
node --check src/services/taxLiability.service.js
node --check src/services/taxRemittance.service.js
node --check src/services/taxReconciliation.service.js

npm run lint
```

```bash
cd frontend

npm run lint
npm run build
```

## Next domain

Proceed to Batch 08.5.8 — Cross-domain Reconciliation & Finance Cutover.
