const {
  nextSettlementDate,
} = require('../src/services/settlementSchedule.service');

describe('settlement schedules', () => {
  const from = new Date('2026-07-31T00:00:00.000Z');

  test('calculates weekly settlements', () => {
    expect(nextSettlementDate({
      schedule: 'weekly',
      from,
    }).toISOString()).toBe('2026-08-07T00:00:00.000Z');
  });

  test('calculates biweekly settlements', () => {
    expect(nextSettlementDate({
      schedule: 'biweekly',
      from,
    }).toISOString()).toBe('2026-08-14T00:00:00.000Z');
  });

  test('rejects unsupported schedules', () => {
    expect(() => nextSettlementDate({
      schedule: 'hourly',
      from,
    })).toThrow('Unsupported');
  });
});
