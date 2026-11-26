# 07.7F.3C.1 — Session isolation

Apply only these six frontend files and this README. Based on 07.7A plus E.1–E.4 and F.3A–B.2 patches; does not replace CheckoutPage or dependency files.

- Key the query provider and app subtree by authenticated user ID and role. Dispose old query caches on unmount.
- Centralize personal cart, active branch, recent search and socket cleanup in auth logout and identity changes. Preserve same-account profile updates.
- Reject API responses whose request token differs from the current token; do not log out a new session on an old 401. Anonymous login errors remain local.
- Use the shared logout hook in VendorSideRail.
- Add a same-tab customer-to-customer test with an API-seeded synthetic saved address, actual SPA navigation, logout, login and address visibility assertions.

Validation: backend read-only preflight, frontend lint/build, Playwright list (four tests), then full isolated suite with explicit BROWSER_TEST_RESET_CONFIRM. Never start normal backend or reset mzaya/mzaya_test. Run with no concurrent integration processes. Remove reset confirmation in finally.

Limitations: no live execution in authoring environment; token comparison does not distinguish sessions reusing an identical token. Cross-tab logout, service-worker offline behavior, delayed-response race tests, vendor/rider/admin account switching, and mutation cancellation are not verified. Already-submitted server mutations cannot be undone by logout. Role changes remount the app; verify vendor onboarding separately before rollout. Existing cart for an anonymous visitor is preserved at first login. No schema or dependency changes.
