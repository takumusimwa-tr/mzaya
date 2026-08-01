function providerError(message, code = 'EMAIL_PROVIDER_ERROR') {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function sendEmail({ to, subject: _subject, text: _text, html: _html, metadata = {} }) {
  if (!to) throw providerError('Email recipient is required', 'EMAIL_RECIPIENT_REQUIRED');

  if (process.env.NOTIFICATION_EMAIL_MODE !== 'enabled') {
    return {
      skipped: true,
      provider: 'disabled',
      providerMessageId: null,
      metadata,
    };
  }

  throw providerError(
    'Email provider adapter is not configured',
    'EMAIL_PROVIDER_NOT_CONFIGURED'
  );
}

module.exports = { sendEmail };
