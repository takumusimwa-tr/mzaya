const {
  IntercompanyTransaction,
} = require('../models/associations');
const {
  recordIntercompanyTransaction,
  reconcileIntercompanyTransaction,
} = require('../services/intercompany.service');

async function list(req, res, next) {
  try {
    const transactions = await IntercompanyTransaction.findAll({
      order: [['transaction_date', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ transactions });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const transaction = await recordIntercompanyTransaction(req.body);
    return res.status(201).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const transaction = await reconcileIntercompanyTransaction({
      intercompanyTransactionId: req.params.transactionId,
      counterpartyTransactionId: req.body.counterpartyTransactionId,
    });
    return res.status(200).json({ transaction });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, reconcile };
