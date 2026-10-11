# Customer Navigation Contract — Batch 08.7.6

Baseline: `8db1ed2eefba25ea58b27f62ff4d7a1f728c8689`

Customer top-level utility screens must not depend on browser history for their primary back action.
History-dependent back buttons can trap deep-linked, refreshed, redirected, or externally-opened users.

## Stable parent rules

- `/orders` -> `/profile`
- `/orders/:id` -> `/orders`
- `/favorites` -> `/profile`
- `/addresses` -> `/profile`
- `/help` -> `/profile`
- `/help/faq` -> `/help`
- `/about` -> `/profile`
- `/notifications` -> `/profile`
- empty `/cart` -> `/home`
- populated `/cart` -> its vendor/store when the cart has a vendor id, otherwise `/home`

Checkout remains a transactional child of Cart and is not changed by this batch.

## Persistence boundary

Checkout must consume saved addresses through `addressAPI.list()` rather than constructing
`/addresses` directly. This keeps the customer address contract centralized with AddressesPage.

## Scope

This is behavior/architecture consolidation only. It does not start final branding, change backend
contracts, alter database schema, or touch finance/provider behavior.
