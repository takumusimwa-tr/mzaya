const {
  translateBalance,
} = require('../src/services/currencyTranslation.service');

describe('currency translation', () => {
  test('same-currency translation uses rate one', async () => {
    await expect(translateBalance({
      amountMinor: 10000,
      sourceCurrency: 'USD',
      reportingCurrency: 'USD',
      at: new Date(),
    })).resolves.toEqual({
      translatedMinor: 10000,
      fxRateId: null,
      rate: 1,
    });
  });
});
