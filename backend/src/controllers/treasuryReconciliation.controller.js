const {
  BankTransaction,
} = require('../models/associations');
const {
  reconcileBankTransaction,
} = require('../services/treasuryReconciliation.service');

async function queue(req, res, next) {
  try {
    const transactions = await BankTransaction.findAll({
      where: { reconciliation_status: req.query.status || 'unmatched' },
      order: [['transaction_date', 'ASC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ transactions });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const reconciliation = await reconcileBankTransaction({
      bankTransactionId: req.params.bankTransactionId,
      ledgerTransactionId: req.body.ledgerTransactionId,
      matchedBy: req.user.id,
      notes: req.body.notes,
    });
    return res.status(200).json({ reconciliation });
  } catch (error) {
    return next(error);
  }
}

module.exports = { queue, reconcile };
