# Batch 08.7.5 — Customer Route Ownership Consolidation
Baseline: `e37f29e1af16d4f3bfcd41e0822edb9544ee7db8`

08.7.4A is closed after deployed navigation smoke testing.

This batch consolidates customer route ownership before branding starts. Customer utility routes
`/help`, `/help/faq`, `/about`, and `/notifications` now use the customer role guard, and the shared
Profile only exposes those entries to customer accounts.

`frontend/CUSTOMER_SURFACE_OWNERSHIP.md` records canonical live implementations and deferred
presentational/duplicate pages.

No duplicate pages are deleted. Legal pages are not activated without approved legal content.
ContactSupportPage is not activated without a real support action contract. AddressFormPage is not
wired against the incompatible address contract. Branding does not start here.

## Apply
```powershell
node scripts/apply-batch-08-7-5.js
Remove-Item scripts/apply-batch-08-7-5.js
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
