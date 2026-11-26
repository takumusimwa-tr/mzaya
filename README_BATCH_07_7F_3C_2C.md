# Batch 07.7F.3C.2C — Delivery recovery

Replace browserFixtures.js and add deliveryRecovery.spec.js. Fifth independent fixture; no production changes.

The browser blocks the first proof POST, checks evidence retention, then forwards a rapid double click and drops the committed response. Reload must recover delivery, API replay must return the same proof, conflicting replay must fail, and all four roles must observe the same proof and three timeline events.

Run only against mzaya_integration_test with the existing preflight and explicit browser reset confirmation. Run backend deliveryCompletionConcurrency.e2e.test.js separately (not concurrently with Playwright) to verify persisted earnings, economics and outbox counts. Browser test does not directly count finance records.
