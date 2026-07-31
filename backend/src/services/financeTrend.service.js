const { Op } = require('sequelize');
const {
  FinanceDailySnapshot,
} = require('../models/associations');

async function getFinanceTrend({
  currency,
  startDate,
  endDate,
}) {
  return FinanceDailySnapshot.findAll({
    where: {
      currency: String(currency).toUpperCase(),
      snapshot_date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['snapshot_date', 'ASC']],
    raw: true,
  });
}

module.exports = {
  getFinanceTrend,
};
