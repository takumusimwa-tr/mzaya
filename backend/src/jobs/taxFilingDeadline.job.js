const cron = require('node-cron');
const { Op } = require('sequelize');
const { TaxFilingPeriod } = require('../models/associations');
const {
  taxReportingEvents,
  TAX_REPORTING_EVENT,
} = require('../events/taxReporting.events');

async function notifyUpcomingTaxDeadlines({
  daysAhead = 7,
}) {
  const start = new Date();
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + Number(daysAhead));

  const periods = await TaxFilingPeriod.findAll({
    where: {
      status: { [Op.in]: ['open', 'locked'] },
      due_date: {
        [Op.between]: [
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10),
        ],
      },
    },
  });

  for (const period of periods) {
    taxReportingEvents.emit(TAX_REPORTING_EVENT.FILING_DUE, {
      filingPeriodId: period.id,
      jurisdictionId: period.jurisdiction_id,
      taxType: period.tax_type,
      dueDate: period.due_date,
    });
  }

  return periods.length;
}

function startTaxFilingDeadlineJob({ logger = console } = {}) {
  return cron.schedule('0 8 * * *', () => {
    notifyUpcomingTaxDeadlines().catch((error) => {
      logger.error?.('tax_filing_deadline_job_failed', {
        error: error.message,
      });
    });
  });
}

module.exports = {
  notifyUpcomingTaxDeadlines,
  startTaxFilingDeadlineJob,
};
