# 07.7F.3C.2A — Checkout recovery

Adds an independent synthetic fixture world and a Chromium regression test. The test double-clicks checkout, forwards the first POST to the actual isolated backend, discards the committed response, retries from the same mounted checkout, verifies identical payload and request ID, HTTP 200 replay and exactly one customer order, reloads the order and completes simulated payment. No production source or dependencies changed.

Run backend delivery-integration-preflight.js first; keep normal backend stopped. From frontend run lint, build, playwright test --list, then full suite with BROWSER_TEST_RESET_CONFIRM=RESET_MZAYA_INTEGRATION_TEST and remove the variable in finally. Expect five tests. Never reset mzaya or mzaya_test. Test requires explicit isolated TEST_DB_URL. No live browser run performed during packaging. Same-page retry only; reload before recovery, changed payload, and payment-response loss are outside scope.
