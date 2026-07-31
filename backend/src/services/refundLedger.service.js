const { sequelize } = require('../config/db');
const { resolvePaymentAccount } = require('./paymentAccount.service');
const { postLedgerTransaction } = require('./ledger.service');

/**
 * Refunds reverse payable and revenue allocations without editing the original
 * order-payment transaction.
 */
async function postRefundLedger({
  refund,
  order,
  allocations,
  createdBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const currency = refund.currency;

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

    const entries = [
      {
        accountId: providerClearing.id,
        direction: 'credit',
        amountMinor: refund.amount_minor,
      },
    ];

    if (allocations.vendorMinor > 0) {
      entries.push({
        accountId: vendorPayable.id,
        direction: 'debit',
        amountMinor: allocations.vendorMinor,
      });
    }

    if (allocations.mzayaMinor > 0) {
      entries.push({
        accountId: mzayaPayable.id,
        direction: 'debit',
        amountMinor: allocations.mzayaMinor,
      });
    }

    if (allocations.platformMinor > 0) {
      entries.push({
        accountId: platformRevenue.id,
        direction: 'debit',
        amountMinor: allocations.platformMinor,
      });
    }

    return postLedgerTransaction({
      reference: `REF-${refund.id}`,
      transactionType: 'refund',
      currency,
      orderId: refund.order_id,
      paymentId: refund.payment_id,
      description: `Refund for order ${refund.order_id}`,
      metadata: { refundId: refund.id },
      createdBy,
      entries,
      externalTransaction: transaction,
    });
  });
}

module.exports = { postRefundLedger };
