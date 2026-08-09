const { FinanceValidationRule, FinanceDataQualityResult } = require('../models/associations');
const { runDataQualityAssessment } = require('../services/financeDataQuality.service');

async function dashboard(req, res, next) {
  try {
    const [rules, results] = await Promise.all([
      FinanceValidationRule.findAll({ where: { status: 'active' }, order: [['name', 'ASC']] }),
      FinanceDataQualityResult.findAll({ order: [['evaluated_at', 'DESC']], limit: 300 }),
    ]);
    return res.status(200).json({ rules, results });
  } catch (error) { return next(error); }
}

async function run(req, res, next) {
  try {
    return res.status(201).json(await runDataQualityAssessment({ domainId: req.body.domainId || null }));
  } catch (error) { return next(error); }
}

module.exports = { dashboard, run };
