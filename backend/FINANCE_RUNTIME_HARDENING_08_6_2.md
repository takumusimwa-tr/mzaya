# Finance Runtime Hardening — 08.6.2

## Findings from live repository

### Finding 1 — outbox publication stopped at ingestion

`financeEventDelivery.service.js` called `ingestBusinessEvent()` but no
production worker called `processBusinessEvent()` for newly received events.

**Resolution:** `financeBusinessEventProcessor.job.js`.

### Finding 2 — prepared accounting events were never automatically posted

The repository had a ledger service and accounting-event preparation but no
adapter from semantic posting-template account codes to `payment_accounts`.

**Resolution:**
- `financeAccountResolver.service.js`
- `financeAccountingPosting.service.js`
- `financeAccountingPoster.job.js`

### Finding 3 — posting templates were not persisted

The template JavaScript files existed, but no startup seed populated
`finance_posting_templates` and `finance_posting_rules`.

**Resolution:** `financePostingSeed.service.js`.

### Finding 4 — zero-value trace journals cannot be posted to the immutable ledger

The ledger enforces positive minor units. Some finance templates intentionally
represent approval/cancellation trace events with zero value.

**Resolution:** mark those accounting events as posted/non-posting without
creating ledger rows.

### Finding 5 — procurement completion had two competing posting templates

The current posting engine resolves one posting rule per business event.

**Resolution:** combine merchandise-cost and procurement-fee effects into the
single `procurement_completed_spend` template.

### Finding 6 — E2E finance tests did not exercise the whole chain

Most existing finance tests were isolated unit/service assertions.

**Resolution:** five PostgreSQL-backed E2E suites now exercise finance lineage
across actual persisted stages.

## Remaining hardening after 08.6.2

- Concurrent workers / SKIP LOCKED strategy at higher scale.
- Crash injection after outbox ingestion and before accounting preparation.
- Crash injection after ledger post and before accounting-event status update.
- Provider callback race stress.
- Bank statement import adapters.
- Production chart-of-accounts governance for semantic account codes.
- Domain-specific multi-rule posting if a single business event legitimately
  needs independently versioned posting groups.
