# Batch 08.6.6D — Staging Migration Compatibility Probe

Adds a deliberately narrow probe for one pending SQL migration.

The probe:
- requires an exact `--file` selector;
- refuses an already-recorded migration;
- executes the selected SQL inside one PostgreSQL transaction;
- forces deferred constraints immediate;
- **always rolls the transaction back**;
- never writes `schema_migrations`.

This is for the mixed staging database only: it tells us whether an original migration can safely traverse the current partially-existing schema before we authorize a real execution.

Initial dependency probes (run separately, in this order):
1. `payment_ledger_core.sql` — foundational ledger objects already exist but expected indexes are missing.
2. `finance_event_engine.sql` — depends on ledger transactions and its tables already exist but expected indexes are missing.

A PASS does not itself authorize execution. Return the output for review.
