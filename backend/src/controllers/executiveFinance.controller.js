const {
  buildExecutiveFinanceSummary,
} = require('../services/executiveFinanceAnalytics.service');

async function dashboard(req, res, next) {
  try {
    const summary = await buildExecutiveFinanceSummary({
      currency: req.query.currency,
      from: req.query.from,
      to: req.query.to,
    });

    return res.status(200).json({ summary });
  } catch (error) {
    return next(error);
  }
}

module.exports = { dashboard };
