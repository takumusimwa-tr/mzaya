const cron = require('node-cron');
const { Op } = require('sequelize');
const { Dispute } = require('../models/associations');
const { disputeEvents, DISPUTE_EVENT } = require('../events/dispute.events');

async function notifyApproachingDisputeDeadlines() {
  const now = new Date();
  const threshold = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const disputes = await Dispute.findAll({
    where: {
      status: { [Op.notIn]: ['resolved', 'closed'] },
      response_due_at: {
        [Op.between]: [now, threshold],
      },
    },
  });

  for (const dispute of disputes) {
    disputeEvents.emit(DISPUTE_EVENT.DEADLINE_NEAR, {
      disputeId: dispute.id,
      responseDueAt: dispute.response_due_at,
      assignedAgentId: dispute.assigned_agent_id,
    });
  }

  return disputes.length;
}

function startDisputeDeadlineJob() {
  return cron.schedule('0 * * * *', () => {
    notifyApproachingDisputeDeadlines().catch((error) => {
      console.error('dispute_deadline_job_failed', {
        message: error.message,
      });
    });
  });
}

module.exports = {
  notifyApproachingDisputeDeadlines,
  startDisputeDeadlineJob,
};
