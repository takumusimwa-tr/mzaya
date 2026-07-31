const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const {
  Dispute,
  DisputeEvidence,
  Order,
} = require('../models/associations');
const { appendDisputeTimeline } = require('./disputeTimeline.service');
const { disputeEvents, DISPUTE_EVENT } = require('../events/dispute.events');

function serviceError(message, status = 400, code = 'DISPUTE_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function createDispute({
  customerId,
  orderId,
  paymentId,
  category,
  subject,
  statement,
  priority = 'normal',
}) {
  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, { transaction });

    if (!order || String(order.customer_id) !== String(customerId)) {
      throw serviceError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const dispute = await Dispute.create({
      order_id: orderId,
      payment_id: paymentId,
      customer_id: customerId,
      vendor_id: order.vendor_id,
      category,
      priority,
      subject,
      customer_statement: statement,
      response_due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    }, { transaction });

    await appendDisputeTimeline({
      disputeId: dispute.id,
      actorId: customerId,
      eventType: 'dispute_created',
      body: statement,
      transaction,
    });

    transaction.afterCommit(() => {
      disputeEvents.emit(DISPUTE_EVENT.CREATED, {
        disputeId: dispute.id,
        customerId,
        vendorId: order.vendor_id,
      });
    });

    return dispute;
  });
}

async function addEvidence({
  disputeId,
  submittedBy,
  evidenceType,
  attachmentId,
  notes,
}) {
  const dispute = await Dispute.findByPk(disputeId);
  if (!dispute) throw serviceError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');

  const allowed = [dispute.customer_id, dispute.vendor_id, dispute.assigned_agent_id]
    .filter(Boolean)
    .map(String);

  if (!allowed.includes(String(submittedBy))) {
    throw serviceError('You cannot add evidence', 403, 'DISPUTE_FORBIDDEN');
  }

  const evidence = await DisputeEvidence.create({
    dispute_id: disputeId,
    submitted_by: submittedBy,
    evidence_type: evidenceType,
    attachment_id: attachmentId || null,
    notes: notes || null,
  });

  await appendDisputeTimeline({
    disputeId,
    actorId: submittedBy,
    eventType: 'evidence_added',
    metadata: { evidenceId: evidence.id, evidenceType },
  });

  return evidence;
}

async function updateDispute({
  disputeId,
  actorId,
  changes,
}) {
  const dispute = await Dispute.findByPk(disputeId);
  if (!dispute) throw serviceError('Dispute not found', 404, 'DISPUTE_NOT_FOUND');

  const previous = {
    status: dispute.status,
    priority: dispute.priority,
    resolution: dispute.resolution,
  };

  const updates = { ...changes };
  if (changes.status === 'resolved') {
    updates.resolved_at = new Date();
  }

  await dispute.update(updates);

  await appendDisputeTimeline({
    disputeId,
    actorId,
    eventType: 'dispute_updated',
    metadata: { previous, changes },
  });

  disputeEvents.emit(DISPUTE_EVENT.UPDATED, {
    disputeId,
    status: dispute.status,
    priority: dispute.priority,
  });

  return dispute;
}

async function listDisputes({
  status,
  priority,
  cursor,
  limit = 30,
}) {
  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (cursor) where.created_at = { [Op.lt]: new Date(cursor) };

  const disputes = await Dispute.findAll({
    where,
    order: [['created_at', 'ASC']],
    limit: Math.min(Number(limit) || 30, 100),
  });

  const last = disputes[disputes.length - 1];
  return {
    disputes,
    nextCursor: last ? last.created_at.toISOString() : null,
  };
}

module.exports = {
  createDispute,
  addEvidence,
  updateDispute,
  listDisputes,
};
