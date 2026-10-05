# Finance Failure Injection — 08.6.3

Failure injection exists only for development/test/staging.

Enable:

```bash
FINANCE_FAILURE_INJECTION=true
FINANCE_FAILURE_POINT=after_outbox_ingest_before_publish
```

or:

```bash
FINANCE_FAILURE_POINT=after_ledger_post_before_accounting_status
```

Never enable this in normal production runtime.

Purpose:

- prove retry safety,
- prove business-event idempotency,
- prove accounting-event idempotency,
- prove crash recovery assumptions,
- expose missing transactional boundaries before cutover.
