# Batch 08.6.6D.7 — Treasury Contract Convergence

This patch reconciles the two active `treasury_transfers` contracts found in
live main.

## Direction

The 08.3.2 bank/FX fields remain the operational execution contract. The 08.5.6
fields are retained temporarily as compatibility projections for finance,
reconciliation and existing callers.

Creation writes both representations when the information is available.
Finance payload/reconciliation reads canonical fields first and falls back to
compatibility fields. Explicit bank execution validates that the complete
bank-to-bank contract exists before any provider gateway call.

External/manual transfers are representable without pretending that they have
two internal bank accounts.

## Safety invariants

- Maker-checker uses requester/initiator vs approver.
- Creating or approving a transfer never invokes the bank provider gateway.
- Finance outbox emission never moves money.
- Only `executeTreasuryTransfer` can reach `submitTreasuryTransfer`.
- Provider-disabled behavior remains unchanged.
- Migration performs no row backfill and no external action.

## Gate

1. Run `node --check` on each changed JS file.
2. Probe `20261011_staging_treasury_contract_convergence.sql`.
3. Do not execute the migration until the probe passes.
4. After selective execution, run migration status, deep schema audit and the
   finance/treasury test gates before commit.
