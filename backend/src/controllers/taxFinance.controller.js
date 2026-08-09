const {
  TaxTransaction,
  TaxLiability,
  TaxRemittance,
  TaxFinanceReconciliationResult,
} = require('../models/associations');
const {
  createTaxTransaction,
  reverseTaxTransaction,
} = require('../services/taxTransaction.service');
const {
  refreshTaxLiability,
} = require('../services/taxLiability.service');
const {
  createTaxRemittance,
  markTaxRemittancePaid,
} = require('../services/taxRemittance.service');
const {
  reconcileTaxTransaction,
} = require('../services/taxReconciliation.service');

async function listTransactions(req, res, next) {
  try {
    const transactions = await TaxTransaction.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ transactions });
  } catch (error) { return next(error); }
}

async function createTransaction(req, res, next) {
  try {
    const transaction = await createTaxTransaction(req.body);
    return res.status(201).json({ transaction });
  } catch (error) { return next(error); }
}

async function reverseTransaction(req, res, next) {
  try {
    const transaction = await reverseTaxTransaction({
      taxTransactionId: req.params.taxTransactionId,
      reason: req.body.reason,
    });
    return res.status(200).json({ transaction });
  } catch (error) { return next(error); }
}

async function listLiabilities(req, res, next) {
  try {
    const liabilities = await TaxLiability.findAll({
      order: [['period_key', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ liabilities });
  } catch (error) { return next(error); }
}

async function refreshLiability(req, res, next) {
  try {
    const liability = await refreshTaxLiability(req.body);
    return res.status(200).json({ liability });
  } catch (error) { return next(error); }
}

async function createRemittance(req, res, next) {
  try {
    const remittance = await createTaxRemittance({
      ...req.body,
      initiatedBy: req.user.id,
    });
    return res.status(201).json({ remittance });
  } catch (error) { return next(error); }
}

async function markRemittancePaid(req, res, next) {
  try {
    const remittance = await markTaxRemittancePaid({
      remittanceId: req.params.remittanceId,
      providerReference: req.body.providerReference,
    });
    return res.status(200).json({ remittance });
  } catch (error) { return next(error); }
}

async function listReconciliation(req, res, next) {
  try {
    const results = await TaxFinanceReconciliationResult.findAll({
      order: [['evaluated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ results });
  } catch (error) { return next(error); }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileTaxTransaction(
      req.params.taxTransactionId
    );
    return res.status(200).json({ result });
  } catch (error) { return next(error); }
}

module.exports = {
  listTransactions,
  createTransaction,
  reverseTransaction,
  listLiabilities,
  refreshLiability,
  createRemittance,
  markRemittancePaid,
  listReconciliation,
  reconcile,
};
