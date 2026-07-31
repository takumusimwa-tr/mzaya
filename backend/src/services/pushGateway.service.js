function disabledResult() {
  return {
    skipped: true,
    provider: 'disabled',
    providerMessageId: null,
  };
}

async function sendPushMessage({
  token,
  title,
  body,
  data,
  badge,
  collapseKey,
}) {
  if (!token) {
    const error = new Error('Push token is required');
    error.code = 'PUSH_TOKEN_REQUIRED';
    throw error;
  }

  if (process.env.CHAT_PUSH_MODE !== 'enabled') {
    return disabledResult();
  }

  /*
   * Provider integration point.
   * Add Firebase Admin or another approved provider here.
   * The surrounding service contract does not need to change.
   */
  const error = new Error('Chat push provider is not configured');
  error.code = 'CHAT_PUSH_PROVIDER_NOT_CONFIGURED';
  throw error;
}

module.exports = {
  sendPushMessage,
};
