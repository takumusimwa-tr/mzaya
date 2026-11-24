# Batch 07.7B — Delivery lifecycle schema
Additive patch; no existing migration edited. The new combined migration is schema-only. The legacy order_lifecycle_engine.sql contains explicit transaction control and a historical backfill that can misrepresent current status as a past customer action; do not execute it. Historical reconstruction is deferred. Do not baseline either legacy file automatically.

From backend, with TEST_DB_URL targeting localhost mzaya_integration_test only:

    npm run lint
    node scripts/probe-delivery-lifecycle-schema.js

The probe uses pg directly, not dotenv, Sequelize sync or the general migration runner. It creates minimal parent tables in a random scratch schema inside a transaction, executes the exact new SQL twice, tests constraints and rolls back. It does not validate the full existing public schema or production migration tracking. Do not start the server or apply migrations to either protected database. A later rollout requires actual catalog verification and selective approval. No dispatch changes.
