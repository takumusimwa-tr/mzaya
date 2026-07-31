const {
  FinanceExportJob,
} = require('../models/associations');

/**
 * Creates an asynchronous export job. Rendering is intentionally delegated to
 * a worker so CSV/XLSX/PDF generation cannot block the API process.
 */
async function createFinanceExportJob({
  requestedBy,
  exportType,
  format,
  filters,
}) {
  return FinanceExportJob.create({
    requested_by: requestedBy,
    export_type: exportType,
    format,
    filters,
    status: 'pending',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
}

async function getFinanceExportJob({
  jobId,
  requestedBy,
}) {
  const job = await FinanceExportJob.findOne({
    where: {
      id: jobId,
      requested_by: requestedBy,
    },
  });

  if (!job) {
    const error = new Error('Finance export job not found');
    error.status = 404;
    error.code = 'FINANCE_EXPORT_NOT_FOUND';
    throw error;
  }

  return job;
}

module.exports = {
  createFinanceExportJob,
  getFinanceExportJob,
};
