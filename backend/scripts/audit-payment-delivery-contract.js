'use strict';
// Read-only contract guard: never connects to a database or payment provider.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '../..');
function inspect(files = {}) {
  function source(relativePath) {
    if (Object.prototype.hasOwnProperty.call(files, relativePath)) return files[relativePath];
    return fs.readFileSync(path.join(root, relativePath), 'utf8');
  }
  const delivery = source('backend/src/services/order.service.js');
  const payment = source('backend/src/controllers/payment.controller.js');
  const provider = source('backend/src/services/payment.service.js');
  const customer = source('frontend/src/pages/order/OrderDetail.jsx');
  const findings = [];
  function requirePattern(name, text, regex) {
    const passed = regex.test(text);
    findings.push({ name, passed });
  }
  // These are source-level tripwires, not substitutes for transactional tests.
  requirePattern('Delivery is guarded by proof', delivery, /newStatus\s*===\s*ORDER_STATUS\.DELIVERED[\s\S]{0,170}deliveryProofUrl/);
  requirePattern('Delivery emits completion in transaction', delivery, /emitDeliveryCompleted\(\{\s*order,\s*deliveredAt:\s*order\.delivered_at,\s*transaction\s*\}\)/);
  requirePattern('Delivery updates earnings in transaction', delivery, /total_earnings_usd:[\s\S]{0,250}\},\s*\{\s*transaction\s*\}/);
  requirePattern('Payment success derived from attempts', payment, /PaymentAttempt\.count\(\{[\s\S]{0,180}status:\s*'success'/);
  requirePattern('Payment status recomputed from attempts', payment, /Order\.update\(\{\s*payment_status:\s*status\s*\}/);
  requirePattern('Provider mock forbidden in production', provider, /if\s*\(IS_PROD\s*&&\s*ALLOW_MOCK\)/);
  requirePattern('Customer unpaid state explicit', customer, /order\.payment_status\s*!==\s*'success'/);
  requirePattern('Customer displays outstanding delivered payment', customer, /unpaid\s*&&\s*delivered/);
  findings.push({ name: 'No delivery-implies-payment assignment', passed: !/payment_status\s*:\s*(?:['"]success['"]|PAYMENT_STATUS\.SUCCESS)/.test(delivery) });
  return findings;
}
function run() {
  const findings = inspect();
  for (const item of findings) console.log(`${item.passed ? 'PASS' : 'FAIL'} ${item.name}`);
  assert.ok(findings.every(item => item.passed), 'Payment/delivery source contract audit failed');
  console.log('Payment/delivery source contract audit passed (offline; no money or DB changes).');
}
if (require.main === module) run();
module.exports = { inspect };
