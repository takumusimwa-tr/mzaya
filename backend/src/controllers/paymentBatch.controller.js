const {
  TreasuryPaymentBatch,
  TreasuryPaymentBatchItem,
} = require('../models/associations');
const { createPaymentBatch } = require('../services/paymentBatch.service');

async function create(req, res, next) {
  try {
    const batch = await createPaymentBatch({
      items: req.body.items,
      createdBy: req.user.id,
    });
    return res.status(201).json({ batch });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const batches = await TreasuryPaymentBatch.findAll({
      include: [{ model: TreasuryPaymentBatchItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ batches });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list };
