const {
  VendorSettlement,
  VendorSettlementFinanceReconciliationResult,
} = require('../models/associations');
const {
  createVendorSettlement,
  approveVendorSettlement,
  markVendorSettlementPaid,
} = require('../services/vendorSettlement.service');
const {
  reconcileVendorSettlement,
} = require('../services/vendorSettlementReconciliation.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.vendorId) where.vendor_id = req.query.vendorId;

    const settlements = await VendorSettlement.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ settlements });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const settlement = await createVendorSettlement(req.body);
    return res.status(201).json({ settlement });
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const settlement = await approveVendorSettlement({
      settlementId: req.params.settlementId,
      approvedBy: req.user.id,
    });

    return res.status(200).json({ settlement });
  } catch (error) {
    return next(error);
  }
}

async function markPaid(req, res, next) {
  try {
    const settlement = await markVendorSettlementPaid({
      settlementId: req.params.settlementId,
      amountPaidMinor: req.body.amountPaidMinor,
      provider: req.body.provider,
      providerReference: req.body.providerReference,
      paidBy: req.user.id,
    });

    return res.status(200).json({ settlement });
  } catch (error) {
    return next(error);
  }
}

async function reconciliationList(req, res, next) {
  try {
    const results =
      await VendorSettlementFinanceReconciliationResult.findAll({
        order: [['evaluated_at', 'DESC']],
        limit: Math.min(Number(req.query.limit) || 100, 300),
      });

    return res.status(200).json({ results });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileVendorSettlement(
      req.params.settlementId
    );

    return res.status(200).json({ result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  approve,
  markPaid,
  reconciliationList,
  reconcile,
};
