# Batch 08.6.4 — Finance Observability, SLOs & Incident Operations

Adds read-only finance runtime health aggregation, configurable operational
thresholds, a five-minute observability job, admin diagnostics endpoints,
incident runbook, and observability tests.

No external money movement is performed by observability or diagnostics.

## Admin endpoints

- `GET /api/finance-posting/health`
- `GET /api/finance-posting/diagnostics?limit=25`

## Test

```bash
cd backend
npm run test:finance:observability
npm run test:finance:stress
```

The existing stress suite should remain green.

The prior Jest `--forceExit` configuration is intentionally not removed in this
batch without first proving which application handle remains open. The test
database teardown closes Sequelize; production runtime jobs are stopped by the
runtime shutdown path. Open-handle cleanup should be evidence-driven rather than
silencing a potentially real lifecycle leak.
