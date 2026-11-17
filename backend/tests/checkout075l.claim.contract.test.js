const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('07.5L: manual claim uses transactional rider lock and active-order check', () => {
  const service = fs.readFileSync(path.join(__dirname, '../src/services/orderClaim.service.js'), 'utf8');
  const controller = fs.readFileSync(path.join(__dirname, '../src/controllers/order.controller.js'), 'utf8');
  assert.match(service, /sequelize\.transaction\(/);
  assert.match(service, /lock:\s*transaction\.LOCK\.UPDATE/);
  assert.match(service, /Mzaya already has an active order/);
  assert.match(service, /rider_id:\s*null,\s*status:\s*'pending'/);
  assert.match(controller, /claimOrderForRider\(req\.params\.id, req\.user\.id\)/);
});
