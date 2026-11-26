# 07.7F.3C.2B — Payment recovery

Test-only patch. Apply over validated 2A. Adds independent paymentRecovery fixture and browser scenario: pre-send failure, lost committed initiation response, rapid clicks, reload and same-intent retry, interrupted poll, persisted paid status, rejection of already-paid initiation. Same attempt ID and reference are checked; no direct database attempt count or real gateway charge verification. Reload recovery requires re-entering the same phone and method. Provider-declared failures, different payment intents, and automatic resume are not covered.

Run guarded integration preflight, backend/frontend lint, frontend build and full Playwright suite with explicit RESET_MZAYA_INTEGRATION_TEST confirmation. Never start normal backend or reset other databases. No production files changed.
