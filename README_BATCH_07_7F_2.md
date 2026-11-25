# Batch 07.7F.2 — Structured checkout-to-delivery integration

Additive Jest suite using existing fixtures, Supertest, real local Socket.IO clients and simulated EcoCash. No production code changes. Retains legacy lifecycle tests. Requires F.1 guard and explicit TEST_DB_URL pointing to localhost/127.0.0.1 mzaya_integration_test. The suite resets that disposable database only. Do not run with a backend development server active.

From backend, run read-only preflight, lint, then `npx jest --runInBand --runTestsByPath tests/structuredCheckoutDelivery.e2e.test.js tests/orderLifecycle.e2e.test.js tests/deliveryProofApi.e2e.test.js`. Stop on any failure. This exercises model-generated schema, not migration rollout. No real provider or browser testing. Syntax checked only in authoring environment; runtime validation pending.
