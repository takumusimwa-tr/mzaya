const {
  FinanceAuditFinding,
} = require('../models/associations');
const {
  createAuditFinding,
} = require('../services/financeFinding.service');

async function list(req, res, next) {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.severity) where.severity = req.query.severity;

    const findings = await FinanceAuditFinding.findAll({
      where,
      order: [['severity', 'DESC'], ['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ findings });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const finding = await createAuditFinding({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ finding });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create };
