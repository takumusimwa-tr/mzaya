# Batch 08.7.7 — Customer Route Ownership Contract

Baseline: `67a736439ba4aa45ae6d07ce79b5f935e58b0d99`

08.7.5 documented canonical customer page ownership.
08.7.6 stabilized deterministic navigation and the address persistence boundary.
08.7.7 now makes the route-level role contract match that architecture.

Changes:
- `/vendor/:id` becomes customer-role guarded instead of token-only
- `/profile` becomes the customer account hub instead of a cross-role page
- `/sell` becomes customer-role guarded instead of token-only
- removes unreachable rider/vendor branches from ProfilePage
- records the customer route contract

No backend, DB, finance, provider, dependency, or branding changes.

## Apply
```powershell
node scripts/apply-batch-08-7-7.js
Remove-Item scripts/apply-batch-08-7-7.js
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

## Manual smoke after deploy

Customer:
- Home -> store detail still works
- Home -> Profile still works
- Profile -> Sell on Mzaya still works
- Profile -> Orders/Favorites/Addresses/Notifications/Help/About still work

Role isolation:
- rider/vendor/admin navigating directly to `/profile`, `/sell`, or `/vendor/:id` is redirected by RoleRoute
- rider setup/earnings and vendor console routes remain unaffected
