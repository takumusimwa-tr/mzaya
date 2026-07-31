const { FinancialPeriod } = require('../models/associations');
const {
  closeFinancialPeriod,
  reopenFinancialPeriod,
} = require('../services/financialPeriod.service');

async function list(req, res, next) {
  try {
    const periods = await FinancialPeriod.findAll({
      order: [['start_date', 'DESC']],
    });
    return res.status(200).json({ periods });
  } catch (error) {
    return next(error);
  }
}

async function close(req, res, next) {
  try {
    const period = await closeFinancialPeriod({
      periodId: req.params.periodId,
      actorId: req.user.id,
      notes: req.body.notes,
    });
    return res.status(200).json({ period });
  } catch (error) {
    return next(error);
  }
}

async function reopen(req, res, next) {
  try {
    const period = await reopenFinancialPeriod({
      periodId: req.params.periodId,
      actorId: req.user.id,
      notes: req.body.notes,
    });
    return res.status(200).json({ period });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, close, reopen };
