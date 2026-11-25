'use strict';
function assertIntegrationUrl(raw) {
  let url;
  try { url = new URL(raw || ''); } catch { throw new Error('STOP: Missing or invalid integration database URL'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/mzaya_integration_test' || url.search || url.hash) {
    throw new Error('STOP: Only local mzaya_integration_test is permitted');
  }
  return url;
}
module.exports = { assertIntegrationUrl };
