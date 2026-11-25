# 07.7F.3B.2 — Customer browser checkout

Apply the two code files to the repository root. The fixture response preserves the original top-level world and adds a separate checkout world (different city, accounts, catalog and rider). This prevents the paid but unfinished checkout from occupying the rider needed by the existing delivery test. No application code or dependencies change.

The new test selects the seeded city and vendor through the UI, adds a product, increases quantity, verifies the $10 subtotal and server quote, enters a synthetic address and browser-emulated GPS pin, places the order, pays via simulated EcoCash, verifies tracking and reads the persisted order using the authenticated API. It verifies the cart is empty. No API writes are used by the test itself. The existing tests remain unchanged.

Stop normal servers and all other integration tests. Run backend `node scripts/delivery-integration-preflight.js` and `npm run lint`; run frontend `npm run lint` and `npx playwright test --list` (three tests expected). Only after these pass, explicitly set BROWSER_TEST_RESET_CONFIRM=RESET_MZAYA_INTEGRATION_TEST and run `npx playwright test --config=playwright.config.js` from frontend; remove the variable afterward. Only the disposable integration database may be reset. Check ports 5107 and 5177 are released afterward.

Static syntax checks only in the packaging environment. Actual browser execution pending. No real GPS, external maps, real payments, media uploads, saved address selection or finance posting is tested. The checkout order intentionally remains accepted and paid in its separate fixture world until the next isolated reset. Do not run concurrent integration sessions.
