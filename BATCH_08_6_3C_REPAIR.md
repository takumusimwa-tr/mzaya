# Batch 08.6.3C — Failure Injection Boundary Repair

The remaining stress failure showed that the configured
`after_outbox_ingest_before_publish` failure point never fired.

This patch fixes two causes:
1. `FINANCE_FAILURE_INJECTION` is read at invocation time rather than frozen
   when the module is first required.
2. `financeEventDelivery.service.js` now invokes the declared failure point
   immediately after durable business-event ingestion and before marking the
   delivery attempt/outbox as published.

This preserves the intended test invariant: after an injected crash, retrying
the outbox event must converge on one FinanceBusinessEvent and one ledger effect.

Re-run:
    cd backend
    npm run test:finance:stress
