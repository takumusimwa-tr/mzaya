/**
 * Integrate this after the existing payment provider has confirmed a payment.
 *
 * Keep provider verification in the existing payment service. The ledger only
 * records the confirmed financial result.
 */

const {
  recordOrderPayment,
} = require('../services/orderPaymentLedger.service');

async function postConfirmedPaymentToLedger({
  order,
  payment,
  feeBreakdown,
  logger,
}) {
  try {
    return await recordOrderPayment({
      order,
      payment,
      customerAmountMinor: feeBreakdown.totalMinor,
      vendorAmountMinor: feeBreakdown.vendorMinor,
      mzayaAmountMinor: feeBreakdown.mzayaMinor,
      platformFeeMinor: feeBreakdown.platformFeeMinor,
    });
  } catch (error) {
    logger?.error?.('payment_ledger_post_failed', {
      orderId: order.id,
      paymentId: payment.id,
      error: error.message,
    });
    throw error;
  }
}

module.exports = {
  postConfirmedPaymentToLedger,
};
