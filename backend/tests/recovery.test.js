const {
  percentile,
} = require('../src/services/financeReliability.service');

describe('finance reliability metrics', () => {
  test('calculates p95 from delivery latencies', () => {
    expect(percentile([10, 20, 30, 40, 50], 0.95)).toBe(50);
  });
});
