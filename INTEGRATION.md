# Mzaya Batch 08.2.2 — Tax Reporting & Statutory Operations

This batch extends 08.2.1 with tax registrations, filing calendars, return
preparation and approval, withholding records, invoice documents and statutory
reporting controls.

## Database

```bash
psql "$DATABASE_URL" -f backend/migrations/tax_reporting_operations.sql
```

## Register and export models

- `TaxRegistration`
- `TaxFilingPeriod`
- `TaxReturn`
- `WithholdingTaxRecord`
- `TaxReturnAudit`

Suggested associations:

```js
TaxFilingPeriod.hasMany(TaxReturn, {
  foreignKey: 'filing_period_id',
  as: 'returns',
});

TaxReturn.belongsTo(TaxFilingPeriod, {
  foreignKey: 'filing_period_id',
  as: 'filingPeriod',
});

TaxReturn.belongsTo(TaxRegistration, {
  foreignKey: 'registration_id',
  as: 'registration',
});

TaxReturn.hasMany(TaxReturnAudit, {
  foreignKey: 'tax_return_id',
  as: 'audit',
});
```

## Route mount

```js
app.use(
  '/api/tax-reporting',
  require('./routes/taxReporting.routes')
);
```

All routes are administrator-only.

## Return workflow

```text
draft
  ↓
approved
  ↓
submitted
```

A return is prepared from issued tax invoices and configured adjustments.

The included calculation intentionally sets input tax to zero until purchase
tax evidence and supplier invoice ingestion are added. Do not infer input tax
credits without supporting records.

## Withholding tax

The withholding service stores:

- gross amount
- basis-point rate
- withheld amount
- payee
- source settlement or payment
- remittance state
- certificate number

Production rates and applicability must be configured only after professional
tax review.

## Invoice PDF documents

Use `generateInvoiceDocument()` with injected adapters:

```js
await generateInvoiceDocument({
  invoiceId,
  renderer: invoicePdfRenderer,
  storage: privateStorage,
});
```

The renderer should produce a compliant PDF using the finalized legal invoice
layout. Storage must remain private.

## Filing deadline job

```js
const {
  startTaxFilingDeadlineJob,
} = require('./jobs/taxFilingDeadline.job');

const taxFilingDeadlineJob =
  startTaxFilingDeadlineJob({ logger });
```

Stop it during graceful shutdown.

## Socket.IO

```js
const {
  initializeTaxReportingEventBridge,
} = require('./realtime/taxReportingEventBridge');

const closeTaxReportingBridge =
  initializeTaxReportingEventBridge(io);
```

Call `closeTaxReportingBridge()` during graceful shutdown.

## Frontend route

```jsx
<Route
  path="/admin/finance/tax-reporting"
  element={<TaxReportingCenter />}
/>
```

Protect it with the existing administrator route guard.

## Important legal limitation

This batch is a technical workflow foundation. It does not establish current
Zimbabwe tax rates, filing deadlines, fiscal-device rules, invoice wording,
tax registration thresholds, withholding obligations, or accepted submission
formats. Those values must be configured from current official guidance and
reviewed by qualified Zimbabwe tax professionals before production use.

## Verification

```bash
cd backend
npm test -- taxReturn.service.test.js
npm test -- withholdingTax.test.js
node --check src/services/taxReturn.service.js
node --check src/services/taxReturnCalculation.service.js
node --check src/services/invoiceDocument.service.js
npm run lint
```

```bash
cd frontend
npm run lint
npm run build
```
