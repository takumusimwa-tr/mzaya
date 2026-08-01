const { Op } = require('sequelize');
const {
  BankAccount,
  Settlement,
  TreasuryFxExposure,
} = require('../models/associations');
const {
  getLatestFxRate,
  convertMinorUnits,
} = require('./fxRate.service');

async function calculateCurrencyExposure({
  currency,
  reportingCurrency,
  exposureDate,
}) {
  const normalized = String(currency).toUpperCase();

  const [cashMinor, payableMinor] = await Promise.all([
    BankAccount.sum('available_balance_minor', {
      where: { currency: normalized, status: 'active' },
    }),
    Settlement.sum('net_minor', {
      where: {
        currency: normalized,
        status: { [Op.in]: ['pending', 'submitted'] },
      },
    }),
  ]);

  const grossExposureMinor =
    Number(cashMinor || 0) - Number(payableMinor || 0);

  const rate = await getLatestFxRate({
    baseCurrency: normalized,
    quoteCurrency: reportingCurrency,
  });

  if (!rate) {
    const error = new Error('FX rate not found for exposure calculation');
    error.status = 409;
    error.code = 'FX_RATE_NOT_FOUND';
    throw error;
  }

  const reportingValueMinor = convertMinorUnits({
    amountMinor: Math.abs(grossExposureMinor),
    rate: rate.rate,
  }) * (grossExposureMinor < 0 ? -1 : 1);

  const [exposure] = await TreasuryFxExposure.upsert({
    exposure_date: exposureDate,
    currency: normalized,
    exposure_type: 'net_cash',
    gross_exposure_minor: grossExposureMinor,
    hedged_minor: 0,
    net_exposure_minor: grossExposureMinor,
    reporting_currency: String(reportingCurrency).toUpperCase(),
    reporting_value_minor: reportingValueMinor,
    status: 'open',
    metadata: {
      fxRateId: rate.id,
    },
  }, { returning: true });

  return exposure;
}

module.exports = {
  calculateCurrencyExposure,
};
