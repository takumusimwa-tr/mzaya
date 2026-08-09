const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  FinanceCutoverControl,
  FinanceCutoverDecision,
} = require('../models/associations');
const {
  evaluateCutoverReadiness,
} = require('./financeCutoverReadiness.service');
const {
  CUTOVER_MODE,
  CUTOVER_STATUS,
} = require('../config/financeCutover.constants');

async function requestCutover({
  controlId,
  requestedBy,
  reason,
}) {
  const control = await FinanceCutoverControl.findByPk(controlId);
  if (!control) {
    const error = new Error('Finance cutover control not found');
    error.status = 404;
    throw error;
  }

  const readiness = await evaluateCutoverReadiness(control);

  const decision = await FinanceCutoverDecision.create({
    decision_reference:
      `FCD-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    control_id: control.id,
    decision: 'activate',
    reason,
    evidence_snapshot: {
      ready: readiness.ready,
      checks: readiness.checks.map((item) => item.toJSON()),
    },
    requested_by: requestedBy,
    status: 'pending_approval',
  });

  await control.update({
    status: readiness.ready
      ? CUTOVER_STATUS.READY
      : CUTOVER_STATUS.VALIDATING,
  });

  return {
    decision,
    readiness,
  };
}

async function approveCutover({
  decisionId,
  approvedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const decision = await FinanceCutoverDecision.findByPk(decisionId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!decision) {
      const error = new Error('Finance cutover decision not found');
      error.status = 404;
      throw error;
    }

    if (String(decision.requested_by) === String(approvedBy)) {
      const error = new Error('Cutover requester cannot approve their own decision');
      error.status = 403;
      error.code = 'MAKER_CHECKER_VIOLATION';
      throw error;
    }

    const control = await FinanceCutoverControl.findByPk(decision.control_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    const readiness = await evaluateCutoverReadiness(control);
    if (!readiness.ready) {
      const error = new Error('Finance cutover readiness checks are not passing');
      error.status = 409;
      error.code = 'FINANCE_CUTOVER_NOT_READY';
      throw error;
    }

    await decision.update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, { transaction });

    await control.update({
      current_mode: CUTOVER_MODE.BLOCK_LEGACY,
      status: CUTOVER_STATUS.ACTIVE,
      activated_by: approvedBy,
      activated_at: new Date(),
      effective_at: new Date(),
    }, { transaction });

    return {
      control,
      decision,
    };
  });
}

async function rollbackCutover({
  controlId,
  rolledBackBy,
  reason,
}) {
  const control = await FinanceCutoverControl.findByPk(controlId);
  if (!control) {
    const error = new Error('Finance cutover control not found');
    error.status = 404;
    throw error;
  }

  await control.update({
    current_mode: CUTOVER_MODE.SHADOW,
    status: CUTOVER_STATUS.ROLLED_BACK,
    rolled_back_by: rolledBackBy,
    rolled_back_at: new Date(),
    rollback_reason: reason,
  });

  return control;
}

module.exports = {
  requestCutover,
  approveCutover,
  rollbackCutover,
};
