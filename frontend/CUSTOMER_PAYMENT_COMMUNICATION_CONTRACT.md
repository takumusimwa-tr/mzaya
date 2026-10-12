# Customer Payment & Communication Contract — Batch 08.7.13

- Payment initiation is single-flight while a push, poll, or redirect is active.
- Payment initiation errors are announced as alerts and remain retryable.
- Order chat distinguishes loading, fetch failure, empty history, and loaded history.
- Chat sending is single-flight and send failures remain visible without clearing the draft.
- Live-order contact lookup failure does not break the order screen and is surfaced non-blockingly.
- Tracking remains owned by the canonical order-detail route; `/track/:id` stays a compatibility redirect.
- No backend, database, finance, provider, dependency, route-ownership, or branding changes are included.
