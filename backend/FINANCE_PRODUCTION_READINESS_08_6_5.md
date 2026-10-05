# Batch 08.6.5 — Finance Production Readiness, Security & Operational Controls

## Runtime environment policy

`staging` is now treated as a deployed environment for network/security controls:
restricted CORS, proxy awareness, structured logs, PostgreSQL SSL and shared
Redis-backed rate limiting. It is still distinct from production so staging may
explicitly use mock payment providers.

Production continues to fail closed when Paynow/Cloudinary configuration is
missing or mock payments are enabled.

## Redis rate limiting

`rate-limit-redis` and `redis` are now runtime dependencies. A deployed API must
have `REDIS_URL`, and startup verifies Redis with `PING` before the server starts
accepting traffic. Development/tests can use the in-memory limiter.

The Redis client is closed during graceful shutdown.

## Lifecycle

The currency-sync and scheduled-release cron tasks now return their task handles
and are stopped during shutdown. Socket shutdown uses the canonical close path,
which also stops the order event bridge. Finance runtime jobs already expose and
use stop handles.

Jest no longer uses `forceExit`; `detectOpenHandles` is enabled so lifecycle leaks
are surfaced instead of hidden.

## Staging deployment checklist

Before deploying this batch, ensure Render `mzaya-api-staging` has:

- `NODE_ENV=staging`
- `DB_URL` set to the current Frankfurt Postgres Internal Database URL
- `REDIS_URL` set to the Frankfurt `mzaya-staging-redis` internal URL
- `CLIENT_ORIGINS`
- `APP_URL`
- `CLIENT_URL`
- a JWT secret of at least 32 characters
- `ALLOW_MOCK_PAYMENTS=true` only while staging payments are intentionally simulated

Run `npm install` after overlaying this batch so package-lock.json records the new
Redis dependencies, then run the readiness, observability and stress suites.

## Schema note

Staging currently remains on model sync while the newly recreated staging database
is established. Production continues to skip model sync and requires reviewed SQL
migrations. Moving staging to migration-only schema management should happen only
after its existing schema has been deliberately baselined.
