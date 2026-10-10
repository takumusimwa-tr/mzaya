# Batch 08.6.6A — Gate Repair

The 08.6.6 local gate exposed two baseline mismatches.

1. `paymentRefundFinance.e2e.test.js` created a `PaymentAttempt` without the now-required
   `idempotency_key`. The fixture now supplies a deterministic test-only key. Production
   payment behavior is unchanged.
2. The Node engine floor was unnecessarily constrained to 24.14.1. Mzaya's validated
   runtime policy is Node 24.x, so the engine contract is now `>=24 <25`.

Security audit interpretation:
- `npm audit --omit=dev --audit-level=high` reports only 2 moderate findings.
- Both are the Sequelize -> uuid advisory chain.
- npm's suggested `--force` path would downgrade Sequelize to 3.30.0 and is rejected.
- No high-severity runtime dependency advisory remains in the production-only audit.
- Dependency remediation is deferred to a controlled Sequelize/uuid upgrade path.

Do not run `npm audit fix --force`.
