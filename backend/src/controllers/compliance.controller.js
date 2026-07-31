const { ComplianceAuditLog } = require('../models/associations');

async function listAudit(req, res, next) {
  try {
    const audit = await ComplianceAuditLog.findAll({
      order: [['occurred_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 500),
    });
    return res.status(200).json({ audit });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listAudit };
