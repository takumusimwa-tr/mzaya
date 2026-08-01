const {
  VarianceReport,
  VarianceReportLine,
} = require('../models/associations');
const {
  generateVarianceReport,
} = require('../services/variance.service');

async function list(req, res, next) {
  try {
    const reports = await VarianceReport.findAll({
      include: [{ model: VarianceReportLine, as: 'lines' }],
      order: [['generated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ reports });
  } catch (error) {
    return next(error);
  }
}

async function generate(req, res, next) {
  try {
    const report = await generateVarianceReport({
      ...req.body,
      generatedBy: req.user.id,
    });
    return res.status(201).json({ report });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  generate,
};
