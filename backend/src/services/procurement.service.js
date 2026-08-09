const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  ProcurementRun,
  ProcurementItem,
} = require('../models/associations');
const {
  calculateProcurementTotals,
} = require('./procurementCalculator.service');
const {
  emitProcurementApproved,
  emitProcurementCompleted,
  emitProcurementRefundDue,
} = require('./procurementFinanceEvents.service');

async function createProcurement({
  customerId = null,
  vendorId = null,
  orderId = null,
  orderType = null,
  currency,
  amountAuthorizedMinor = 0,
  items = [],
  procurementFeeMinor = 0,
  deliveryFeeMinor = 0,
  reimbursementMinor = 0,
}) {
  return sequelize.transaction(async (transaction) => {
    const merchandiseCostMinor = items.reduce(
      (sum, item) => sum + Number(item.totalCostMinor || 0),
      0
    );
    const taxMinor = items.reduce(
      (sum, item) => sum + Number(item.taxMinor || 0),
      0
    );
    const discountMinor = items.reduce(
      (sum, item) => sum + Number(item.discountMinor || 0),
      0
    );

    const totals = calculateProcurementTotals({
      merchandiseCostMinor,
      procurementFeeMinor,
      deliveryFeeMinor,
      taxMinor,
      discountMinor,
      reimbursementMinor,
      amountAuthorizedMinor,
    });

    const procurement = await ProcurementRun.create({
      procurement_reference:
        `PRC-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      customer_id: customerId,
      vendor_id: vendorId,
      order_id: orderId,
      order_type: orderType,
      currency: String(currency).toUpperCase(),
      merchandise_cost_minor: totals.merchandiseCostMinor,
      procurement_fee_minor: totals.procurementFeeMinor,
      delivery_fee_minor: totals.deliveryFeeMinor,
      tax_minor: totals.taxMinor,
      discount_minor: totals.discountMinor,
      reimbursement_minor: totals.reimbursementMinor,
      amount_authorized_minor: totals.amountAuthorizedMinor,
      amount_spent_minor: totals.amountSpentMinor,
      amount_refundable_minor: totals.amountRefundableMinor,
      status: 'draft',
    }, { transaction });

    if (items.length) {
      await ProcurementItem.bulkCreate(
        items.map((item) => ({
          procurement_id: procurement.id,
          item_reference: item.itemReference || null,
          description: item.description || null,
          quantity: item.quantity || 1,
          unit_cost_minor: Number(item.unitCostMinor || 0),
          total_cost_minor: Number(item.totalCostMinor || 0),
          vendor_id: item.vendorId || vendorId || null,
          tax_minor: Number(item.taxMinor || 0),
          discount_minor: Number(item.discountMinor || 0),
          metadata: item.metadata || {},
        })),
        { transaction }
      );
    }

    return procurement;
  });
}

async function approveProcurement({
  procurementId,
  approvedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const procurement = await ProcurementRun.findByPk(procurementId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!procurement) {
      const error = new Error('Procurement run not found');
      error.status = 404;
      throw error;
    }

    if (procurement.status === 'approved') return procurement;
    if (procurement.status !== 'draft') {
      const error = new Error('Only draft procurement runs can be approved');
      error.status = 409;
      throw error;
    }

    await procurement.update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, { transaction });

    await emitProcurementApproved({
      procurement,
      transaction,
    });

    return procurement;
  });
}

async function completeProcurement({
  procurementId,
  completedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const procurement = await ProcurementRun.findByPk(procurementId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!procurement) {
      const error = new Error('Procurement run not found');
      error.status = 404;
      throw error;
    }

    if (procurement.status === 'completed') return procurement;
    if (procurement.status !== 'approved') {
      const error = new Error('Only approved procurement runs can be completed');
      error.status = 409;
      throw error;
    }

    await procurement.update({
      status: 'completed',
      completed_by: completedBy,
      completed_at: new Date(),
    }, { transaction });

    await emitProcurementCompleted({
      procurement,
      transaction,
    });

    if (Number(procurement.amount_refundable_minor || 0) > 0) {
      await emitProcurementRefundDue({
        procurement,
        transaction,
      });
    }

    return procurement;
  });
}

module.exports = {
  createProcurement,
  approveProcurement,
  completeProcurement,
};
