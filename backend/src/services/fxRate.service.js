const { Op } = require('sequelize');
const { TreasuryFxRate } = require('../models/associations');

async function getLatestFxRate({
  baseCurrency,
  quoteCurrency,
  at = new Date(),
}) {
  if (baseCurrency === quoteCurrency) {
    return {
      id: null,
      rate: 1,
      base_currency: baseCurrency,
      quote_currency: quoteCurrency,
    };
  }

  return TreasuryFxRate.findOne({
    where: {
      base_currency: String(baseCurrency).toUpperCase(),
      quote_currency: String(quoteCurrency).toUpperCase(),
      status: 'active',
      effective_at: { [Op.lte]: at },
      [Op.or]: [
        { expires_at: null },
        { expires_at: { [Op.gte]: at } },
      ],
    },
    order: [['effective_at', 'DESC']],
  });
}

function convertMinorUnits({
  amountMinor,
  rate,
}) {
  const amount = Number(amountMinor);
  const numericRate = Number(rate);

  if (!Number.isSafeInteger(amount) || amount < 0) {
    const error = new Error('Amount must be a non-negative integer');
    error.status = 422;
    throw error;
  }

  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    const error = new Error('FX rate must be positive');
    error.status = 422;
    throw error;
  }

  return Math.round(amount * numericRate);
}

module.exports = {
  getLatestFxRate,
  convertMinorUnits,
};
