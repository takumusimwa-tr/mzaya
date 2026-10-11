# Batch 08.7.3 — Customer Support & Utility Routing Consolidation

Baseline: `1a56292`

The repository contains substantial customer support/about/FAQ presentation work that is not
reachable from the active router. The routed Profile page also exposes a Help & Support row whose
action is currently a no-op.

This batch turns those existing surfaces into real product routes without beginning final branding.

## Scope
- Adds routed `/help`, `/help/faq`, and `/about` customer utility surfaces.
- Connects Profile -> Help & Support.
- Adds Profile -> About Mzaya.
- Reuses existing `HelpCenterPage`, `FAQPage`, and `AboutMzayaPage` rather than creating another
  visual generation.
- Keeps search/filter/expanded FAQ state in thin routed containers.
- Uses conservative local support content; no fake remote support API is introduced.
- Email support uses the existing Mzaya team mailbox.
- No database/backend/finance/provider changes.
- No visual-brand migration.

## Apply
Copy the patch contents into the repo root, then run:

```powershell
node scripts/apply-batch-08-7-3.js
```

The script is intentionally anchor-guarded: it fails rather than silently modifying an unexpected
baseline.

After it succeeds, delete the one-time script before staging:

```powershell
Remove-Item scripts/apply-batch-08-7-3.js
```

## Gate
```powershell
cd frontend
npm run build
npm run lint
cd ..
git diff --check
git status --short
```
