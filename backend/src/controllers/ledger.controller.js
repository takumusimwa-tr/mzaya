const {
  LedgerTransaction,
} = require('../models/associations');
const {
  reverseLedgerTransaction,
} = require('../services/ledger.service');

async function getTransaction(req, res, next) {
  try {
    const transaction = await LedgerTransaction.findByPk(
      req.params.transactionId,
      { include: ['entries'] }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Ledger transaction not found' });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

async function reverse(req, res, next) {
  try {
    const transaction = await reverseLedgerTransaction({
      transactionId: req.params.transactionId,
      reason: req.body.reason,
      createdBy: req.user.id,
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransaction,
  reverse,
};
