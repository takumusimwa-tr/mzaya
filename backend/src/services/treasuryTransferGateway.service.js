/**
 * Provider-neutral bank transfer adapter.
 * Production providers must implement idempotent submission using the transfer
 * reference as the external idempotency key.
 */
async function submitTreasuryTransfer({ transfer, fromAccount, toAccount }) {
  if (process.env.TREASURY_TRANSFER_MODE !== 'enabled') {
    return {
      skipped: true,
      provider: 'disabled',
      providerReference: null,
      payload: {},
    };
  }

  const error = new Error('Treasury transfer provider is not configured');
  error.status = 503;
  error.code = 'TREASURY_PROVIDER_NOT_CONFIGURED';
  throw error;
}

module.exports = { submitTreasuryTransfer };
