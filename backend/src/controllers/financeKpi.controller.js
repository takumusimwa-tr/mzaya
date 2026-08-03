const {
  FinanceKpiDefinition,
  FinanceKpiSnapshot,
} = require('../models/associations');
const {
  saveKpiSnapshot,
  getKpiTrend,
} = require('../services/financeKpi.service');

async function definitions(req, res, next) {
  try {
    const items = await FinanceKpiDefinition.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
    return res.status(200).json({ definitions: items });
  } catch (error) {
    return next(error);
  }
}

async function snapshots(req, res, next) {
  try {
    const items = await FinanceKpiSnapshot.findAll({
      order: [['snapshot_date', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 200, 500),
    });
    return res.status(200).json({ snapshots: items });
  } catch (error) {
    return next(error);
  }
}

async function createSnapshot(req, res, next) {
  try {
    const snapshot = await saveKpiSnapshot(req.body);
    return res.status(201).json({ snapshot });
  } catch (error) {
    return next(error);
  }
}

async function trend(req, res, next) {
  try {
    const items = await getKpiTrend({
      kpiKey: req.params.kpiKey,
      from: req.query.from,
      to: req.query.to,
      currency: req.query.currency,
    });
    return res.status(200).json({ snapshots: items });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  definitions,
  snapshots,
  createSnapshot,
  trend,
};
