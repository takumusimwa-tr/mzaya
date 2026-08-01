const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  FinancialControlPolicy,
  FinancialApprovalRequest,
  FinancialApprovalDecision,
  FinancialControlException,
} = require('../models/associations');

function error(message, status, code) {
  const value = new Error(message);
  value.status = status;
  value.code = code;
  return value;
}

async function resolvePolicy({ resourceType, action, amountMinor, currency }) {
  const policies = await FinancialControlPolicy.findAll({
    where: {
      resource_type: resourceType,
      action,
      status: 'active',
      [Op.or]: [{ currency: null }, { currency: currency || null }],
    },
    order: [['threshold_minor', 'DESC NULLS LAST']],
  });

  return policies.find((item) => (
    item.threshold_minor == null || Number(amountMinor || 0) >= Number(item.threshold_minor)
  )) || null;
}

async function createApprovalRequest(payload) {
  const policy = await resolvePolicy(payload);
  if (!policy) return { approvalRequired: false, request: null };

  const request = await FinancialApprovalRequest.create({
    policy_id: policy.id,
    resource_type: payload.resourceType,
    resource_id: payload.resourceId || null,
    action: payload.action,
    requested_by: payload.requestedBy,
    amount_minor: payload.amountMinor || null,
    currency: payload.currency || null,
    request_payload: payload.requestPayload || {},
    required_approvals: policy.required_approvals,
    expires_at: payload.expiresAt || null,
  });

  return { approvalRequired: true, request };
}

async function decideApprovalRequest({ approvalRequestId, decidedBy, decision, notes, actorRoles = [] }) {
  return sequelize.transaction(async (transaction) => {
    const request = await FinancialApprovalRequest.findByPk(approvalRequestId, {
      include: [{ model: FinancialControlPolicy, as: 'policy', required: true }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!request) throw error('Approval request not found', 404, 'APPROVAL_NOT_FOUND');
    if (request.status !== 'pending') throw error('Approval is not pending', 409, 'APPROVAL_NOT_PENDING');
    if (request.policy.require_distinct_creator && String(request.requested_by) === String(decidedBy)) {
      throw error('Requester cannot approve this action', 403, 'MAKER_CHECKER_VIOLATION');
    }

    const roles = Array.isArray(request.policy.approver_roles) ? request.policy.approver_roles : [];
    if (roles.length && !actorRoles.some((role) => roles.includes(role))) {
      throw error('Approver role required', 403, 'APPROVER_ROLE_REQUIRED');
    }

    await FinancialApprovalDecision.create({
      approval_request_id: request.id,
      decided_by: decidedBy,
      decision,
      notes: notes || null,
    }, { transaction });

    if (decision === 'reject') {
      await request.update({
        status: 'rejected',
        rejection_count: Number(request.rejection_count) + 1,
        rejected_at: new Date(),
      }, { transaction });
    } else {
      const count = Number(request.approval_count) + 1;
      const complete = count >= Number(request.required_approvals);
      await request.update({
        approval_count: count,
        status: complete ? 'approved' : 'pending',
        approved_at: complete ? new Date() : null,
      }, { transaction });
    }

    return request;
  });
}

async function detectExpiredApprovals() {
  const approvals = await FinancialApprovalRequest.findAll({
    where: { status: 'pending', expires_at: { [Op.lt]: new Date() } },
  });

  for (const request of approvals) {
    await request.update({ status: 'expired' });
    await FinancialControlException.create({
      approval_request_id: request.id,
      exception_type: 'approval_expired',
      severity: 'medium',
      summary: `Approval request ${request.id} expired before completion`,
    });
  }

  return approvals.length;
}

module.exports = {
  resolvePolicy,
  createApprovalRequest,
  decideApprovalRequest,
  detectExpiredApprovals,
};
