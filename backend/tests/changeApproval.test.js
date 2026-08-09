const { diffObjects } = require('../src/services/financeConfigurationDiff.service');
describe('finance configuration diff', () => {
  test('returns only changed fields', () => {
    expect(diffObjects({ code: '1000', name: 'Cash' }, { code: '1000', name: 'Bank Cash' }))
      .toEqual({ name: { before: 'Cash', after: 'Bank Cash' } });
  });
});
