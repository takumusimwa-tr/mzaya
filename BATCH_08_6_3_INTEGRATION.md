# Batch 08.6.3 — Provider Boundary Hardening, Concurrency & Failure Injection

This batch hardens the live finance/provider boundary.

## New controls

### Durable provider callback de-duplication

`provider_callback_receipts` stores a deterministic callback key so duplicate
webhooks/poll results do not produce duplicate accounting effects.

The provider outcome service:

```text
backend/src/services/providerOutcome.service.js
```

converges provider results onto the canonical `PaymentAttempt` row.

Terminal success is sticky: later contradictory provider noise does not demote a
successful payment.

### Concurrent outbox workers

`financeOutboxClaim.service.js` adds PostgreSQL:

```sql
FOR UPDATE SKIP LOCKED
```

claiming so multiple workers can safely pull disjoint outbox batches.

### Failure injection

`financeFailureInjection.service.js` supports controlled crash simulation using:

```text
FINANCE_FAILURE_INJECTION=true
FINANCE_FAILURE_POINT=<point>
```

Current points:

```text
after_outbox_ingest_before_publish
after_ledger_post_before_accounting_status
```

The feature is off unless explicitly enabled.

### Provider timeout recovery

`providerPaymentRecovery.job.js` surfaces stale pending/processing payments for
provider-specific polling or operator review. It never fabricates a provider
result.

## New E2E stress suites

```text
providerOutcomeConcurrency.e2e.test.js
financeOutboxConcurrency.e2e.test.js
financeFailureInjection.e2e.test.js
```

Run:

```bash
cd backend
npm run test:finance:stress
```

## Operational rule

At-least-once delivery is acceptable only when every side effect is idempotent.

The required invariants are now:

```text
duplicate provider callback
  -> one payment transition

duplicate/retried outbox delivery
  -> one FinanceBusinessEvent

duplicate business-event processing
  -> one FinanceAccountingEvent

duplicate accounting posting attempt
  -> one LedgerTransaction reference
```

## Remaining provider work

Provider-specific adapters still need to map their actual webhook/poll payloads
into `applyProviderOutcome()`.

Do not put provider-specific signature verification or HTTP response semantics
inside the finance engine itself.

## Next batch

Proceed to:

```text
08.6.4 — Finance Observability, SLOs & Incident Operations
```

That should add measurable latency/error SLOs, alert thresholds, incident
runbooks, finance runtime health aggregation, and operator-level diagnostics.
