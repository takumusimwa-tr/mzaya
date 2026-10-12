# Batch 08.7.10 — Customer Async-State & Mutation Reliability

Baseline: `de52e6ae88725510e02aaa5316930a4209fd0cd8`

Permanent files:
- `frontend/src/pages/order/OrderDetail.jsx`
- `frontend/src/pages/order/CheckoutPage.jsx`
- `frontend/src/pages/profile/FavoritesPage.jsx`
- `frontend/src/pages/profile/AddressesPage.jsx`
- `frontend/src/hooks/useFavorites.js`
- `frontend/CUSTOMER_ASYNC_STATE_CONTRACT.md`
- `BATCH_08_7_10_INTEGRATION.md`
- `BATCH_08_7_10_MANIFEST.json`

Apply:
```powershell
node scripts/apply-batch-08-7-10.js
Remove-Item scripts/apply-batch-08-7-10.js
```

Gate:
```powershell
cd frontend
npm run build
npm run lint
cd ..
git diff --check
git status --short
git diff --stat
```

Do not stage until the gate is reviewed.
