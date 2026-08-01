/**
 * Provider-neutral payout contract.
 * Connect Paynow, bank transfer, mobile money or another approved provider
 * without changing settlement orchestration.
 */
async function submitPayout({
  settlement: _settlement,
  profile: _profile,
}) {
  if (process.env.SETTLEMENT_PAYOUT_MODE !== 'enabled') {
    return {
      skipped: true,
      provider: 'disabled',
      payoutReference: null,
      providerPayload: {},
    };
  }

  const error = new Error('Settlement payout provider is not configured');
  error.status = 503;
  error.code = 'PAYOUT_PROVIDER_NOT_CONFIGURED';
  throw error;
}

module.exports = {
  submitPayout,
};
