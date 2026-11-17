const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/services/order.service.js'), 'utf8');
test('07.5Q.1: non-delivery transitions never trim null proof', () => {
  assert.match(source, /delivery_proof_url:\s*typeof deliveryProofUrl === 'string'\s*\?\s*deliveryProofUrl\.trim\(\)\s*:\s*null/);
  assert.doesNotMatch(source, /delivery_proof_url:\s*deliveryProofUrl\.trim\(\)/);
});
test('07.5Q.1: delivered still requires nonblank proof', () => {
  assert.match(source, /typeof deliveryProofUrl !== 'string'\s*\|\|\s*!deliveryProofUrl\.trim\(\)/);
});
