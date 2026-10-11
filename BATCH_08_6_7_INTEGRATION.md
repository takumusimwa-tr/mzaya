# Batch 08.6.7 — Release Baseline & Operational Closure

## Scope

Closes the finance/deployment hardening stream on top of commit
`424e71d6c72fdde7dd6d933899a77c39a64da543`.

This batch deliberately makes **no database migration and no finance runtime semantic
change**.

## Changes

- corrects stale 08.6.6 documentation that still described the superseded
  `sequelize-cli`/blanket-baseline approach;
- corrects D.8 documentation so it reflects that the Jest DB-safety changes were
  included in the final 08.6.6 commit;
- adds `backend/FINANCE_RELEASE_RUNBOOK.md` as the durable deployment/finance handoff;
- adds a non-mutating `backend/scripts/release-gate.js` structural preflight;
- records the verified 08.6.6 closure gates and known reconciliation parser artifact;
- explicitly separates finance/platform hardening from the future Mzaya branding stream.

## Safety

`release-gate.js` reads files/environment metadata only. It does not connect to the
database, execute migrations, call providers, or move money.

## Local gate

From `backend/`:

`node --check scripts/release-gate.js`
`node scripts/release-gate.js`

Then confirm the existing full regression gate remains green before commit if any
runtime file has changed. This batch does not alter runtime application code.
