const {
  Payment,
  Refund,
  Chargeback,
} = require('../models/associations');
const {
  ingestReconciliationRecord,
} = require('./reconciliation.service');
const {
  completeRefund,
} = require('./refund.service');
const {
  registerChargeback,
} = require('./chargeback.service');

function eventError(message, code = 'UNSUPPORTED_PROVIDER_EVENT') {
  const error = new Error(message);
  error.code = code;
  error.status = 422;
  return error;
}

async function handlePaymentStatus(payload) {
  const payment = await Payment.findOne({
    where: {
      provider_reference: payload.reference,
    },
  });

  if (!payment) {
    throw eventError(
      'Payment reference could not be matched',
      'PAYMENT_REFERENCE_NOT_FOUND'
    );
  }

  await payment.update({
    status: payload.status,
    provider_payload: {
      ...(payment.provider_payload || {}),
      webhook: payload,
    },
  });

  await ingestReconciliationRecord({
    provider: payload.provider || 'paynow',
    providerReference: payload.reference,
    internalReference: `PAY-${payment.id}`,
    recordType: 'payment',
    currency: payment.currency,
    providerAmountMinor: Number(payload.amountMinor),
    providerPayload: payload,
  });

  return {
    resourceType: 'payment',
    resourceId: payment.id,
  };
}

async function handleRefundStatus(payload) {
  const refund = await Refund.findOne({
    where: {
      provider_refund_reference: payload.reference,
    },
  });

  if (!refund) {
    throw eventError(
      'Refund reference could not be matched',
      'REFUND_REFERENCE_NOT_FOUND'
    );
  }

  if (payload.status === 'processed' && refund.status !== 'processed') {
    await completeRefund({
      refundId: refund.id,
      provider: payload.provider || 'paynow',
      providerReference: payload.reference,
      providerPayload: payload,
      allocations: payload.allocations,
      actorId: null,
    });
  }

  return {
    resourceType: 'refund',
    resourceId: refund.id,
  };
}

async function handleChargeback(payload) {
  const chargeback = await registerChargeback({
    paymentId: payload.paymentId,
    orderId: payload.orderId || null,
    provider: payload.provider,
    providerCaseReference: payload.caseReference,
    amountMinor: Number(payload.amountMinor),
    currency: payload.currency,
    reasonCode: payload.reasonCode || null,
    responseDueAt: payload.responseDueAt || null,
    providerPayload: payload,
  });

  return {
    resourceType: 'chargeback',
    resourceId: chargeback.id,
  };
}

async function routeProviderWebhook(event) {
  const payload = event.payload || {};
  const type = String(event.event_type).toLowerCase();

  if ([
    'paid',
    'captured',
    'payment.updated',
    'payment_status',
  ].includes(type)) {
    return handlePaymentStatus(payload);
  }

  if ([
    'refund.processed',
    'refund_status',
  ].includes(type)) {
    return handleRefundStatus(payload);
  }

  if ([
    'chargeback.created',
    'chargeback',
  ].includes(type)) {
    return handleChargeback(payload);
  }

  throw eventError(`Unsupported provider event type: ${event.event_type}`);
}

module.exports = {
  handlePaymentStatus,
  handleRefundStatus,
  handleChargeback,
  routeProviderWebhook,
};
