# Mzaya Finance Migration Manifest — Batch 08.6.1

## Live repository audit

The uploaded `mzaya-main(6).zip` was inspected directly.

### Confirmed live canonical entities

- Customer order: `backend/src/models/orderModel.js` → table `orders`
- Payment: `backend/src/models/paymentAttemptModel.js` → table `payment_attempts`
- Vendor: existing `vendor` domain
- Delivery partner: existing `Rider` model internally; new finance/UI terminology remains **Mzaya**
- Ledger: `ledger_transactions` + `ledger_entries`
- Finance event engine/outbox migrations from 08.4.7/08.4.8 are present

### Critical merge defects found and corrected

1. Eight finance model files were incorrectly stored under `src/jobs`.
   They are moved to `src/models`.
2. `FinanceJournalBatchEvent` was referenced by services but had no Sequelize model.
3. `models/associations.js` exported only the original commerce models, leaving
   the finance stack disconnected.
4. Finance routes existed but were not mounted in `app.js`.
5. Finance jobs existed but were not booted in `index.js`.
6. Finance realtime bridges existed but were not initialized.
7. Payment finance scaffolding assumed a non-existent `payments` table.
   The live canonical payment record is `PaymentAttempt`.
8. Order finance migration targeted non-existent table names (`orderFood`, etc.).
   Finance reconciliation now attaches to canonical `orders`.
9. Payment resolution did not atomically write a finance outbox event.
10. Refund completion still called a direct ledger path.
    It now publishes a finance outbox event after provider confirmation.
11. Order delivery/cancellation did not atomically publish finance events.
12. Order-finance monetary values treated USD decimal values as minor units.
13. The admin finance pages existed but were unreachable from routing.
14. Admin finance pages were constrained to the customer phone-width shell.

## Direct-ledger audit

Search result in the live source:

```text
backend/src/services/ledger.service.js
  LedgerTransaction.create(...)
  LedgerEntry.bulkCreate(...)
```

No operational controller was found creating ledger rows directly.

However, legacy helper services still call the central ledger service, notably:

```text
backend/src/services/orderPaymentLedger.service.js
backend/src/services/refundLedger.service.js
```

`refund.service.js` is migrated in this batch and no longer invokes
`refundLedger.service.js`.

`orderPaymentLedger.service.js` remains present for compatibility but should not
be invoked by the live payment resolution path after this merge. The legacy
posting guard from 08.5.8 remains the cutover enforcement mechanism.

## Cutover posture after 08.6.1

The repository is now wired for:

```text
operational transaction
  -> transactional outbox
  -> finance business event
  -> accounting event
  -> ledger
  -> reconciliation
  -> cutover guard
```

Do **not** immediately activate `block_legacy` in production.

Use shadow/reconciliation first, then domain-by-domain cutover.
