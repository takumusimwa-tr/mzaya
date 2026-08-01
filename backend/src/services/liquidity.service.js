const { Op } = require('sequelize');
const {
  BankAccount,
  Settlement,
  TreasuryPaymentBatch,
} = require('../models/associations');

function calculateRunwayDays({
  availableCashMinor,
  averageDailyOutflowMinor,
}) {
  const cash = Number(availableCashMinor || 0);
  const dailyOutflow = Number(averageDailyOutflowMinor || 0);

  if (dailyOutflow <= 0) return null;
  return Number((cash / dailyOutflow).toFixed(2));
}

async function getLiquidityPosition({ currency }) {
  const normalized = String(currency).toUpperCase();

  const [
    totalCashMinor,
    availableCashMinor,
    pendingSettlementsMinor,
    pendingPaymentBatchesMinor,
  ] = await Promise.all([
    BankAccount.sum('current_balance_minor', {
      where: { currency: normalized, status: 'active' },
    }),
    BankAccount.sum('available_balance_minor', {
      where: { currency: normalized, status: 'active' },
    }),
    Settlement.sum('net_minor', {
      where: {
        currency: normalized,
        status: { [Op.in]: ['pending', 'submitted'] },
      },
    }),
    TreasuryPaymentBatch.sum('total_minor', {
      where: {
        currency: normalized,
        status: { [Op.in]: ['draft', 'approved', 'submitted'] },
      },
    }),
  ]);

  const pendingOutflowsMinor =
    Number(pendingSettlementsMinor || 0) +
    Number(pendingPaymentBatchesMinor || 0);

  return {
    currency: normalized,
    totalCashMinor: Number(totalCashMinor || 0),
    availableCashMinor: Number(availableCashMinor || 0),
    restrictedCashMinor: Math.max(
      0,
      Number(totalCashMinor || 0) - Number(availableCashMinor || 0)
    ),
    pendingOutflowsMinor,
  };
}

module.exports = {
  calculateRunwayDays,
  getLiquidityPosition,
};
