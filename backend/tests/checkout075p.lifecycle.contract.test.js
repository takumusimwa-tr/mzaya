const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const service = fs.readFileSync(path.join(__dirname, '../src/services/order.service.js'), 'utf8');
const controller = fs.readFileSync(path.join(__dirname, '../src/controllers/order.controller.js'), 'utf8');
const fn = service.slice(service.indexOf('async function updateOrderStatus('), service.indexOf('\n\nasync function cancelOrder('));
test('07.5P status transition allowlist and replay guard', () => {
  assert.match(fn, /const transitions =/);
  assert.match(fn, /transitions\[order\.status\]\?\.includes\(newStatus\)/);
  assert.match(fn, /order\.status === ORDER_STATUS\.DELIVERED/);
});
test('07.5P proof, finance and earnings in one transaction', () => {
  assert.match(fn, /delivery_proof_url: deliveryProofUrl\.trim\(\)/);
  assert.match(fn, /emitOrderCompleted\(\{ order, transaction \}\)/);
  assert.match(fn, /total_deliveries:[\s\S]*?\}, \{ transaction \}\)/);
  assert.doesNotMatch(controller, /await order\.update\(\{ delivery_proof_url \}\)/);
  assert.match(controller, /updateOrderStatus\(req\.params\.id, status, req\.user\.id, delivery_proof_url\)/);
});
test('07.5P no realtime broadcast on delivery replay', () => {
  assert.match(fn, /if \(result\.changed\) \{/);
});
