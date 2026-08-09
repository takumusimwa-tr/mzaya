const {
  FinanceReplayQueue,
} = require('../models/associations');
const {
  queueReplay,
} = require('../services/financeReplay.service');

async function list(req, res, next) {
  try {
    const items = await FinanceReplayQueue.findAll({
      order: [['requested_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

async function queue(req, res, next) {
  try {
    const item = await queueReplay({
      businessEventId: req.params.businessEventId,
      reason: req.body.reason,
      requestedBy: req.user.id,
    });

    return res.status(201).json({ item });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  queue,
};
