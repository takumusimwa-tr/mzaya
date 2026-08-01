function providerError(message, code = 'PUSH_PROVIDER_ERROR') {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function sendPush({ token, title: _title, body: _body, data = {} }) {
  if (!token) throw providerError('Push token is required', 'PUSH_TOKEN_REQUIRED');

  if (process.env.NOTIFICATION_PUSH_MODE !== 'enabled') {
    return {
      skipped: true,
      provider: 'disabled',
      providerMessageId: null,
      data,
    };
  }

  throw providerError(
    'Push provider adapter is not configured',
    'PUSH_PROVIDER_NOT_CONFIGURED'
  );
}

module.exports = { sendPush };
