# Batch 08.7.11 — Customer Discovery & Transaction Reliability

Baseline: `20e4bca4afb3805aa48c9c97669224e6518e7f05`

Permanent files:
- `frontend/src/pages/home/HomePage.jsx`
- `frontend/src/pages/home/VendorPage.jsx`
- `frontend/src/pages/order/CartPage.jsx`
- `frontend/src/pages/home/ErrandPage.jsx`
- `frontend/CUSTOMER_DISCOVERY_TRANSACTION_CONTRACT.md`
- `BATCH_08_7_11_INTEGRATION.md`
- `BATCH_08_7_11_MANIFEST.json`

Apply:
```powershell
node scripts/apply-batch-08-7-11.js
Remove-Item scripts/apply-batch-08-7-11.js
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
