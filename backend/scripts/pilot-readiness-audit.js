// Batch 07.6B: read-only, offline structural pilot-readiness audit.
// Never reads secrets, connects to databases, or executes migrations.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const required = [
  '.github/workflows/ci.yml',
  'backend/scripts/migrate.js',
  'backend/scripts/release-gate.js',
  'backend/FINANCE_RELEASE_RUNBOOK.md',
  'backend/src/config/validateEnv.js',
  'backend/src/controllers/payment.controller.js',
  'backend/src/services/order.service.js',
  'backend/src/services/orderClaim.service.js',
  'backend/src/services/orderDispatch.service.js',
  'frontend/src/pages/order/CheckoutPage.jsx',
  'frontend/src/pages/tracking/TrackingPage.jsx',
  'frontend/src/pages/vendor/VendorOrders.jsx',
  'frontend/src/pages/rider/RiderDelivery.jsx',
  'frontend/src/assets/brand/tokens/mzaya-colors.css',
  'frontend/scripts/check-brand-assets.mjs',
];
const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
for (const relative of required) {
  console.log(`${missing.includes(relative) ? 'MISSING' : 'PRESENT'} ${relative}`);
}
console.log('\nNOTE: File presence is not functional verification.');
console.log('Manual gates: isolated PostgreSQL migrations; live payment sandbox; end-to-end role flows; production secrets/config; deployment rollback.');
if (missing.length) {
  console.error(`Pilot structural audit failed: ${missing.length} expected path(s) missing.`);
  process.exitCode = 1;
} else {
  console.log('Pilot structural audit passed (structure only).');
}
