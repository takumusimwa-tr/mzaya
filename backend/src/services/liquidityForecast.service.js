const crypto = require('crypto');
const {
  LiquidityForecastVersion,
  LiquidityForecastLine,
  LiquidityForecastScenario,
} = require('../models/associations');

function applyScenario(value, multiplier = 1) {
  return Math.round(Number(value || 0) * Number(multiplier || 1));
}

function buildDailyForecast({
  openingCashMinor,
  dates,
  expectedInflowsByDate = {},
  expectedOutflowsByDate = {},
  inflowMultiplier = 1,
  outflowMultiplier = 1,
}) {
  let runningCash = Number(openingCashMinor || 0);

  return dates.map((date) => {
    const inflowMinor = applyScenario(
      expectedInflowsByDate[date],
      inflowMultiplier
    );
    const outflowMinor = applyScenario(
      expectedOutflowsByDate[date],
      outflowMultiplier
    );

    runningCash += inflowMinor - outflowMinor;

    return {
      date,
      inflowMinor,
      outflowMinor,
      netMinor: inflowMinor - outflowMinor,
      closingCashMinor: runningCash,
    };
  });
}

async function createLiquidityForecast({
  scenarioId,
  currency,
  forecastStart,
  forecastEnd,
  openingCashMinor,
  dates,
  expectedInflowsByDate,
  expectedOutflowsByDate,
  createdBy,
}) {
  const scenario = await LiquidityForecastScenario.findByPk(scenarioId);

  if (!scenario) {
    const error = new Error('Liquidity forecast scenario not found');
    error.status = 404;
    throw error;
  }

  const assumptions = scenario.assumptions || {};
  const forecastData = buildDailyForecast({
    openingCashMinor,
    dates,
    expectedInflowsByDate,
    expectedOutflowsByDate,
    inflowMultiplier: assumptions.inflowMultiplier || 1,
    outflowMultiplier: assumptions.outflowMultiplier || 1,
  });

  const version = await LiquidityForecastVersion.create({
    forecast_reference: `LQF-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    version_number: 1,
    currency,
    forecast_start: forecastStart,
    forecast_end: forecastEnd,
    assumptions,
    forecast_data: forecastData,
    created_by: createdBy,
    status: 'draft',
  });

  await LiquidityForecastLine.bulkCreate(
    forecastData.map((line) => ({
      forecast_version_id: version.id,
      scenario_id: scenarioId,
      forecast_date: line.date,
      line_type: 'daily_net',
      inflow_minor: line.inflowMinor,
      outflow_minor: line.outflowMinor,
      net_minor: line.netMinor,
      confidence_ratio: assumptions.confidenceRatio || 1,
      metadata: {
        closingCashMinor: line.closingCashMinor,
      },
    }))
  );

  return version;
}

module.exports = {
  applyScenario,
  buildDailyForecast,
  createLiquidityForecast,
};
