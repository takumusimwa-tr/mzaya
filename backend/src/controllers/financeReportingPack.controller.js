const {
  FinanceReportingPack,
  FinanceReportingSection,
  FinanceNarrative,
} = require('../models/associations');
const {
  generateReportingPack,
} = require('../services/financeReportingPack.service');

async function list(req, res, next) {
  try {
    const packs = await FinanceReportingPack.findAll({
      include: [
        { model: FinanceReportingSection, as: 'sections' },
        { model: FinanceNarrative, as: 'narratives' },
      ],
      order: [['generated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ packs });
  } catch (error) {
    return next(error);
  }
}

async function generate(req, res, next) {
  try {
    const pack = await generateReportingPack({
      ...req.body,
      generatedBy: req.user.id,
    });
    return res.status(201).json({ pack });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  generate,
};
