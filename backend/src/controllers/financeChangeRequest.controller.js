const { FinanceChangeRequest, FinanceChangeApproval } = require('../models/associations');
const { createChangeRequest } = require('../services/financeChangeRequest.service');
const { decideChangeRequest } = require('../services/financeChangeApproval.service');

async function list(req, res, next) {
  try {
    const requests = await FinanceChangeRequest.findAll({
      where: req.query.status ? { status: req.query.status } : undefined,
      include: [{ model: FinanceChangeApproval, as: 'approvals', required: false }],
      order: [['requested_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ requests });
  } catch (error) { return next(error); }
}

async function create(req, res, next) {
  try {
    const request = await createChangeRequest({ ...req.body, requestedBy: req.user.id });
    return res.status(201).json({ request });
  } catch (error) { return next(error); }
}

async function decide(req, res, next) {
  try {
    const request = await decideChangeRequest({
      changeRequestId: req.params.changeRequestId,
      approverId: req.user.id,
      decision: req.body.decision,
      notes: req.body.notes,
    });
    return res.status(200).json({ request });
  } catch (error) { return next(error); }
}

module.exports = { list, create, decide };
