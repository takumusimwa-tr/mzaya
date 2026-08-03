const cron = require('node-cron');
const {
  generateReportingPack,
} = require('../services/financeReportingPack.service');

function startManagementPackJob({ logger = console } = {}) {
  return cron.schedule('0 6 1 * *', async () => {
    const now = new Date();
    const periodTo = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      0
    ));
    const periodFrom = new Date(Date.UTC(
      periodTo.getUTCFullYear(),
      periodTo.getUTCMonth(),
      1
    ));

    try {
      await generateReportingPack({
        packType: 'management',
        title: `Monthly Management Pack — ${periodTo.toISOString().slice(0, 7)}`,
        periodFrom: periodFrom.toISOString().slice(0, 10),
        periodTo: periodTo.toISOString().slice(0, 10),
        currency: process.env.FINANCE_REPORTING_CURRENCY || 'USD',
        generatedBy: null,
      });
    } catch (error) {
      logger.error?.('management_pack_generation_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = { startManagementPackJob };
