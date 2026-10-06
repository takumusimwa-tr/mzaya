# Batch 08.6.5A — Render Boot Repair

Repairs two staging failures exposed by the first 08.6.5 Render deployment.

1. `express-rate-limit` store reuse:
   - one Redis client remains shared;
   - each limiter now receives its own `RedisStore`;
   - auth/write/api use unique Redis prefixes.

2. staging schema boot:
   - development keeps `sequelize.sync({ alter: true })`;
   - staging uses non-destructive `sequelize.sync()` while the recreated staging
     database is being baselined;
   - production remains migration-only.

The Redis connection timeout is a separate infrastructure signal. If it remains
after this code repair, verify that `REDIS_URL` is the current internal URL for
`mzaya-staging-redis` in the Frankfurt region.

Validation:
- modified JS files pass `node --check`.
