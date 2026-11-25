# 07.7F.3A browser smoke infrastructure
Requires F.1 guard, existing application patches and Playwright 1.65.1. Run from frontend. Stop normal backend and all Jest sessions first. This resets ONLY the explicitly configured local mzaya_integration_test database. Never run concurrently with other integration tests. No migrations or .env changes.

```powershell
cd ..\backend
node scripts/delivery-integration-preflight.js
# Proceed only if PASS
npm run lint
cd ..\frontend
npm run lint
$env:BROWSER_TEST_RESET_CONFIRM = 'RESET_MZAYA_INTEGRATION_TEST'
try { npx playwright test --config=playwright.config.js } finally { Remove-Item Env:BROWSER_TEST_RESET_CONFIRM -ErrorAction SilentlyContinue }
```

Playwright starts and stops both dedicated servers. No reuse. The launcher suppresses dotenv loading in its own process, uses existing test bootstrap and factories, and disables known provider settings. This is not an OS-level network sandbox. Browser HTTP requests to other origins are blocked by the smoke test. Classic media routes are blocked rather than pretending local image storage is isolated. Synthetic credentials are available on the loopback fixture endpoint only while running; do not expose ports. No real checkout or finance fixture is seeded in this batch. No production source changes. Do not commit playwright-report or test-results directories. Runtime validation pending on Windows.
