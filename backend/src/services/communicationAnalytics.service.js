const { Op } = require('sequelize');
const {
  Conversation,
  Message,
  MessageReport,
  CommunicationDailyMetric,
} = require('../models/associations');

function dateOnly(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

async function aggregateDailyCommunicationMetrics(metricDate = new Date()) {
  const start = new Date(`${dateOnly(metricDate)}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const range = { [Op.gte]: start, [Op.lt]: end };

  const metrics = {
    'conversations.created': await Conversation.count({ where: { created_at: range } }),
    'messages.sent': await Message.count({ where: { created_at: range, deleted_at: null } }),
    'moderation.reports_created': await MessageReport.count({ where: { created_at: range } }),
  };

  for (const [metricKey, value] of Object.entries(metrics)) {
    await CommunicationDailyMetric.upsert({
      metric_date: dateOnly(metricDate),
      metric_key: metricKey,
      dimension: 'all',
      value_numeric: value,
    });
  }

  return metrics;
}

async function getCommunicationOverview({ startDate, endDate }) {
  const series = await CommunicationDailyMetric.findAll({
    where: { metric_date: { [Op.between]: [startDate, endDate] } },
    order: [['metric_date', 'ASC']],
    raw: true,
  });

  const totals = series.reduce((accumulator, row) => {
    accumulator[row.metric_key] =
      (accumulator[row.metric_key] || 0) + Number(row.value_numeric);
    return accumulator;
  }, {});

  return { totals, series };
}

async function getLiveCommunicationHealth() {
  return {
    openReports: await MessageReport.count({ where: { status: 'open' } }),
    activeConversations: await Conversation.count({ where: { status: 'active' } }),
    messagesLastHour: await Message.count({
      where: {
        created_at: { [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) },
        deleted_at: null,
      },
    }),
  };
}

module.exports = {
  aggregateDailyCommunicationMetrics,
  getCommunicationOverview,
  getLiveCommunicationHealth,
};
