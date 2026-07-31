const {
  determineStatus,
} = require('../src/services/reconciliation.service');

describe('payment reconciliation', () => {
  test('matches equal provider and internal amounts', () => {
    expect(determineStatus(1250, 1250)).toBe('matched');
  });

  test('flags different amounts', () => {
    expect(determineStatus(1250, 1200)).toBe('discrepancy');
  });

  test('flags missing internal records', () => {
    expect(determineStatus(1250, null)).toBe('unmatched');
  });
});
