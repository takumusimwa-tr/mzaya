function providerError(message, code = 'SMS_PROVIDER_ERROR') {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function sendSms({ to, message, metadata = {} }) {
  if (!to) throw providerError('SMS recipient is required', 'SMS_RECIPIENT_REQUIRED');

  if (process.env.NOTIFICATION_SMS_MODE !== 'enabled') {
    return {
      skipped: true,
      provider: 'disabled',
      providerMessageId: null,
      metadata,
    };
  }

  throw providerError(
    'SMS provider adapter is not configured',
    'SMS_PROVIDER_NOT_CONFIGURED'
  );
}

module.exports = { sendSms };
