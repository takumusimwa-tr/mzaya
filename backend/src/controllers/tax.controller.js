const {
  TaxJurisdiction,
  TaxRate,
} = require('../models/associations');
const { getTaxSummary } = require('../services/taxReport.service');

async function listJurisdictions(req, res, next) {
  try {
    const jurisdictions = await TaxJurisdiction.findAll({
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ jurisdictions });
  } catch (error) {
    return next(error);
  }
}

async function listRates(req, res, next) {
  try {
    const rates = await TaxRate.findAll({
      where: { jurisdiction_id: req.params.jurisdictionId },
      order: [['effective_from', 'DESC']],
    });
    return res.status(200).json({ rates });
  } catch (error) {
    return next(error);
  }
}

async function summary(req, res, next) {
  try {
    return res.status(200).json({
      summary: await getTaxSummary({
        jurisdictionId: req.params.jurisdictionId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listJurisdictions,
  listRates,
  summary,
};
