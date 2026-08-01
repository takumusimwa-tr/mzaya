const {
  BankTransaction,
  TreasuryReconciliation,
  LedgerTransaction,
  LedgerEntry,
} = require('../models/associations');

function amountForLedgerTransaction(transaction) {
  return (transaction.entries || [])
    .filter((entry) => entry.direction === 'debit')
    .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);
}

async function reconcileBankTransaction({
  bankTransactionId,
  ledgerTransactionId,
  matchedBy,
  notes = null,
}) {
  const [bankTransaction, ledgerTransaction] = await Promise.all([
    BankTransaction.findByPk(bankTransactionId),
    LedgerTransaction.findByPk(ledgerTransactionId, {
      include: [{ model: LedgerEntry, as: 'entries' }],
    }),
  ]);

  if (!bankTransaction || !ledgerTransaction) {
    const error = new Error('Bank or ledger transaction not found');
    error.status = 404;
    error.code = 'RECONCILIATION_RESOURCE_NOT_FOUND';
    throw error;
  }

  const ledgerAmount = amountForLedgerTransaction(ledgerTransaction);
  const difference =
    Number(bankTransaction.amount_minor) - Number(ledgerAmount);

  const [reconciliation] = await TreasuryReconciliation.findOrCreate({
    where: { bank_transaction_id: bankTransaction.id },
    defaults: {
      ledger_transaction_id: ledgerTransaction.id,
      matched_by: matchedBy,
      match_type: difference === 0 ? 'exact' : 'manual',
      amount_difference_minor: difference,
      status: difference === 0 ? 'matched' : 'discrepancy',
      notes,
    },
  });

  await bankTransaction.update({
    reconciliation_status:
      difference === 0 ? 'matched' : 'discrepancy',
  });

  return reconciliation;
}

module.exports = {
  amountForLedgerTransaction,
  reconcileBankTransaction,
};
