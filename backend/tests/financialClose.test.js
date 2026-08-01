const {
  DEFAULT_TASKS,
} = require('../src/services/financialClose.service');

describe('financial close checklist', () => {
  test('includes reconciliation and reporting controls', () => {
    const keys = DEFAULT_TASKS.map(([key]) => key);
    expect(keys).toContain('bank_reconciliation');
    expect(keys).toContain('trial_balance');
    expect(keys).toContain('management_signoff');
  });
});
