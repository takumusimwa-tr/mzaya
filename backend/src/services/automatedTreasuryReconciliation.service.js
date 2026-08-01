const { Op } = require('sequelize');
const {
  BankTransaction,
  LedgerTransaction,
  LedgerEntry,
  TreasuryReconciliationCandidate,
} = require('../models/associations');
const {
  amountForLedgerTransaction,
  reconcileBankTransaction,
} = require('./treasuryReconciliation.service');
const {
  scoreReconciliationCandidate,
} = require('./reconciliationScoring.service');
const {
  treasuryReconciliationEvents,
  TREASURY_RECONCILIATION_EVENT,
} = require('../events/treasuryReconciliation.events');

const AUTO_MATCH_THRESHOLD = Number(
  process.env.TREASURY_AUTO_MATCH_THRESHOLD || 0.93
);

async function findCandidateLedgerTransactions(bankTransaction) {
  const transactionDate = new Date(bankTransaction.transaction_date);
  const from = new Date(transactionDate);
  const to = new Date(transactionDate);

  from.setUTCDate(from.getUTCDate() - 5);
  to.setUTCDate(to.getUTCDate() + 5);

  return LedgerTransaction.findAll({
    where: {
      currency: bankTransaction.currency,
      status: 'posted',
      occurred_at: {
        [Op.between]: [from, to],
      },
    },
    include: [{
      model: LedgerEntry,
      as: 'entries',
      required: true,
    }],
    limit: 100,
  });
}

async function proposeMatches(bankTransactionId) {
  const bankTransaction = await BankTransaction.findByPk(bankTransactionId);

  if (!bankTransaction) {
    const error = new Error('Bank transaction not found');
    error.status = 404;
    throw error;
  }

  const ledgerTransactions =
    await findCandidateLedgerTransactions(bankTransaction);

  const scored = ledgerTransactions
    .map((transaction) => ({
      transaction,
      scores: scoreReconciliationCandidate({
        bankTransaction,
        ledgerTransaction: transaction,
        ledgerAmountMinor: amountForLedgerTransaction(transaction),
      }),
    }))
    .filter((item) => item.scores.score >= 0.35)
    .sort((left, right) => right.scores.score - left.scores.score)
    .slice(0, 10);

  for (const item of scored) {
    await TreasuryReconciliationCandidate.upsert({
      bank_transaction_id: bankTransaction.id,
      ledger_transaction_id: item.transaction.id,
      score: item.scores.score,
      amount_score: item.scores.amountScore,
      date_score: item.scores.dateScore,
      reference_score: item.scores.referenceScore,
      description_score: item.scores.descriptionScore,
      status: 'candidate',
    });
  }

  const best = scored[0];

  if (best && best.scores.score >= AUTO_MATCH_THRESHOLD) {
    const reconciliation = await reconcileBankTransaction({
      bankTransactionId: bankTransaction.id,
      ledgerTransactionId: best.transaction.id,
      matchedBy: null,
      notes: 'Automatically matched by treasury reconciliation engine',
    });

    await TreasuryReconciliationCandidate.update({
      status: 'accepted',
    }, {
      where: {
        bank_transaction_id: bankTransaction.id,
        ledger_transaction_id: best.transaction.id,
      },
    });

    treasuryReconciliationEvents.emit(
      TREASURY_RECONCILIATION_EVENT.MATCH_CONFIRMED,
      {
        bankTransactionId: bankTransaction.id,
        reconciliationId: reconciliation.id,
        automated: true,
      }
    );

    return {
      autoMatched: true,
      reconciliation,
      candidates: scored,
    };
  }

  treasuryReconciliationEvents.emit(
    TREASURY_RECONCILIATION_EVENT.REVIEW_REQUIRED,
    {
      bankTransactionId: bankTransaction.id,
      candidateCount: scored.length,
    }
  );

  return {
    autoMatched: false,
    candidates: scored,
  };
}

async function processUnmatchedBankTransactions({ limit = 100 } = {}) {
  const transactions = await BankTransaction.findAll({
    where: { reconciliation_status: 'unmatched' },
    order: [['transaction_date', 'ASC']],
    limit: Math.min(Number(limit) || 100, 300),
  });

  const results = [];

  for (const transaction of transactions) {
    try {
      results.push(await proposeMatches(transaction.id));
    } catch (error) {
      results.push({
        bankTransactionId: transaction.id,
        error: error.message,
      });
    }
  }

  return results;
}

module.exports = {
  findCandidateLedgerTransactions,
  proposeMatches,
  processUnmatchedBankTransactions,
};
