const {
  TreasuryTransfer,
} = require('../models/associations');
const {
  createTreasuryTransfer,
} = require('../services/treasuryTransfer.service');

async function create(req, res, next) {
  try {
    const transfer = await createTreasuryTransfer({
      ...req.body,
      requestedBy: req.user.id,
    });

    return res.status(201).json({ transfer });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const transfers = await TreasuryTransfer.findAll({
      order: [['requested_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ transfers });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
};
