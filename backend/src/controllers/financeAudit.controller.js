const {
  FinanceAuditPlan,
  FinanceAuditEngagement,
  FinanceAuditProcedure,
  FinanceControlAssessment,
  FinanceAuditEvidence,
} = require('../models/associations');
const {
  createAuditPlan,
  createAuditEngagement,
} = require('../services/financeAuditPlan.service');
const {
  saveControlAssessment,
} = require('../services/financeControlAssessment.service');
const {
  registerAuditEvidence,
} = require('../services/financeEvidence.service');

async function dashboard(req, res, next) {
  try {
    const [plans, engagements, assessments, evidence] = await Promise.all([
      FinanceAuditPlan.findAll({ order: [['fiscal_year', 'DESC']] }),
      FinanceAuditEngagement.findAll({
        include: [{ model: FinanceAuditProcedure, as: 'procedures' }],
        order: [['created_at', 'DESC']],
      }),
      FinanceControlAssessment.findAll({
        order: [['assessed_at', 'DESC']],
        limit: 100,
      }),
      FinanceAuditEvidence.findAll({
        order: [['collected_at', 'DESC']],
        limit: 100,
      }),
    ]);

    return res.status(200).json({
      plans,
      engagements,
      assessments,
      evidence,
    });
  } catch (error) {
    return next(error);
  }
}

async function createPlan(req, res, next) {
  try {
    const plan = await createAuditPlan({
      ...req.body,
      ownerId: req.user.id,
    });
    return res.status(201).json({ plan });
  } catch (error) {
    return next(error);
  }
}

async function createEngagement(req, res, next) {
  try {
    const engagement = await createAuditEngagement({
      ...req.body,
      leadAuditorId: req.user.id,
    });
    return res.status(201).json({ engagement });
  } catch (error) {
    return next(error);
  }
}

async function createAssessment(req, res, next) {
  try {
    const assessment = await saveControlAssessment({
      ...req.body,
      assessedBy: req.user.id,
    });
    return res.status(201).json({ assessment });
  } catch (error) {
    return next(error);
  }
}

async function createEvidence(req, res, next) {
  try {
    const evidence = await registerAuditEvidence({
      ...req.body,
      collectedBy: req.user.id,
    });
    return res.status(201).json({ evidence });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  createPlan,
  createEngagement,
  createAssessment,
  createEvidence,
};
