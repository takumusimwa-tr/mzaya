# Batch 08.6.2 — Finance Runtime Hardening & End-to-End Integration Tests

This batch hardens the live 08.6.1 merge.

## Critical runtime gap closed

08.6.1 connected:

```text
operational transaction -> finance outbox
```

and mounted the finance services, but the live repository still lacked two
automatic stages:

```text
FinanceBusinessEvent.received
    -> process posting rule/template
    -> FinanceAccountingEvent.prepared

FinanceAccountingEvent.prepared
    -> resolve ledger accounts
    -> LedgerTransaction + LedgerEntry
    -> FinanceAccountingEvent.posted
```

08.6.2 adds both workers.

The full runtime path is now:

```text
operational transaction
    ↓
transactional outbox
    ↓
outbox publisher
    ↓
finance business event
    ↓
business-event processor
    ↓
accounting event
    ↓
accounting poster
    ↓
double-entry ledger
    ↓
domain reconciliation
```

## New runtime services

```text
backend/src/services/financeAccountResolver.service.js
backend/src/services/financePostingSeed.service.js
backend/src/services/financeAccountingPosting.service.js
backend/src/services/financePipeline.service.js
backend/src/services/financeReconciliationHelpers.service.js
```

## New workers

```text
backend/src/jobs/financeBusinessEventProcessor.job.js
backend/src/jobs/financeAccountingPoster.job.js
```

They are started and stopped through the existing:

```text
backend/src/runtime/financeRuntime.js
```

## Account resolution

Posting templates use semantic account codes such as:

```text
PAYMENT_PROCESSOR_RECEIVABLE
CUSTOMER_FUNDS_CLEARING
VENDOR_PAYABLE
MZAYA_PAYABLE
DELIVERY_REVENUE
PROCUREMENT_REVENUE
TAX_PAYABLE
CASH_AT_BANK
```

The accounting poster resolves these into `payment_accounts`.

Vendor, Mzaya, and customer-specific payable accounts retain their owner ID;
platform/system accounts are owned by `platform`.

Unknown account codes fail closed with:

```text
FINANCE_ACCOUNT_CODE_UNMAPPED
```

## Posting configuration seed

The code-owned posting templates under:

```text
backend/src/config/financePostingTemplates/
```

are now seeded into:

```text
finance_posting_templates
finance_posting_rules
```

at finance-runtime startup.

This closes a major operational gap: previously the templates existed only as
JavaScript configuration files and `resolvePostingRule()` had nothing to find
in a fresh database.

## Zero-value trace events

Approval/cancellation templates can intentionally resolve to zero.

The immutable ledger correctly refuses zero-value entries, so these accounting
events are now marked:

```json
{
  "status": "posted",
  "metadata": {
    "nonPosting": true,
    "nonPostingReason": "zero_value_trace_event"
  }
}
```

No fake zero-value ledger transaction is created.

Domain reconciliation recognizes these as valid non-posting accounting events.

## Procurement posting

`procurement.completed` now uses one composite posting template:

```text
merchandise cost:
  Dr PROCUREMENT_COST_OR_CLEARING
  Cr CUSTOMER_FUNDS_CLEARING

procurement fee:
  Dr CUSTOMER_FUNDS_CLEARING
  Cr PROCUREMENT_REVENUE
```

The previous standalone procurement-fee template is retained only as a legacy
reference event so the current single-rule posting engine cannot double-post
the same procurement completion.

## Manual drain endpoint

For controlled admin recovery/testing:

```text
POST /api/finance-posting/drain
```

The endpoint repeatedly drains:

```text
outbox -> business events -> accounting events -> ledger
```

until idle or the configured pass limit is reached.

It does not call external payment, bank, payout, or tax providers.

## New end-to-end tests

```text
financePipeline.e2e.test.js
paymentRefundFinance.e2e.test.js
orderDeliveryFinance.e2e.test.js
financeReliability.e2e.test.js
financeCutover.e2e.test.js
```

They cover:

```text
payment capture -> ledger
payment refund -> reversal-style accounting effect
delivered order -> order economics + delivery ledger
outbox idempotency / repeat drain
dead-letter quarantine + explicit replay
legacy posting cutover guard
```

Run:

```bash
cd backend
npm run test:finance:e2e
```

These tests require the project PostgreSQL test database exactly like the
existing integration suite.

## Verification completed in this build environment

Static Node syntax validation was run on all modified backend `.js` files.

The environment still does not have a usable npm dependency installation, so
the PostgreSQL/Jest E2E suite cannot truthfully be reported as executed here.
Run it in the normal project development/CI environment after dependency
installation.

## Production sequence

Before any `block_legacy` cutover:

```text
1. migrations applied
2. finance posting config seeded
3. payment capture E2E passing
4. refund E2E passing
5. delivery/order E2E passing
6. treasury/tax provider integrations still isolated from finance replay
7. outbox backlog zero
8. dead letters zero
9. domain reconciliation clean
10. cross-domain reconciliation clean
11. maker-checker cutover approval
```

## Next batch

Proceed to:

```text
08.6.3 — Provider Boundary Hardening, Concurrency & Failure Injection
```

That batch should stress webhook/poll races, duplicate provider callbacks,
worker concurrency, process crashes between pipeline stages, stale leases,
provider timeout recovery, and exactly-once accounting effects under
at-least-once delivery.
