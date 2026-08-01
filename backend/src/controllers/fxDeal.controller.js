const { TreasuryFxDeal } = require('../models/associations');
const {
  createFxDeal,
  settleFxDeal,
} = require('../services/fxDeal.service');

async function create(req, res, next) {
  try {
    const deal = await createFxDeal({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ deal });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const deals = await TreasuryFxDeal.findAll({
      order: [['trade_date', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ deals });
  } catch (error) {
    return next(error);
  }
}

async function settle(req, res, next) {
  try {
    const deal = await settleFxDeal({
      dealId: req.params.dealId,
      provider: req.body.provider,
      providerReference: req.body.providerReference,
    });
    return res.status(200).json({ deal });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list, settle };
