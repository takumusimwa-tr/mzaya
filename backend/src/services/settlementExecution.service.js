const { sequelize } = require('../config/db');
const {
  SettlementBatch,
  Settlement,
  SettlementProfile,
} = require('../models/associations');
const {
  postSettlementLedger,
} = require('./settlementLedger.service');
const {
  submitPayout,
} = require('./payoutGateway.service');
const {
  recordSettlementAudit,
} = require('./settlementAudit.service');
const {
  nextSettlementDate,
} = require('./settlementSchedule.service');
const {
  settlementEvents,
  SETTLEMENT_EVENT,
} = require('../events/settlement.events');

function serviceError(message, status = 400, code = 'SETTLEMENT_EXECUTION_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function submitSettlement({
  settlementId,
  actorId,
}) {
  const settlement = await Settlement.findByPk(settlementId, {
    include: [{
      model: SettlementProfile,
      as: 'profile',
      required: true,
    }],
  });

  if (!settlement) {
    throw serviceError('Settlement not found', 404, 'SETTLEMENT_NOT_FOUND');
  }

  if (settlement.status !== 'pending') {
    throw serviceError(
      'Settlement is not ready for submission',
      409,
      'INVALID_SETTLEMENT_STATUS'
    );
  }

  await postSettlementLedger({
    settlement,
    actorId,
  });

  await settlement.update({
    status: 'submitted',
    submitted_at: new Date(),
  });

  const result = await submitPayout({
    settlement,
    profile: settlement.profile,
  });

  if (result.skipped) {
    await settlement.update({
      provider: result.provider,
      provider_payload: result.providerPayload,
    });

    return settlement;
  }

  await settlement.update({
    status: 'paid',
    provider: result.provider,
    payout_reference: result.payoutReference,
    provider_payload: result.providerPayload,
    paid_at: new Date(),
  });

  await settlement.profile.update({
    last_settled_at: new Date(),
    next_settlement_at: nextSettlementDate({
      schedule: settlement.profile.schedule,
    }),
  });

  await recordSettlementAudit({
    settlementId: settlement.id,
    actorId,
    action: 'settlement_paid',
    newValue: {
      provider: result.provider,
      payoutReference: result.payoutReference,
    },
  });

  settlementEvents.emit(SETTLEMENT_EVENT.SETTLEMENT_PAID, {
    settlementId: settlement.id,
    ownerType: settlement.owner_type,
    ownerId: settlement.owner_id,
  });

  return settlement;
}

async function submitApprovedBatch({
  batchId,
  actorId,
}) {
  const batch = await SettlementBatch.findByPk(batchId);

  if (!batch) {
    throw serviceError('Settlement batch not found', 404, 'BATCH_NOT_FOUND');
  }

  if (batch.status !== 'approved') {
    throw serviceError(
      'Batch must be approved before submission',
      409,
      'INVALID_BATCH_STATUS'
    );
  }

  await batch.update({
    status: 'processing',
    submitted_at: new Date(),
  });

  const settlements = await Settlement.findAll({
    where: {
      batch_id: batchId,
      status: 'pending',
    },
  });

  let failed = false;

  for (const settlement of settlements) {
    try {
      await submitSettlement({
        settlementId: settlement.id,
        actorId,
      });
    } catch (error) {
      failed = true;
      await settlement.update({
        status: 'failed',
        failure_reason: String(error.message || error).slice(0, 500),
        failed_at: new Date(),
      });

      settlementEvents.emit(SETTLEMENT_EVENT.SETTLEMENT_FAILED, {
        settlementId: settlement.id,
        error: error.message,
      });
    }
  }

  await batch.update({
    status: failed ? 'partially_failed' : 'completed',
    completed_at: failed ? null : new Date(),
    failed_at: failed ? new Date() : null,
  });

  return batch;
}

module.exports = {
  submitSettlement,
  submitApprovedBatch,
};
