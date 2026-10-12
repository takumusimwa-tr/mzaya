# Customer Discovery & Transaction Reliability Contract — Batch 08.7.11

Baseline: `20e4bca4afb3805aa48c9c97669224e6518e7f05`

This batch broadens the reliability pass across customer discovery and transaction entry surfaces.

## Home
Browse-brand and browse-product failures are explicit and retryable. Location preparation uses the canonical loading state. Live-order polling remains non-blocking because discovery must remain usable if that secondary request fails.

## Vendor
A failed vendor request is no longer presented as a nonexistent store. Loading/error/retry use canonical product states. Favorite rollback feedback is visible while retaining the existing optimistic cache rollback.

## Cart
Persisted or malformed carts without a vendor owner cannot navigate to `/vendor/null` or `/vendor/undefined`. Cart quantities and checkout semantics are otherwise unchanged.

## Errands
Repeated submit events are ignored while placement is pending. Successful placement replaces the form history entry so browser Back does not resubmit/re-enter the completed transaction form.

No backend, DB, finance, provider, dependency, route ownership, or branding changes.
