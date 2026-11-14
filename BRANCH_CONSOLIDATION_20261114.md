# Mzaya branch consolidation — 2026-11-14

## Source branches
- `main`: integration baseline, unchanged.
- `fix/customer-experience-stability-20261110`: source of this integration branch; includes all seven commits from `feat/brand-integration-batch-02` plus 19 customer/backend changes.
- `chore/brand-asset-integrity-gate`: three divergent commits; its package script is already present in the stability branch. Its diagnostic messages have been reconciled into `frontend/scripts/check-brand-assets.mjs`.
- `frontend` and `upgrades`: behind main with no unique commits.

## Decisions
- Preserve the existing brand vector assets, import paths, customer changes and backend changes.
- Preserve the existing `brand:check` npm command.
- Incorporate descriptive error output from the integrity-gate branch without its incorrectly escaped regex checks.
- Do not copy the integrity branch's dated findings as current facts; those findings describe the earlier legacy assets, while the stability branch contains newer vector exports.

## Validation required before merge
Run from `frontend/`: `npm ci`, `npm run brand:check`, `npm run lint`, `npm run build`.
Run backend install/tests or startup checks appropriate to `backend/package.json`; smoke-test authentication, vendor onboarding, customer pages, notifications, sockets and model associations.
Review PR checks and any merge conflicts. No claim of a passing build is made here.
Do not merge or delete branches until validation is complete.
