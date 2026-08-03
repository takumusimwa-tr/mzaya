const {
  ConsolidationGroup,
  ConsolidationMember,
  ConsolidationRun,
} = require('../models/associations');
const {
  startConsolidation,
} = require('../services/consolidation.service');

async function groups(req, res, next) {
  try {
    const items = await ConsolidationGroup.findAll({
      include: [{
        model: ConsolidationMember,
        as: 'members',
      }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ groups: items });
  } catch (error) {
    return next(error);
  }
}

async function runs(req, res, next) {
  try {
    const items = await ConsolidationRun.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ runs: items });
  } catch (error) {
    return next(error);
  }
}

async function start(req, res, next) {
  try {
    const run = await startConsolidation({
      consolidationGroupId: req.body.consolidationGroupId,
      periodCode: req.body.periodCode,
      startedBy: req.user.id,
    });
    return res.status(201).json({ run });
  } catch (error) {
    return next(error);
  }
}

module.exports = { groups, runs, start };
