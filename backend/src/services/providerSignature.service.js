const crypto = require('crypto');

function timingSafeEqualHex(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'hex');
  const rightBuffer = Buffer.from(String(right || ''), 'hex');

  if (!leftBuffer.length || leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function hmacSha256(secret, rawBody) {
  return crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
}

/**
 * Provider adapter boundary.
 * Paynow verification rules should be implemented here using official provider
 * documentation before production enablement.
 */
function verifyProviderSignature({
  provider,
  rawBody,
  headers,
}) {
  const normalizedProvider = String(provider).toLowerCase();

  if (normalizedProvider === 'generic_hmac') {
    const signature = headers['x-webhook-signature'];
    const secret = process.env.GENERIC_WEBHOOK_SECRET;

    if (!secret) return false;

    return timingSafeEqualHex(
      signature,
      hmacSha256(secret, rawBody)
    );
  }

  if (normalizedProvider === 'paynow') {
    /*
     * Production implementation must follow Paynow's documented hash and
     * status-update verification rules using the integration key.
     */
    return process.env.PAYNOW_WEBHOOK_VERIFICATION_MODE === 'test';
  }

  return false;
}

module.exports = {
  timingSafeEqualHex,
  hmacSha256,
  verifyProviderSignature,
};
