const {
  LiquidityForecastVersion,
  LiquidityForecastScenario,
} = require('../models/associations');
const {
  createLiquidityForecast,
} = require('../services/liquidityForecast.service');

async function scenarios(req, res, next) {
  try {
    const items = await LiquidityForecastScenario.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ scenarios: items });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const forecast = await createLiquidityForecast({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ forecast });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const forecasts = await LiquidityForecastVersion.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ forecasts });
  } catch (error) {
    return next(error);
  }
}

module.exports = { scenarios, create, list };
