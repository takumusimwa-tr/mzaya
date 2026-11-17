'use strict';
// Batch 07.6F: offline, read-only readiness inventory. No DB/provider/network calls.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../..');
const paths = Object.freeze({
  checkout: 'backend/src/services/order.service.js',
  payment: 'backend/src/controllers/payment.controller.js',
  vendor: 'frontend/src/pages/vendor/VendorOrders.jsx',
  dispatch: 'backend/src/services/orderDispatch.service.js',
  claim: 'backend/src/services/orderClaim.service.js',
  delivery: 'frontend/src/pages/rider/RiderDelivery.jsx',
  finance: 'backend/src/services/deliveryFinanceEvents.service.js',
  reconciliation: 'backend/src/services/paymentAccountingReconciliation.service.js',
});
const tests = [
  'backend/tests/paymentDeliveryContract.audit.test.js',
  'backend/tests/checkout075q1.proof.contract.test.js',
  'backend/tests/checkout075r.finance.postgres.test.js',
  'backend/tests/paymentOutboxAtomicity.test.js',
  'backend/tests/orderDeliveryFinance.e2e.test.js',
];
function inspect(read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8'), exists = (relative) => fs.existsSync(path.join(ROOT, relative))) {
  const findings = [];
  for (const [stage, relative] of Object.entries(paths)) {
    findings.push({ stage, file: relative, present: exists(relative) });
  }
  const checks = [
    ['checkout', /async function createOrder\(/],
    ['payment', /recomputeOrderPayment/],
    ['dispatch', /Rider/],
    ['claim', /claimOrderForRider/],
    ['delivery', /delivery_proof_url/],
    ['finance', /emitDeliveryCompleted/],
  ];
  for (const [stage, pattern] of checks) {
    const file = paths[stage];
    let found = false;
    if (exists(file)) { try { found = pattern.test(read(file)); } catch { found = false; } }
    findings.push({ stage: `${stage}:source-marker`, file, present: found });
  }
  for (const file of tests) findings.push({ stage: 'existing-test', file, present: exists(file) });
  return findings;
}
if (require.main === module) {
  const findings = inspect();
  for (const f of findings) console.log(`${f.present ? 'PASS' : 'MISSING'} ${f.stage}: ${f.file}`);
  console.log('\nNOT CERTIFIED: payment-provider settlement, vendor acceptance, real-time dispatch, DB migrations, and financial reconciliation require sandbox/isolated DB tests.');
  if (findings.some(f => !f.present)) process.exitCode = 1;
  else console.log('Offline lifecycle inventory passed. No DB, provider or file writes performed.');
}
module.exports = { inspect, paths, tests };
