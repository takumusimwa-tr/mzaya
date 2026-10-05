# Finance Incident Runbook — Batch 08.6.4

## Signals

Admin endpoints:

- `GET /api/finance-posting/health`
- `GET /api/finance-posting/diagnostics?limit=25`

The health endpoint returns HTTP 503 only when finance health is critical.
Warning and healthy states return HTTP 200.

## Initial triage

1. Inspect `status`, `pipeline`, and `indicators`.
2. If outbox age/backlog is elevated, inspect diagnostics before replaying.
3. If dead letters exist, identify the root cause before requesting replay.
4. If posting failures exist, verify posting configuration and account mapping.
5. Never use finance replay to invoke Paynow, EcoCash, bank, or other external
   money-movement providers.
6. Do not rewrite historical ledger records to clear an incident.
7. If a cutover domain is unsafe, change future routing through the controlled
   cutover/rollback mechanism rather than editing historical accounting.

## Severity

- healthy: within configured operating thresholds
- warning: degraded; investigate before backlog reaches critical
- critical: operator action required; health endpoint returns 503

Thresholds are configuration, not statutory or accounting policy. Override them
through `FINANCE_SLO_*` environment variables as production traffic becomes known.

## Safe recovery order

1. stop the source of repeated failures;
2. inspect dead letters/posting failures;
3. correct configuration/code/data mapping;
4. drain the internal finance pipeline;
5. reconcile affected domains;
6. only then consider replay;
7. verify one accounting effect per idempotency key.

External provider calls remain outside finance replay.
