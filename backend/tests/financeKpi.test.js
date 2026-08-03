const {
  evaluateKpiStatus,
} = require('../src/services/financeKpi.service');

describe('finance KPI governance', () => {
  test('lower-than-warning value triggers warning for higher-is-better KPI', () => {
    expect(evaluateKpiStatus({
      favorable_direction: 'higher',
      warning_threshold: 0.2,
      critical_threshold: 0.1,
    }, 0.15)).toBe('warning');
  });

  test('higher-than-critical value triggers critical for lower-is-better KPI', () => {
    expect(evaluateKpiStatus({
      favorable_direction: 'lower',
      warning_threshold: 10,
      critical_threshold: 20,
    }, 25)).toBe('critical');
  });
});
