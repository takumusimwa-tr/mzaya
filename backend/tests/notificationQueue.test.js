const {
  nextRetryDate,
} = require('../src/services/notificationQueue.service');

describe('notification retry scheduling', () => {
  test('returns a future date', () => {
    const before = Date.now();
    const retryAt = nextRetryDate(1);
    expect(retryAt.getTime()).toBeGreaterThan(before);
  });

  test('uses exponential backoff', () => {
    const first = nextRetryDate(1).getTime() - Date.now();
    const third = nextRetryDate(3).getTime() - Date.now();
    expect(third).toBeGreaterThan(first);
  });
});
