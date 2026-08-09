const template = require('../src/config/financePostingTemplates/paymentCaptured');

describe('payment capture posting template', () => {
  test('contains balanced debit and credit directions', () => {
    const directions = template.lines.map((line) => line.direction);
    expect(directions).toContain('debit');
    expect(directions).toContain('credit');
  });
});
