const {
  toMinutes,
  isWithinWindow,
  computeIsOpen,
  attachLiveAvailability,
} = require('../src/services/vendorHours.service');

describe('vendorHours.service', () => {
  test('parses valid 24-hour values', () => {
    expect(toMinutes('08:30')).toBe(510);
    expect(toMinutes('24:00')).toBeNull();
    expect(toMinutes('bad')).toBeNull();
  });

  test('supports ordinary and overnight windows', () => {
    expect(isWithinWindow(600, 480, 1320)).toBe(true);
    expect(isWithinWindow(120, 1080, 180)).toBe(true);
    expect(isWithinWindow(720, 1080, 180)).toBe(false);
  });

  test('manual pause always wins', () => {
    expect(computeIsOpen(null, true)).toBe(false);
  });

  test('keeps legacy always-open behavior when no schedule exists', () => {
    expect(computeIsOpen(null, false)).toBe(true);
  });

  test('attaches live availability without mutating the source object', () => {
    const source = { id: 'branch-1', opening_hours: null, is_paused: false };
    const result = attachLiveAvailability(source);

    expect(result).not.toBe(source);
    expect(result.is_open).toBe(true);
    expect(source.is_open).toBeUndefined();
  });
});
