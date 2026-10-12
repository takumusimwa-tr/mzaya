# Batch 08.7.8 — Session Lifecycle Convergence

Baseline: `b31667fa04ec1c480e0261c81226ba131a8a689f`

This batch repairs a persistence bug at the customer/auth boundary: an API 401 cleared the legacy
token/user keys but left Zustand's persisted `mzaya_auth` session intact.

Changes:
- central session-key clearing in `useAuthStore`
- explicit logout uses the same clearing contract
- global Axios 401 clears persisted + in-memory auth state
- redirect uses `window.location.replace('/login')` to avoid returning to an invalid authenticated page

No backend, DB, finance, provider, dependency, cart, or branding changes.

## Apply
```powershell
node scripts/apply-batch-08-7-8.js
Remove-Item scripts/apply-batch-08-7-8.js
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

## Manual smoke
- normal login survives reload
- explicit Logout reaches login and protected customer routes cannot be revisited as authenticated
- an expired/revoked token receiving 401 returns to login and remains logged out after reload
