const {
  FinanceRemediationAction,
} = require('../models/associations');
const {
  createRemediationAction,
  completeRemediation,
  verifyRemediation,
} = require('../services/financeRemediation.service');

async function list(req, res, next) {
  try {
    const actions = await FinanceRemediationAction.findAll({
      order: [['due_date', 'ASC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ actions });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const action = await createRemediationAction(req.body);
    return res.status(201).json({ action });
  } catch (error) {
    return next(error);
  }
}

async function complete(req, res, next) {
  try {
    const action = await completeRemediation({
      remediationId: req.params.remediationId,
      completedBy: req.user.id,
      completionEvidence: req.body.completionEvidence,
    });
    return res.status(200).json({ action });
  } catch (error) {
    return next(error);
  }
}

async function verify(req, res, next) {
  try {
    const action = await verifyRemediation({
      remediationId: req.params.remediationId,
      verifiedBy: req.user.id,
      verificationNotes: req.body.verificationNotes,
    });
    return res.status(200).json({ action });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, complete, verify };
