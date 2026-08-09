const {
  resolvePaymentAccount,
} = require('./paymentAccount.service');

const SYSTEM_ACCOUNT_CODES = new Set([
  'PAYMENT_PROCESSOR_RECEIVABLE',
  'CUSTOMER_FUNDS_CLEARING',
  'PAYMENT_GATEWAY_FEES',
  'PLATFORM_REVENUE',
  'DELIVERY_REVENUE',
  'PROCUREMENT_REVENUE',
  'PROCUREMENT_COST_OR_CLEARING',
  'PROCUREMENT_AUTHORIZATION_CLEARING',
  'ORDER_CANCELLATION_CLEARING',
  'CHARGEBACK_EXPENSE_OR_CLEARING',
  'CASH_AT_BANK',
  'TAX_EXPENSE_OR_CLEARING',
  'TAX_PAYABLE',
  'TREASURY_SOURCE_ACCOUNT',
  'TREASURY_DESTINATION_OR_CLEARING',
  'TREASURY_AUTHORIZATION_CLEARING',
  'DELIVERY_COST_OR_CLEARING',
]);

function ownerForAccountCode(accountCode, payload = {}) {
  if (accountCode === 'VENDOR_PAYABLE') {
    return {
      ownerType: 'vendor',
      ownerId: payload.vendorId || null,
    };
  }

  if (accountCode === 'MZAYA_PAYABLE') {
    return {
      ownerType: 'mzaya',
      ownerId: payload.mzayaId || null,
    };
  }

  if (accountCode === 'CUSTOMER_REFUND_PAYABLE') {
    return {
      ownerType: 'customer',
      ownerId: payload.customerId || null,
    };
  }

  return {
    ownerType: 'platform',
    ownerId: null,
  };
}

async function resolveFinanceAccount({
  accountCode,
  currency,
  payload = {},
  transaction,
}) {
  if (!accountCode) {
    const error = new Error('Finance journal line is missing an account code');
    error.status = 422;
    error.code = 'FINANCE_ACCOUNT_CODE_REQUIRED';
    throw error;
  }

  const { ownerType, ownerId } =
    ownerForAccountCode(accountCode, payload);

  if (
    !SYSTEM_ACCOUNT_CODES.has(accountCode) &&
    ownerType === 'platform' &&
    ![
      'VENDOR_PAYABLE',
      'MZAYA_PAYABLE',
      'CUSTOMER_REFUND_PAYABLE',
    ].includes(accountCode)
  ) {
    const error = new Error(
      `Unmapped finance account code: ${accountCode}`
    );
    error.status = 422;
    error.code = 'FINANCE_ACCOUNT_CODE_UNMAPPED';
    throw error;
  }

  return resolvePaymentAccount({
    ownerType,
    ownerId,
    accountType: accountCode.toLowerCase(),
    currency,
    transaction,
  });
}

module.exports = {
  SYSTEM_ACCOUNT_CODES,
  ownerForAccountCode,
  resolveFinanceAccount,
};
