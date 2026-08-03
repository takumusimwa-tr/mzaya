const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  FinanceRemediationAction,
} = require('../models/associations');
const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

function startRemediationReminderJob({ logger = console } = {}) {
  return cron.schedule('0 8 * * *', async () => {
    try {
      const overdue = await FinanceRemediationAction.findAll({
        where: {
          status: { [Op.in]: ['open', 'in_progress'] },
          due_date: { [Op.lt]: new Date().toISOString().slice(0, 10) },
        },
      });

      for (const action of overdue) {
        await action.update({ status: 'overdue' });

        financeAuditEvents.emit(
          FINANCE_AUDIT_EVENT.REMEDIATION_OVERDUE,
          {
            remediationId: action.id,
            findingId: action.finding_id,
            ownerId: action.owner_id,
          }
        );
      }

      logger.info?.('remediation_overdue_check_completed', {
        overdue: overdue.length,
      });
    } catch (error) {
      logger.error?.('remediation_overdue_check_failed', {
        error: error.message,
      });
    }
  });
}

module.exports = { startRemediationReminderJob };
