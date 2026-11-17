'use strict';
const { inspect, paths, tests } = require('../scripts/pilot-lifecycle-readiness');
describe('07.6F offline pilot lifecycle inventory', () => {
  test('required lifecycle source and existing tests are present', () => {
    expect(inspect().filter(item => !item.present)).toEqual([]);
  });
  test('reports missing source rather than claiming readiness', () => {
    const missing = paths.checkout;
    const findings = inspect(() => '', relative => relative !== missing && !tests.includes(relative));
    expect(findings.find(item => item.stage === 'checkout').present).toBe(false);
    expect(findings.find(item => item.stage === 'checkout:source-marker').present).toBe(false);
    expect(findings.some(item => item.stage === 'existing-test' && !item.present)).toBe(true);
  });
});
