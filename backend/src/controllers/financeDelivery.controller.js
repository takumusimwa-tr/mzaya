const {
  FinanceOutboxEvent,
  FinanceDeliveryAttempt,
} = require('../models/associations');

async function dashboard(req, res, next) {
  try {
    const [outbox, attempts] = await Promise.all([
      FinanceOutboxEvent.findAll({
        order: [['created_at', 'DESC']],
        limit: Math.min(Number(req.query.limit) || 100, 300),
      }),
      FinanceDeliveryAttempt.findAll({
        order: [['started_at', 'DESC']],
        limit: 200,
      }),
    ]);

    return res.status(200).json({
      outbox,
      attempts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
};
