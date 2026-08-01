const {
  FinancialControlPolicy,
  FinancialApprovalRequest,
  FinancialControlException,
} = require('../models/associations');
const {
  createApprovalRequest,
  decideApprovalRequest,
} = require('../services/financialApproval.service');

async function policies(req, res, next) {
  try { return res.json({ policies: await FinancialControlPolicy.findAll() }); }
  catch (error) { return next(error); }
}

async function approvals(req, res, next) {
  try {
    const where = req.query.status ? { status: req.query.status } : {};
    return res.json({ approvals: await FinancialApprovalRequest.findAll({ where, order: [['created_at', 'ASC']] }) });
  } catch (error) { return next(error); }
}

async function request(req, res, next) {
  try {
    const result = await createApprovalRequest({ ...req.body, requestedBy: req.user.id });
    return res.status(result.approvalRequired ? 201 : 200).json(result);
  } catch (error) { return next(error); }
}

async function decide(req, res, next) {
  try {
    const requestResult = await decideApprovalRequest({
      approvalRequestId: req.params.approvalRequestId,
      decidedBy: req.user.id,
      decision: req.body.decision,
      notes: req.body.notes,
      actorRoles: req.user.roles || [req.user.role].filter(Boolean),
    });
    return res.json({ request: requestResult });
  } catch (error) { return next(error); }
}

async function exceptions(req, res, next) {
  try {
    const where = req.query.status ? { status: req.query.status } : {};
    return res.json({ exceptions: await FinancialControlException.findAll({ where, order: [['detected_at', 'DESC']] }) });
  } catch (error) { return next(error); }
}

async function resolveException(req, res, next) {
  try {
    const item = await FinancialControlException.findByPk(req.params.exceptionId);
    if (!item) return res.status(404).json({ error: 'Exception not found' });
    await item.update({
      status: 'resolved',
      resolved_by: req.user.id,
      resolved_at: new Date(),
      resolution_notes: req.body.resolutionNotes,
    });
    return res.json({ exception: item });
  } catch (error) { return next(error); }
}

module.exports = { policies, approvals, request, decide, exceptions, resolveException };
