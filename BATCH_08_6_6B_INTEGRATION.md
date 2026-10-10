# Batch 08.6.6B — Cumulative Gate Repair

This supersedes the package/configuration portions of 08.6.6 and 08.6.6A.

Repairs:
- preserves Mzaya's existing custom SQL migration runner instead of adding sequelize-cli;
- restores security audit scripts while keeping existing migrate scripts;
- accepts the validated Node 24.x runtime line;
- updates the stale finance E2E fixture with both required fields:
  PaymentAttempt.idempotency_key and Refund.requested_by.

Cleanup after overlay:
Delete these two files if they were introduced by 08.6.6:
- backend/config/config.js
- backend/migrations/20261010000000-baseline-existing-staging-schema.js

Then run `npm install` so package-lock removes sequelize-cli and its now-unneeded
transitive packages.

Gate:
npm run test:finance:e2e
npm run test:finance:observability
npm run test:finance:stress
npm run security:audit

Do not baseline staging or commit until this gate is green.
