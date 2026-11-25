# Batch 07.7D.1 — Delivery API error translation
Reuse existing sendServiceError for expected submission failures only. Unexpected errors still reach the app handler. Regression asserts HTTP 409 and PROOF_CONFLICT. No database or global middleware changes. Run lint and guarded API/lifecycle/finance tests from Batch 07.7D. Runtime validation pending.
