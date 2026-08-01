const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  Forecast,
  ForecastVersion,
  ForecastLine,
} = require('../models/associations');

function applyForecastAssumptions({
  baseMinor,
  growthRate = 0,
  confidenceRatio = 1,
}) {
  const projected = Number(baseMinor || 0) * (1 + Number(growthRate || 0));
  return Math.round(projected * Number(confidenceRatio || 1));
}

async function createForecast({
  name,
  currency,
  horizonMonths,
  scenario,
  assumptions = {},
  createdBy,
  lines,
}) {
  return sequelize.transaction(async (transaction) => {
    const forecast = await Forecast.create({
      forecast_code: `FCT-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      name,
      currency: String(currency).toUpperCase(),
      horizon_months: horizonMonths,
      created_by: createdBy,
    }, { transaction });

    const version = await ForecastVersion.create({
      forecast_id: forecast.id,
      version_number: 1,
      scenario,
      assumptions,
      created_by: createdBy,
    }, { transaction });

    await ForecastLine.bulkCreate(
      lines.map((line) => ({
        forecast_version_id: version.id,
        period_code: line.periodCode,
        account_id: line.accountId || null,
        department_code: line.departmentCode || null,
        cost_center_code: line.costCenterCode || null,
        line_type: line.lineType,
        amount_minor: applyForecastAssumptions({
          baseMinor: line.baseMinor,
          growthRate: line.growthRate ?? assumptions.growthRate ?? 0,
          confidenceRatio:
            line.confidenceRatio ?? assumptions.confidenceRatio ?? 1,
        }),
        confidence_ratio:
          line.confidenceRatio ?? assumptions.confidenceRatio ?? 1,
        source_type: line.sourceType || null,
        source_id: line.sourceId || null,
      })),
      { transaction }
    );

    return { forecast, version };
  });
}

module.exports = {
  applyForecastAssumptions,
  createForecast,
};
