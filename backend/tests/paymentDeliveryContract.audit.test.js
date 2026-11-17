'use strict';
const { inspect } = require('../scripts/audit-payment-delivery-contract');

describe('Payment/delivery source contract (offline)', () => {
  test('existing source maintains independent payment and delivery signals', () => {
    const findings = inspect();
    expect(findings.filter(f => !f.passed)).toEqual([]);
  });
  test('detects accidental payment-success assignment in delivery service', () => {
    const fs = require('node:fs');
    const path = require('node:path');
    const file = 'backend/src/services/order.service.js';
    const original = fs.readFileSync(path.resolve(__dirname, '../src/services/order.service.js'), 'utf8');
    const findings = inspect({ [file]: `${original}\nconst regression = { payment_status: 'success' };\n` });
    expect(findings.find(f => f.name === 'No delivery-implies-payment assignment').passed).toBe(false);
  });
});
