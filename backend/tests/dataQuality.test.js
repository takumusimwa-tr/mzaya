const { evaluateRule } = require('../src/services/financeDataQuality.service');
describe('finance data quality', () => {
  test('detects missing required fields', () => {
    const result = evaluateRule({
      rule_type: 'required_fields',
      configuration: { fields: ['code', 'name'] },
    }, { code: '1000' });
    expect(result.passed).toBe(false);
  });
});
