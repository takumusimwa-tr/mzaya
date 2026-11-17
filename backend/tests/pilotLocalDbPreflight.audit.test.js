'use strict';
const { inspect, fixtures } = require('../scripts/pilot-local-db-preflight');
const exists = () => true;
describe('07.6I offline local DB preflight', () => {
  test('never treats remote DB as a safe local target', () => {
    const r = inspect({ DB_URL: 'postgres://user:secret@remote.example/mzaya_test', NODE_ENV: 'test' }, exists);
    expect(r.databaseKind).toBe('not-safe-local-postgres');
    expect(r.findings.find(x => x.check.startsWith('DB_URL')).ok).toBe(false);
  });
  test('recognizes test-named local PostgreSQL configuration without connecting', () => {
    const r = inspect({ DB_URL: 'postgres://user:secret@localhost:5432/mzaya_test', NODE_ENV: 'test' }, exists);
    expect(r.databaseKind).toBe('local-test-named');
    expect(r.findings.every(x => x.ok)).toBe(true);
  });
  test('flags non-test database for reset-based suites', () => {
    const r = inspect({ DB_URL: 'postgres://user:secret@localhost:5432/mzaya', NODE_ENV: 'test' }, exists);
    expect(r.databaseKind).toBe('local-non-test-named');
    expect(r.findings.find(x => x.check.startsWith('DB name')).ok).toBe(false);
  });
  test('reports missing fixtures', () => {
    const r = inspect({}, () => false);
    expect(r.findings.slice(0, fixtures.length).every(x => !x.ok)).toBe(true);
  });
});
