# Customer Async-State & Mutation Reliability — Batch 08.7.10

Baseline: `de52e6ae88725510e02aaa5316930a4209fd0cd8`

This batch broadens the customer reliability pass across four canonical surfaces.

- Order Detail distinguishes a failed fetch from a genuinely unavailable order and offers retry.
- Favorites exposes list failure/retry and visible feedback when an optimistic toggle is rolled back.
- Saved Addresses surfaces delete failures and prevents overlapping edit/delete mutation actions.
- Checkout no longer silently hides saved-address query failure; manual address entry remains available
  and the customer can retry the saved-address request.

The batch preserves current backend/API contracts, navigation, cart semantics, order placement,
optimistic rollback behavior, and existing visual compositions.

No backend, DB, finance, provider, dependency, route-ownership, or branding changes.
