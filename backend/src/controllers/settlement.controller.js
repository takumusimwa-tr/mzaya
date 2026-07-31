const {
  SettlementBatch,
  Settlement,
} = require('../models/associations');
const {
  createSettlementBatch,
  approveSettlementBatch,
} = require('../services/settlementBatch.service');
const {
  submitApprovedBatch,
} = require('../services/settlementExecution.service');
const {
  createSettlementAdjustment,
} = require('../services/settlementAdjustment.service');

async function createBatch(req, res, next) {
  try {
    const batch = await createSettlementBatch({
      ownerType: req.body.ownerType,
      currency: req.body.currency,
      settlementDate: req.body.settlementDate,
      createdBy: req.user.id,
    });

    return res.status(201).json({ batch });
  } catch (error) {
    return next(error);
  }
}

async function approveBatch(req, res, next) {
  try {
    const batch = await approveSettlementBatch({
      batchId: req.params.batchId,
      approverId: req.user.id,
    });

    return res.status(200).json({ batch });
  } catch (error) {
    return next(error);
  }
}

async function submitBatch(req, res, next) {
  try {
    const batch = await submitApprovedBatch({
      batchId: req.params.batchId,
      actorId: req.user.id,
    });

    return res.status(200).json({ batch });
  } catch (error) {
    return next(error);
  }
}

async function getBatch(req, res, next) {
  try {
    const batch = await SettlementBatch.findByPk(req.params.batchId, {
      include: [{
        model: Settlement,
        as: 'settlements',
      }],
    });

    if (!batch) {
      return res.status(404).json({ error: 'Settlement batch not found' });
    }

    return res.status(200).json({ batch });
  } catch (error) {
    return next(error);
  }
}

async function createAdjustment(req, res, next) {
  try {
    const adjustment = await createSettlementAdjustment({
      ...req.body,
      createdBy: req.user.id,
    });

    return res.status(201).json({ adjustment });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBatch,
  approveBatch,
  submitBatch,
  getBatch,
  createAdjustment,
};
