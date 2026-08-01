const { LiquiditySnapshot } = require('../models/associations');
const {
  getLiquidityPosition,
  calculateRunwayDays,
} = require('./liquidity.service');

async function createLiquiditySnapshot({
  snapshotDate,
  currency,
  forecastInflowsMinor = 0,
  forecastOutflowsMinor = 0,
  averageDailyOutflowMinor = 0,
}) {
  const position = await getLiquidityPosition({ currency });

  const [snapshot] = await LiquiditySnapshot.upsert({
    snapshot_date: snapshotDate,
    currency: position.currency,
    total_cash_minor: position.totalCashMinor,
    available_cash_minor: position.availableCashMinor,
    restricted_cash_minor: position.restrictedCashMinor,
    pending_outflows_minor: position.pendingOutflowsMinor,
    forecast_inflows_minor: forecastInflowsMinor,
    forecast_outflows_minor: forecastOutflowsMinor,
    runway_days: calculateRunwayDays({
      availableCashMinor: position.availableCashMinor,
      averageDailyOutflowMinor,
    }),
  }, { returning: true });

  return snapshot;
}

module.exports = { createLiquiditySnapshot };
