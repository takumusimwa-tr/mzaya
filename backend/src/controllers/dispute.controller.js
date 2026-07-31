const {
  createDispute,
  addEvidence,
  updateDispute,
  listDisputes,
} = require('../services/dispute.service');

async function create(req, res, next) {
  try {
    const dispute = await createDispute({
      customerId: req.user.id,
      ...req.body,
    });
    return res.status(201).json({ dispute });
  } catch (error) {
    return next(error);
  }
}

async function evidence(req, res, next) {
  try {
    const item = await addEvidence({
      disputeId: req.params.disputeId,
      submittedBy: req.user.id,
      ...req.body,
    });
    return res.status(201).json({ evidence: item });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const dispute = await updateDispute({
      disputeId: req.params.disputeId,
      actorId: req.user.id,
      changes: req.body,
    });
    return res.status(200).json({ dispute });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    return res.status(200).json(await listDisputes(req.query));
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, evidence, update, list };
