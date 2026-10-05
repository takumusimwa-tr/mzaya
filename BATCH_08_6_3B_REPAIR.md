# Batch 08.6.3B — Finance Stress Runtime Repair

Fixes the runtime defects exposed after 08.6.3A:
- supplies required PaymentAttempt idempotency keys in provider stress fixtures;
- maps the Sequelize outbox timestamp to FinanceBusinessEvent.occurred_at;
- removes the nonexistent FinancePostingRule.name field from finance seed writes.

The production payment idempotency invariant remains strict.

Re-run:
    cd backend
    npm run test:finance:stress
