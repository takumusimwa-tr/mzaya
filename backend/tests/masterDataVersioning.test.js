const { hashPayload } = require('../src/services/financeMasterData.service');
describe('finance master-data versioning', () => {
  test('payload hashes are stable', () => {
    const p = { code: '1000', name: 'Cash' };
    expect(hashPayload(p)).toBe(hashPayload(p));
  });
});
