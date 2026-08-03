const { getLatestFxRate, convertMinorUnits } = require('./fxRate.service');

async function translateBalance({
  amountMinor,
  sourceCurrency,
  reportingCurrency,
  at,
}) {
  if (sourceCurrency === reportingCurrency) {
    return {
      translatedMinor: Number(amountMinor),
      fxRateId: null,
      rate: 1,
    };
  }

  const rate = await getLatestFxRate({
    baseCurrency: sourceCurrency,
    quoteCurrency: reportingCurrency,
    at,
  });

  if (!rate) {
    const error = new Error('Currency translation rate not found');
    error.status = 409;
    error.code = 'TRANSLATION_RATE_NOT_FOUND';
    throw error;
  }

  return {
    translatedMinor: convertMinorUnits({
      amountMinor: Math.abs(Number(amountMinor)),
      rate: rate.rate,
    }) * (Number(amountMinor) < 0 ? -1 : 1),
    fxRateId: rate.id,
    rate: Number(rate.rate),
  };
}

module.exports = { translateBalance };
