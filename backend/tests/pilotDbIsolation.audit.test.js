'use strict';
const { inspect } = require('../scripts/pilot-db-isolation-audit');

describe('07.6H offline database isolation review', () => {
  test('identifies the existing fixture safety requirements', () => {
    expect(inspect().filter(item => !item.passed)).toEqual([]);
  });
  test('detects a removed provider database reset', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const root = path.resolve(__dirname, '..');
    const findings = inspect(relative => relative === 'tests/providerOutcomeConcurrency.e2e.test.js'
      ? 'describe("no reset", () => {});'
      : fs.readFileSync(path.join(root, relative), 'utf8'));
    expect(findings.find(item => item.name === 'Provider suite calls resetDatabase').passed).toBe(false);
  });
});
