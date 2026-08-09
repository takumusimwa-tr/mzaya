const {
  ProcurementRun,
  ProcurementFinanceReconciliationResult,
} = require('../models/associations');
const {
  createProcurement,
  approveProcurement,
  completeProcurement,
} = require('../services/procurement.service');
const {
  reconcileProcurement,
} = require('../services/procurementReconciliation.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const procurements = await ProcurementRun.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ procurements });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const procurement = await createProcurement(req.body);
    return res.status(201).json({ procurement });
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const procurement = await approveProcurement({
      procurementId: req.params.procurementId,
      approvedBy: req.user.id,
    });

    return res.status(200).json({ procurement });
  } catch (error) {
    return next(error);
  }
}

async function complete(req, res, next) {
  try {
    const procurement = await completeProcurement({
      procurementId: req.params.procurementId,
      completedBy: req.user.id,
    });

    return res.status(200).json({ procurement });
  } catch (error) {
    return next(error);
  }
}

async function reconciliationList(req, res, next) {
  try {
    const results =
      await ProcurementFinanceReconciliationResult.findAll({
        order: [['evaluated_at', 'DESC']],
        limit: Math.min(Number(req.query.limit) || 100, 300),
      });

    return res.status(200).json({ results });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileProcurement(
      req.params.procurementId
    );

    return res.status(200).json({ result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  approve,
  complete,
  reconciliationList,
  reconcile,
};
