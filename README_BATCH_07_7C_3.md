# Batch 07.7C.3 — Delivery concurrency regression tests

Adds ten PostgreSQL integration tests using the existing test factories and actual delivery services. Tests assert one proof, timeline, economics record and each completion outbox event, plus exactly one rider earnings increment. Failure injection uses temporary Sequelize hooks removed in finally blocks. No application code or migrations are changed.

Run only against localhost/mzaya_integration_test with explicit TEST_DB_URL. The suite checks both URLs and current_database() before resetDatabase(). Do not run against mzaya or mzaya_test. Keep development server stopped.

From backend: npm run lint; then npx jest --runInBand tests/deliveryCompletionConcurrency.e2e.test.js (only after verifying TEST_DB_URL).

Concurrency uses simultaneous promises, not a deterministic lock barrier. Finance assertions cover transactional outbox records, not downstream ledger posting (covered by existing finance suites). Runtime validation is pending.
