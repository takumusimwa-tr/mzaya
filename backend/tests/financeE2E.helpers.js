const {
  sequelize,
  models,
} = require('./setup');

const {
  FinancePostingTemplate,
  FinancePostingRule,
  FinanceOutboxEvent,
  FinanceBusinessEvent,
  FinanceAccountingEvent,
  LedgerTransaction,
  LedgerEntry,
} = models;

const {
  ensureFinancePostingConfiguration,
} = require('../src/services/financePostingSeed.service');
const {
  drainFinancePipeline,
} = require('../src/services/financePipeline.service');

async function seedFinance() {
  await ensureFinancePostingConfiguration();
}

async function drain() {
  return drainFinancePipeline({
    maxPasses: 10,
    logger: {
      info() {},
      warn() {},
      error() {},
    },
  });
}

async function financeLineageForIdempotency(idempotencyKey) {
  const outbox = await FinanceOutboxEvent.findOne({
    where: { idempotency_key: idempotencyKey },
  });

  const businessEvent = await FinanceBusinessEvent.findOne({
    where: { idempotency_key: idempotencyKey },
  });

  const accountingEvent = businessEvent
    ? await FinanceAccountingEvent.findOne({
        where: { business_event_id: businessEvent.id },
      })
    : null;

  const ledgerTransaction = accountingEvent?.ledger_transaction_id
    ? await LedgerTransaction.findByPk(
        accountingEvent.ledger_transaction_id,
        {
          include: [{
            model: LedgerEntry,
            as: 'entries',
          }],
        }
      )
    : null;

  return {
    outbox,
    businessEvent,
    accountingEvent,
    ledgerTransaction,
  };
}

module.exports = {
  sequelize,
  models,
  seedFinance,
  drain,
  financeLineageForIdempotency,
};
