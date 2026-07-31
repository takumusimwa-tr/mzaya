const {
  getFinanceDashboard,
} = require('../services/financeDashboard.service');

async function getDashboard(req, res, next) {
  try {
    const dashboard = await getFinanceDashboard({
      currency: req.query.currency,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    return res.status(200).json({ dashboard });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
};
