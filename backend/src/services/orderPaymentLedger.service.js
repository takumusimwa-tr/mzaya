const { sequelize } = require('../config/db');
const {
  resolvePaymentAccount,
} = require('./paymentAccount.service');
const {
  postLedgerTransaction,
} = require('./ledger.service');

/**
 * Posts the accounting split after a customer payment has been confirmed.
 * This service does not call Paynow. It records the financial result of the
 * provider-confirmed payment.
 */
async function recordOrderPayment({
  order,
  payment,
  customerAmountMinor,
  vendorAmountMinor,
  mzayaAmountMinor,
  platformFeeMinor,
  createdBy = null,
}) {
  const totalAllocation =
    Number(vendorAmountMinor) +
    Number(mzayaAmountMinor) +
    Number(platformFeeMinor);

  if (Number(customerAmountMinor) !== totalAllocation) {
    const error = new Error('Order payment allocation does not equal payment total');
    error.status = 422;
    error.code = 'PAYMENT_ALLOCATION_MISMATCH';
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    const currency = payment.currency || order.currency || 'USD';

    const [
      providerClearing,
      vendorPayable,
      mzayaPayable,
      platformRevenue,
    ] = await Promise.all([
      resolvePaymentAccount({
        ownerType: 'platform',
        accountType: 'provider_clearing',
        currency,
        transaction,
      }),
      resolvePaymentAccount({
        ownerType: 'vendor',
        ownerId: order.vendor_id,
        accountType: 'payable',
        currency,
        transaction,
      }),
      resolvePaymentAccount({
        ownerType: 'rider',
        ownerId: order.rider_id || null,
        accountType: 'earnings_payable',
        currency,
        transaction,
      }),
      resolvePaymentAccount({
        ownerType: 'platform',
        accountType: 'service_fee_revenue',
        currency,
        transaction,
      }),
    ]);

    return postLedgerTransaction({
      reference: `PAY-${payment.id}`,
      transactionType: 'order_payment',
      currency,
      orderId: order.id,
      paymentId: payment.id,
      description: `Payment received for order ${order.id}`,
      createdBy,
      externalTransaction: transaction,
      metadata: {
        providerReference: payment.provider_reference || payment.reference,
      },
      entries: [
        {
          accountId: providerClearing.id,
          direction: 'debit',
          amountMinor: customerAmountMinor,
        },
        {
          accountId: vendorPayable.id,
          direction: 'credit',
          amountMinor: vendorAmountMinor,
        },
        {
          accountId: mzayaPayable.id,
          direction: 'credit',
          amountMinor: mzayaAmountMinor,
        },
        {
          accountId: platformRevenue.id,
          direction: 'credit',
          amountMinor: platformFeeMinor,
        },
      ],
    });
  });
}

module.exports = {
  recordOrderPayment,
};
