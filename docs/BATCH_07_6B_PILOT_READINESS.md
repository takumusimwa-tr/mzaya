# Mzaya Batch 07.6B — Pilot readiness CI patch

Baseline: GitHub `takumusimwa-tr/mzaya`, commit `91ec242d01d216167644074b6a7f9898bc6b4be8`, branch `feat/advertising-platform-20261114`.

## Exact paths (copy relative to repository root)

1. `.github/workflows/ci.yml` — REPLACE existing workflow.
2. `backend/scripts/pilot-readiness-audit.js` — ADD new read-only structural check.
3. `docs/BATCH_07_6B_PILOT_READINESS.md` — ADD this guide.

## Changes

- CI runs for pushes to `feat/**` branches, including the current branch, and existing main/database/frontend branches; PRs targeting main still run.
- CI uses Node 24 consistently with the backend's `release-gate.js` validated runtime.
- Existing backend PostgreSQL Jest suite, frontend lint/build, release gate and dependency audits remain in place.
- CI adds frontend `brand:check` and a read-only structural pilot audit.
- No database schema changes, production feature changes, or secret modifications.

## Local validation (PowerShell, repository root)

```powershell
node --version
cd backend
npm ci
npm run lint
node scripts/pilot-readiness-audit.js
node scripts/release-gate.js
cd ../frontend
npm ci
npm run lint
npm run brand:check
npm run build
cd ..
git diff --check
git status --short
```

Run `npm test` in backend ONLY against the correctly configured disposable test database. Do not point tests at a production or development database. The GitHub Actions backend job uses its own isolated PostgreSQL service.

## Release caveats

- The static audit checks **presence**, not correct behavior. A green CI result is not pilot approval.
- Verify the real Paynow sandbox callbacks, refunds, and reconciliation before real-money use.
- Follow `backend/FINANCE_RELEASE_RUNBOOK.md` for named migrations and preflight checks. Never blanket-apply migrations or enable schema sync in production.
- Inspect CI results after pushing this patch. If a pre-existing test fails, capture the failure before making unrelated changes.
- Review whether Node 24 is supported by the deployed runtime; align deployment with the validated runtime before cutover.

## Suggested commit

```powershell
git add .github/workflows/ci.yml backend/scripts/pilot-readiness-audit.js docs/BATCH_07_6B_PILOT_READINESS.md
git commit -m "ci(pilot): align runtime and verify feature branch readiness"
git push
```
