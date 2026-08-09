const {
  TreasuryTransfer,
  BankMovement,
  TreasuryFinanceReconciliationResult,
} = require('../models/associations');
const {
  createTreasuryTransfer,
  approveTreasuryTransfer,
  confirmTreasuryTransferCompleted,
} = require('../services/treasuryTransfer.service');
const {
  reconcileTreasuryTransfer,
} = require('../services/treasuryReconciliation.service');

async function listTransfers(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;

    const transfers = await TreasuryTransfer.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ transfers });
  } catch (error) { return next(error); }
}

async function createTransfer(req, res, next) {
  try {
    const transfer = await createTreasuryTransfer({
      ...req.body,
      initiatedBy: req.user.id,
    });
    return res.status(201).json({ transfer });
  } catch (error) { return next(error); }
}

async function approveTransfer(req, res, next) {
  try {
    const transfer = await approveTreasuryTransfer({
      transferId: req.params.transferId,
      approvedBy: req.user.id,
    });
    return res.status(200).json({ transfer });
  } catch (error) { return next(error); }
}

async function completeTransfer(req, res, next) {
  try {
    const transfer = await confirmTreasuryTransferCompleted({
      transferId: req.params.transferId,
      providerReference: req.body.providerReference,
    });
    return res.status(200).json({ transfer });
  } catch (error) { return next(error); }
}

async function listBankMovements(req, res, next) {
  try {
    const movements = await BankMovement.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ movements });
  } catch (error) { return next(error); }
}

async function listReconciliation(req, res, next) {
  try {
    const results = await TreasuryFinanceReconciliationResult.findAll({
      order: [['evaluated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ results });
  } catch (error) { return next(error); }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileTreasuryTransfer(req.params.transferId);
    return res.status(200).json({ result });
  } catch (error) { return next(error); }
}

module.exports = {
  listTransfers,
  createTransfer,
  approveTransfer,
  completeTransfer,
  listBankMovements,
  listReconciliation,
  reconcile,
};
