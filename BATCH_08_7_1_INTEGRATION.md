# Batch 08.7.1 — Customer Product Architecture Consolidation

Baseline inspected: `523138285b9a44701a2b3fa716759e75ef521d69`

## Purpose

Begin pre-branding consolidation by moving customer persistence contracts out of routed page
components and into the shared frontend API boundary. This batch deliberately does **not**
redesign Mzaya or change the address database schema.

## Changes

- `frontend/src/api/api.js`
  - Adds `addressAPI` as the canonical saved-address client.
  - Adds `favoriteAPI` as the canonical brand-favourites client.
  - Preserves all existing API exports and endpoint contracts.

- `frontend/src/hooks/useFavorites.js`
  - Stops constructing favourites endpoints directly.
  - Uses `favoriteAPI`.
  - Preserves optimistic updates, query keys and the back-compat hook alias.

- `frontend/src/pages/profile/AddressesPage.jsx`
  - Stops constructing address endpoints directly.
  - Uses `addressAPI`.
  - Preserves the currently deployed backend contract: `label`, `address`, `notes`,
    `is_default`.
  - Adds explicit loading/error/retry/save-error states and guards duplicate submits.
  - Keeps current visual styling intentionally; final brand treatment comes later.

## Explicitly deferred

The repository also contains a newer `pages/customer/AddressFormPage.jsx` whose controlled
UI expects a more structured address concept (street/area/city/delivery instructions).
The current backend address controller does not persist that structure. It is therefore
**not** wired in by this batch: doing so would silently discard fields or require an
unreviewed schema migration.

That page is treated as a candidate for the later UI consolidation/removal pass after the
address domain contract is intentionally expanded.

## Safety

- No database migration.
- No backend runtime change.
- No payment/finance/provider behavior change.
- No route change.
- No branding/color-system migration.
- No deletion of legacy files in this batch.

## Verification gate

From `frontend/`:

```powershell
npm run build
npm run lint
```

Then inspect:

```powershell
git diff -- frontend/src/api/api.js frontend/src/hooks/useFavorites.js frontend/src/pages/profile/AddressesPage.jsx
git status --short
```

Do not commit until both frontend gates are green or any lint findings are reviewed.
