# Batch 08.6.5 — Finance Production Readiness, Security & Operational Controls

This batch hardens deployed-environment classification, activates shared Redis
rate limiting in staging, verifies Redis before accepting traffic, improves
shutdown ownership, and removes Jest's forced-exit mask.

It does not change finance posting semantics and does not allow finance replay to
execute external money movement.

## Local validation

```bash
cd backend
npm install
npm run test:finance:readiness
npm run test:finance:observability
npm run test:finance:stress
```

`npm install` is required because this batch adds `redis` and `rate-limit-redis`
as runtime dependencies and should refresh `package-lock.json` on the developer
machine.
