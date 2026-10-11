# Batch 08.7.6 — Customer Navigation & Persistence Contract

Baseline: `8db1ed2eefba25ea58b27f62ff4d7a1f728c8689`

This batch extends the deterministic navigation rule established in 08.7.4A across the remaining
live customer utility surfaces and closes one remaining direct address-API construction in Checkout.

Changes:
- Orders -> Profile
- Order Detail -> Orders
- Favorites -> Profile
- Addresses -> Profile
- empty Cart -> Home
- populated Cart -> its vendor when known, otherwise Home
- Checkout saved-address retrieval -> centralized `addressAPI.list()`
- adds a durable customer navigation contract document

No backend, DB, finance, provider, or branding changes.

## Apply
```powershell
node scripts/apply-batch-08-7-6.js
Remove-Item scripts/apply-batch-08-7-6.js
```

## Gate
```powershell
cd frontend
npm run build
npm run lint
cd ..
git diff --check
git status --short
git diff --stat
```

Manual smoke after deployment:
- Profile -> Orders -> order -> back = Orders -> back = Profile
- Profile -> Favorites -> back = Profile
- Profile -> Saved Addresses -> back = Profile
- empty Cart -> back = Home
- populated Cart -> back = originating vendor/store when vendor id exists
- Checkout still loads saved addresses and selecting one still works
