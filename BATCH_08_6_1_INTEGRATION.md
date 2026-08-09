# Batch 08.6.1 — Live Codebase Finance Merge & Legacy Posting Audit

This package is based on the actual uploaded `mzaya-main(6).zip`, not an assumed
repository.

## Apply migrations

Apply the existing 08.4/08.5 migrations in repository order, then:

```bash
cd backend
npm run migrate
```

The additional reconciliation migration is:

```text
backend/migrations/finance_live_merge_08_6_1.sql
```

Production must continue using reviewed migrations; do not use Sequelize
`sync({ alter: true })` in production.

## Runtime changes

`backend/src/runtime/financeRuntime.js` now owns finance jobs and finance socket
bridges. It is started by `backend/src/index.js` after Socket.IO is initialized
and is stopped during graceful shutdown.

## Payment integration

The live `PaymentAttempt` is treated as the canonical payment entity.

On provider-confirmed resolution:

```text
success
  -> payment.captured outbox event

failed
  -> payment.failed outbox event
```

The payment state transition and outbox insert occur in the same Sequelize
transaction.

## Refund integration

The live `Refund` model remains authoritative.

Provider-confirmed completion now does:

```text
refund.status = processed
+
payment.refunded outbox event
=
one transaction
```

The old direct call to `postRefundLedger()` was removed from the operational
refund completion path.

## Order integration

The canonical `orders` row now owns finance reconciliation status.

Delivery completion atomically emits:

```text
order.completed
delivery.completed
```

and updates `OrderEconomics`.

Customer cancellation atomically emits:

```text
order.cancelled
```

## Admin finance routes

The finance pages already present in the repository are now routed under:

```text
/admin/finance/events
/admin/finance/posting
/admin/finance/delivery
/admin/finance/dead-letters
/admin/finance/reliability
/admin/finance/payment-reconciliation
/admin/finance/order-reconciliation
/admin/finance/vendor-settlements
/admin/finance/vendor-settlements/reconciliation
/admin/finance/mzaya-payouts
/admin/finance/mzaya-payouts/reconciliation
/admin/finance/procurement
/admin/finance/procurement/reconciliation
/admin/finance/treasury
/admin/finance/treasury/reconciliation
/admin/finance/tax
/admin/finance/tax/reconciliation
/admin/finance/cutover
/admin/finance/reconciliation
```

Admin finance screens render full width rather than inside the customer
phone-width shell.

## Legacy posting audit

The only raw Sequelize ledger writes found are centralized in:

```text
backend/src/services/ledger.service.js
```

That is correct.

Legacy helper services that call the central ledger service must still be
classified and guarded before production cutover.

Use:

```bash
grep -R "postLedgerTransaction" backend/src
grep -R "LedgerTransaction.create" backend/src
grep -R "LedgerEntry.bulkCreate" backend/src
```

Then place `financeLegacyPostingGuard` before any remaining operational direct
posting path.

## Production rollout

Recommended:

```text
1. deploy schema + code
2. keep cutover controls in legacy/shadow
3. allow outbox/event engine to run
4. verify payment and order event lineage
5. run cross-domain reconciliation
6. clear dead letters/backlog
7. request domain cutover
8. independent approval
9. block legacy posting domain-by-domain
```

Do not cut over treasury or tax first.

## Verification

Backend:

```bash
cd backend
npm ci
npm run lint
npm test
```

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

This runtime performed static JavaScript syntax validation on the modified
backend files. Full Jest/Vite verification still requires installed npm
dependencies and a configured test database.
