const { sequelize } = require('../config/db');
const {
  FinanceOutboxEvent,
} = require('../models/associations');

async function claimOutboxBatch({
  workerId,
  limit = 50,
}) {
  return sequelize.transaction(async (transaction) => {
    const dialect = sequelize.getDialect();

    if (dialect !== 'postgres') {
      return FinanceOutboxEvent.findAll({
        where: {
          status: ['pending', 'retry'],
        },
        order: [['created_at', 'ASC']],
        limit,
        transaction,
      });
    }

    const [rows] = await sequelize.query(
      `
        WITH claimable AS (
          SELECT id
          FROM finance_outbox_events
          WHERE status IN ('pending', 'retry')
            AND available_at <= NOW()
          ORDER BY created_at ASC
          FOR UPDATE SKIP LOCKED
          LIMIT :limit
        )
        UPDATE finance_outbox_events o
        SET status = 'processing',
            worker_id = :workerId,
            updated_at = NOW()
        FROM claimable c
        WHERE o.id = c.id
        RETURNING o.*;
      `,
      {
        replacements: {
          limit,
          workerId,
        },
        transaction,
      }
    );

    return rows;
  });
}

module.exports = {
  claimOutboxBatch,
};
