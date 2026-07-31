const {
  PaymentAccount,
} = require('../models/associations');

/**
 * Finds or creates one deterministic ledger account. The uniqueness constraint
 * protects against duplicate accounts during concurrent requests.
 */
async function resolvePaymentAccount({
  ownerType,
  ownerId = null,
  accountType,
  currency,
  transaction,
}) {
  const normalizedCurrency = String(currency).toUpperCase();

  const [account] = await PaymentAccount.findOrCreate({
    where: {
      owner_type: ownerType,
      owner_id: ownerId,
      account_type: accountType,
      currency: normalizedCurrency,
    },
    defaults: {
      status: 'active',
    },
    transaction,
  });

  if (account.status !== 'active') {
    const error = new Error('Payment account is not active');
    error.status = 409;
    error.code = 'PAYMENT_ACCOUNT_INACTIVE';
    throw error;
  }

  return account;
}

module.exports = {
  resolvePaymentAccount,
};
