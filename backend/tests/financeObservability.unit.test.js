const {
  ageSeconds,
  severityFor,
  worstSeverity,
} = require('../src/services/financeObservability.service');

test('finance observability severity boundaries are deterministic', () => {
  expect(severityFor(0, 10, 20)).toBe('healthy');
  expect(severityFor(10, 10, 20)).toBe('warning');
  expect(severityFor(20, 10, 20)).toBe('critical');
  expect(worstSeverity(['healthy', 'warning'])).toBe('warning');
  expect(worstSeverity(['warning', 'critical'])).toBe('critical');
});

test('ageSeconds never returns negative age', () => {
  const now = new Date('2026-10-05T22:00:00.000Z').getTime();
  expect(ageSeconds(new Date('2026-10-05T21:59:00.000Z'), now)).toBe(60);
  expect(ageSeconds(new Date('2026-10-05T22:01:00.000Z'), now)).toBe(0);
});
