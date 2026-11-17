const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
test('07.5O: dispatch requires a resolved city and matches slug or name', () => {
  const s = fs.readFileSync(path.join(root, 'src/services/orderDispatch.service.js'), 'utf8');
  assert.match(s, /if \(!city \|\| !City\) return null/);
  assert.match(s, /if \(!cityRow\) return null/);
  assert.match(s, /slug: String\(city\)/);
  assert.match(s, /city_id: cityRow\.id/);
});
test('07.5O: cancellation emits realtime only after transactional service returns', () => {
  const s = fs.readFileSync(path.join(root, 'src/controllers/order.controller.js'), 'utf8');
  const start = s.indexOf('async function cancel(req, res)');
  const end = s.indexOf('// GET /api/orders/vendor', start);
  const block = s.slice(start,end);
  assert.ok(block.indexOf('await cancelOrder(') < block.indexOf('publishOrderStatusChanged('));
  assert.match(block, /realtime_emit_cancel_failed_error/);
});
