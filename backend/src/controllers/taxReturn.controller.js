const {
  TaxReturn,
  TaxFilingPeriod,
} = require('../models/associations');
const {
  prepareTaxReturn,
  approveTaxReturn,
  submitTaxReturn,
} = require('../services/taxReturn.service');

async function listPeriods(req, res, next) {
  try {
    const periods = await TaxFilingPeriod.findAll({
      order: [['start_date', 'DESC']],
    });
    return res.status(200).json({ periods });
  } catch (error) {
    return next(error);
  }
}

async function listReturns(req, res, next) {
  try {
    const returns = await TaxReturn.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ returns });
  } catch (error) {
    return next(error);
  }
}

async function prepare(req, res, next) {
  try {
    const taxReturn = await prepareTaxReturn({
      filingPeriodId: req.body.filingPeriodId,
      registrationId: req.body.registrationId,
      actorId: req.user.id,
      adjustmentsMinor: req.body.adjustmentsMinor,
    });
    return res.status(201).json({ taxReturn });
  } catch (error) {
    return next(error);
  }
}

async function approve(req, res, next) {
  try {
    const taxReturn = await approveTaxReturn({
      taxReturnId: req.params.taxReturnId,
      actorId: req.user.id,
    });
    return res.status(200).json({ taxReturn });
  } catch (error) {
    return next(error);
  }
}

async function submit(req, res, next) {
  try {
    const taxReturn = await submitTaxReturn({
      taxReturnId: req.params.taxReturnId,
      actorId: req.user.id,
      submissionReference: req.body.submissionReference,
    });
    return res.status(200).json({ taxReturn });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listPeriods,
  listReturns,
  prepare,
  approve,
  submit,
};
