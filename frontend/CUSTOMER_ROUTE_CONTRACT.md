# Customer Route Contract — Batch 08.7.7

Baseline: `67a736439ba4aa45ae6d07ce79b5f935e58b0d99`

## Purpose

The customer product must have one explicit role boundary. A valid session alone must not make
customer commerce/account screens renderable by rider, vendor, or admin roles.

## Customer-owned routes

The following routes require `role === customer`:

- `/home`
- `/vendor/:id` — customer-facing store detail
- `/errand`
- `/cart`
- `/checkout`
- `/orders`
- `/orders/:id`
- `/track/:id`
- `/favorites`
- `/addresses`
- `/help`
- `/help/faq`
- `/about`
- `/notifications`
- `/profile`
- `/sell`

`/vendor` without an id remains the vendor console and is owned by the vendor shell.

## Account ownership

`/profile` is the customer account hub. Rider and vendor account-management surfaces already have
their own role-owned routes (`/rider/setup`, vendor settings/menu/orders). Admin remains in the
admin shell. ProfilePage therefore no longer carries dead rider/vendor menu branches.

## Security/product rule

Frontend role guards are UX boundaries, not authorization. Backend authorization remains the
security boundary for protected data and mutations.

## Scope

No backend, database, finance, provider, dependency, or branding changes.
