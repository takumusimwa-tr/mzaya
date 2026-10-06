# Batch 08.6.5B — Staging Boot Repair

Render exposed two remaining startup races/side effects.

- Redis connection is now initiated before `RedisStore` instances can issue
  initialization commands. Boot readiness awaits the same connection promise,
  preventing `The client is closed` unhandled rejections.
- Staging no longer calls `sequelize.sync()` at startup. Even non-alter sync
  reconciles indexes and collided with PostgreSQL identifier truncation on
  `finance_journal_batch_events`. The recreated staging DB was already
  bootstrapped successfully; staging and production now require explicit schema
  evolution rather than boot-time reconciliation.

If Redis readiness now reports a connection timeout, treat it as Render
configuration/networking: verify `REDIS_URL` is the current internal URL for the
Frankfurt `mzaya-staging-redis` resource.

Validation: 2/2 modified JavaScript files pass `node --check`.
