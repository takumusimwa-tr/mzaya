const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  VendorSettlement,
  VendorSettlementItem,
} = require('../models/associations');
const {
  calculateVendorSettlement,
} = require('./vendorSettlementCalculator.service');
const {
  emitVendorSettlementDue,
  emitVendorSettlementPaid,
} = require('./vendorSettlementFinanceEvents.service');

async function createVendorSettlement({
  vendorId,
  periodFrom = null,
  periodTo = null,
  currency,
  items = [],
  dueAt = null,
}) {
  return sequelize.transaction(async (transaction) => {
    const totals = items.reduce((acc, item) => ({
      grossSalesMinor: acc.grossSalesMinor + Number(item.grossMinor || 0),
      refundsMinor: acc.refundsMinor + Number(item.refundMinor || 0),
      discountsMinor: acc.discountsMinor + Number(item.discountMinor || 0),
      commissionMinor: acc.commissionMinor + Number(item.commissionMinor || 0),
      platformFeeMinor: acc.platformFeeMinor + Number(item.platformFeeMinor || 0),
      taxWithheldMinor: acc.taxWithheldMinor + Number(item.taxWithheldMinor || 0),
      adjustmentsMinor: acc.adjustmentsMinor + Number(item.adjustmentMinor || 0),
    }), {
      grossSalesMinor: 0,
      refundsMinor: 0,
      discountsMinor: 0,
      commissionMinor: 0,
      platformFeeMinor: 0,
      taxWithheldMinor: 0,
      adjustmentsMinor: 0,
    });

    const calculated = calculateVendorSettlement(totals);

    const settlement = await VendorSettlement.create({
      vendor_id: vendorId,
      settlement_reference:
        `VST-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
      period_from: periodFrom,
      period_to: periodTo,
      currency: String(currency).toUpperCase(),
      gross_sales_minor: calculated.grossSalesMinor,
      refunds_minor: calculated.refundsMinor,
      discounts_minor: calculated.discountsMinor,
      commission_minor: calculated.commissionMinor,
      platform_fee_minor: calculated.platformFeeMinor,
      tax_withheld_minor: calculated.taxWithheldMinor,
      adjustments_minor: calculated.adjustmentsMinor,
      amount_due_minor: calculated.amountDueMinor,
      due_at: dueAt,
      status: 'draft',
    }, { transaction });

    if (items.length) {
      await VendorSettlementItem.bulkCreate(
        items.map((item) => ({
          settlement_id: settlement.id,
          order_id: item.orderId || null,
          order_type: item.orderType || null,
          gross_minor: Number(item.grossMinor || 0),
          refund_minor: Number(item.refundMinor || 0),
          commission_minor: Number(item.commissionMinor || 0),
          tax_withheld_minor: Number(item.taxWithheldMinor || 0),
          adjustment_minor: Number(item.adjustmentMinor || 0),
          net_due_minor:
            Number(item.grossMinor || 0) -
            Number(item.refundMinor || 0) -
            Number(item.commissionMinor || 0) -
            Number(item.taxWithheldMinor || 0) +
            Number(item.adjustmentMinor || 0),
        })),
        { transaction }
      );
    }

    return settlement;
  });
}

async function approveVendorSettlement({
  settlementId,
  approvedBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const settlement = await VendorSettlement.findByPk(settlementId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!settlement) {
      const error = new Error('Vendor settlement not found');
      error.status = 404;
      throw error;
    }

    if (settlement.status === 'approved') return settlement;
    if (settlement.status !== 'draft') {
      const error = new Error('Only draft settlements can be approved');
      error.status = 409;
      throw error;
    }

    await settlement.update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date(),
    }, { transaction });

    await emitVendorSettlementDue({
      settlement,
      transaction,
    });

    return settlement;
  });
}

async function markVendorSettlementPaid({
  settlementId,
  amountPaidMinor,
  provider = null,
  providerReference = null,
  paidBy,
}) {
  return sequelize.transaction(async (transaction) => {
    const settlement = await VendorSettlement.findByPk(settlementId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!settlement) {
      const error = new Error('Vendor settlement not found');
      error.status = 404;
      throw error;
    }

    if (!['approved', 'partially_paid'].includes(settlement.status)) {
      const error = new Error('Settlement is not ready for payment');
      error.status = 409;
      throw error;
    }

    const nextPaid =
      Number(settlement.amount_paid_minor || 0) +
      Number(amountPaidMinor);

    if (
      Number(amountPaidMinor) <= 0 ||
      nextPaid > Number(settlement.amount_due_minor)
    ) {
      const error = new Error('Settlement payment exceeds amount due');
      error.status = 409;
      error.code = 'VENDOR_SETTLEMENT_OVERPAYMENT';
      throw error;
    }

    const paidInFull =
      nextPaid === Number(settlement.amount_due_minor);

    await settlement.update({
      amount_paid_minor: nextPaid,
      status: paidInFull ? 'paid' : 'partially_paid',
      provider,
      provider_reference: providerReference,
      paid_by: paidBy,
      paid_at: paidInFull ? new Date() : null,
    }, { transaction });

    if (paidInFull) {
      await emitVendorSettlementPaid({
        settlement,
        transaction,
      });
    }

    return settlement;
  });
}

module.exports = {
  createVendorSettlement,
  approveVendorSettlement,
  markVendorSettlementPaid,
};
