# Customer Transaction Lifecycle Contract — Batch 08.7.12

- Checkout placement is single-flight: repeated taps while placement is pending do not create another request.
- Checkout back navigation has deterministic ownership: vendor when known, otherwise cart.
- Delivery quote failure is visible and retryable without destroying checkout input.
- Reorder validates reusable historical items before clearing the current cart.
- Reorder carries the historic order city into the rebuilt cart when available.
- Negotiation offer-selection failures are visible and retryable.
- No backend, database, finance, provider, dependency, route-ownership, or branding changes are part of this batch.
