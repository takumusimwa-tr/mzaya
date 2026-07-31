# Mzaya Batch 08.2.1 — Tax, Compliance & Financial Governance

This batch establishes the governance layer above the finance platform.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/tax_compliance_foundation.sql
```

## Register and export models

- `TaxJurisdiction`
- `TaxRate`
- `InvoiceSequence`
- `TaxInvoice`
- `FinancialPeriod`
- `ComplianceAuditLog`

Suggested associations:

```js
TaxJurisdiction.hasMany(TaxRate, {
  foreignKey: 'jurisdiction_id',
  as: 'rates',
});

TaxInvoice.belongsTo(TaxJurisdiction, {
  foreignKey: 'jurisdiction_id',
  as: 'jurisdiction',
});
```

## Route mounts

```js
app.use('/api/tax', require('./routes/tax.routes'));
app.use('/api/invoices', require('./routes/invoice.routes'));
app.use('/api/compliance', require('./routes/compliance.routes'));
```

All routes are administrator-only.

## Financial periods

Apply the ledger guard before new postings:

```js
await assertLedgerPostingPeriod({
  occurredAt: payload.occurredAt || new Date(),
});
```

The period-close action blocks subsequent postings for the covered dates.

## Invoice sequencing

Configure one sequence per jurisdiction, document type, and fiscal year.

Example:

```text
prefix: ZW-INV-
next_number: 1
padding: 6
result: ZW-INV-000001
```

Sequence generation uses a row lock to prevent duplicate numbers.

## Tax calculation

Tax rates are stored in basis points:

```text
1500 basis points = 15.00%
```

Tax is calculated using integer minor units.

## Current scope

- VAT and generic tax-type foundation
- Effective-dated rates
- Jurisdiction management
- Sequential invoices
- Credit-note numbering foundation
- Monthly financial periods
- Close and reopen controls
- Immutable compliance audit log
- Tax summary reporting

## Important legal note

This package provides technical infrastructure, not a determination of current
Zimbabwe tax obligations. Production tax rates, fiscal-device requirements,
invoice wording, registration thresholds, withholding rules, and reporting
formats must be configured after review by qualified Zimbabwe tax and legal
professionals.

## Frontend routes

```jsx
<Route path="/admin/finance/tax" element={<TaxCenter />} />
<Route path="/admin/finance/invoices" element={<InvoiceManagement />} />
<Route path="/admin/finance/compliance" element={<ComplianceDashboard />} />
```

Protect all routes with the existing administrator guard.

## Scheduler

```js
const {
  startFinancialPeriodJob,
} = require('./jobs/financialPeriod.job');

const financialPeriodJob =
  startFinancialPeriodJob({ logger });
```

Stop it during graceful shutdown.

## Verification

```bash
cd backend
npm test -- taxCalculation.test.js
npm test -- invoiceNumber.test.js
npm test -- financialPeriod.test.js
node --check src/services/taxCalculation.service.js
node --check src/services/invoiceGeneration.service.js
node --check src/services/financialPeriod.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
