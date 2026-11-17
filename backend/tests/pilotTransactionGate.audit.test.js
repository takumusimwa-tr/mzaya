'use strict';
const { inventory, localDbGuard, targets } = require('../scripts/pilot-transaction-gate');
describe('07.6G transaction verification preflight (offline)', () => {
  test('existing integration fixture files are present', () => {
    expect(inventory().filter(item => !item.present)).toEqual([]);
    expect(Object.keys(targets)).toEqual(['claim','lifecycle','deliveryFinance','providerConcurrency']);
  });
  test('refuses absent confirmation, remote hosts, and wrong database', () => {
    const base = { CHECKOUT_FINANCE_CONFIRM: 'DISPOSABLE_LOCAL_DATABASE_ONLY', DB_URL: 'postgres://user:pass@localhost:5432/mzaya' };
    expect(localDbGuard({ ...base, CHECKOUT_FINANCE_CONFIRM: '' })).toBeTruthy();
    expect(localDbGuard({ ...base, DB_URL: 'postgres://user:pass@db.example.com/mzaya' })).toBeTruthy();
    expect(localDbGuard({ ...base, DB_URL: 'postgres://user:pass@localhost/production' })).toBeTruthy();
    expect(localDbGuard(base)).toBeNull();
  });
});
