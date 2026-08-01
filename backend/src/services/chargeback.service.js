const {
  Chargeback,
} = require('../models/associations');
const { disputeEvents, DISPUTE_EVENT } = require('../events/dispute.events');

function determineChargebackStatus(outcome) {
  if (outcome === 'won') return 'won';
  if (outcome === 'lost') return 'lost';
  return 'under_review';
}

async function registerChargeback({
  paymentId,
  orderId,
  provider,
  providerCaseReference,
  amountMinor,
  currency,
  reasonCode,
  responseDueAt,
  providerPayload,
}) {
  const [chargeback, created] = await Chargeback.findOrCreate({
    where: {
      provider,
      provider_case_reference: providerCaseReference,
    },
    defaults: {
      payment_id: paymentId,
      order_id: orderId,
      amount_minor: amountMinor,
      currency,
      reason_code: reasonCode,
      response_due_at: responseDueAt,
      provider_payload: providerPayload || {},
    },
  });

  if (created) {
    disputeEvents.emit(DISPUTE_EVENT.CHARGEBACK_RECEIVED, {
      chargebackId: chargeback.id,
      paymentId,
      provider,
    });
  }

  return chargeback;
}

async function updateChargebackOutcome({
  chargebackId,
  outcome,
}) {
  const chargeback = await Chargeback.findByPk(chargebackId);
  if (!chargeback) {
    const error = new Error('Chargeback not found');
    error.status = 404;
    throw error;
  }

  const status = determineChargebackStatus(outcome);
  await chargeback.update({
    status,
    won_at: status === 'won' ? new Date() : chargeback.won_at,
    lost_at: status === 'lost' ? new Date() : chargeback.lost_at,
  });

  return chargeback;
}

async function listChargebackQueue({ status, limit = 50 }) {
  const where = {};
  if (status) where.status = status;

  return Chargeback.findAll({
    where,
    order: [['response_due_at', 'ASC NULLS LAST']],
    limit: Math.min(Number(limit) || 50, 200),
  });
}

module.exports = {
  determineChargebackStatus,
  registerChargeback,
  updateChargebackOutcome,
  listChargebackQueue,
};
