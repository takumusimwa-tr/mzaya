const {
  FinanceDeadLetter,
} = require('../models/associations');
const {
  requestDeadLetterReplay,
} = require('../services/financeDeadLetter.service');

async function list(req, res, next) {
  try {
    const items = await FinanceDeadLetter.findAll({
      order: [['quarantined_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ items });
  } catch (error) {
    return next(error);
  }
}

async function replay(req, res, next) {
  try {
    const item = await requestDeadLetterReplay({
      deadLetterId: req.params.deadLetterId,
      requestedBy: req.user.id,
    });

    return res.status(200).json({ item });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  replay,
};
