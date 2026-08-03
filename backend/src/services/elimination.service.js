const crypto = require('crypto');
const {
  IntercompanyTransaction,
  EliminationEntry,
} = require('../models/associations');

async function generateIntercompanyEliminations({
  consolidationRunId,
  reportingCurrency,
}) {
  const transactions = await IntercompanyTransaction.findAll({
    where: {
      reconciliation_status: 'matched',
      status: 'ready_for_elimination',
    },
  });

  const entries = [];

  for (const transaction of transactions) {
    const debit = await EliminationEntry.create({
      consolidation_run_id: consolidationRunId,
      intercompany_transaction_id: transaction.id,
      elimination_reference:
        `ELIM-D-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      account_code: 'INTERCOMPANY_ELIMINATION_DEBIT',
      debit_minor: transaction.amount_minor,
      credit_minor: 0,
      currency: reportingCurrency,
      description: `Eliminate ${transaction.intercompany_reference}`,
    });

    const credit = await EliminationEntry.create({
      consolidation_run_id: consolidationRunId,
      intercompany_transaction_id: transaction.id,
      elimination_reference:
        `ELIM-C-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      account_code: 'INTERCOMPANY_ELIMINATION_CREDIT',
      debit_minor: 0,
      credit_minor: transaction.amount_minor,
      currency: reportingCurrency,
      description: `Eliminate ${transaction.intercompany_reference}`,
    });

    await transaction.update({ status: 'eliminated' });
    entries.push(debit, credit);
  }

  return entries;
}

module.exports = { generateIntercompanyEliminations };
