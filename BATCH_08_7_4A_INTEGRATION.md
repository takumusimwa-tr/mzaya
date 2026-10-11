# Batch 08.7.4A — Utility Navigation Repair

Baseline: `d367c4f`

Utility pages mixed browser-history back navigation with explicit route navigation. Help -> FAQ -> Help could therefore bounce between utility pages.

Navigation is now deterministic:
- `/help` back -> `/profile`
- `/help/faq` back -> `/help`
- `/about` back -> `/profile`
- About -> Support -> `/help`
- `/notifications` back -> `/profile`

Back/utility transitions use `replace: true` to avoid leaving the exited utility page behind as another history trap.

Scope: frontend navigation only. No backend, database, finance, provider, or branding changes.

## Apply
```powershell
node scripts/apply-batch-08-7-4a.js
Remove-Item scripts/apply-batch-08-7-4a.js
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

Manual smoke test:
1. Profile -> Help -> FAQ -> back = Help -> back = Profile.
2. Profile -> About -> back = Profile.
3. Profile -> About -> Support -> back = Profile.
4. Profile -> Notifications -> back = Profile.
