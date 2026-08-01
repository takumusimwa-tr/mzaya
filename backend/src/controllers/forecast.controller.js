const {
  Forecast,
  ForecastVersion,
  ForecastLine,
} = require('../models/associations');
const {
  createForecast,
} = require('../services/forecast.service');

async function list(req, res, next) {
  try {
    const forecasts = await Forecast.findAll({
      include: [{
        model: ForecastVersion,
        as: 'versions',
        include: [{ model: ForecastLine, as: 'lines' }],
      }],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({ forecasts });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = await createForecast({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
};
