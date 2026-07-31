const {
  createFinanceExportJob,
  getFinanceExportJob,
} = require('../services/financeExport.service');

async function createExport(req, res, next) {
  try {
    const job = await createFinanceExportJob({
      requestedBy: req.user.id,
      exportType: req.body.exportType,
      format: req.body.format,
      filters: req.body.filters,
    });

    return res.status(202).json({ job });
  } catch (error) {
    return next(error);
  }
}

async function getExport(req, res, next) {
  try {
    const job = await getFinanceExportJob({
      jobId: req.params.jobId,
      requestedBy: req.user.id,
    });

    return res.status(200).json({ job });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createExport,
  getExport,
};
