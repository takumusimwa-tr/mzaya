const {
  TreasuryFxRate,
  TreasuryFxExposure,
} = require('../models/associations');

async function rates(req, res, next) {
  try {
    const items = await TreasuryFxRate.findAll({
      where: req.query.baseCurrency
        ? { base_currency: req.query.baseCurrency }
        : undefined,
      order: [['effective_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ rates: items });
  } catch (error) {
    return next(error);
  }
}

async function exposures(req, res, next) {
  try {
    const items = await TreasuryFxExposure.findAll({
      order: [['exposure_date', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ exposures: items });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  rates,
  exposures,
};
