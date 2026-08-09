const crypto = require('crypto');
const {
  FinanceAccountingEvent,
} = require('../models/associations');
const {
  resolvePostingRule,
} = require('./financePostingRule.service');

function getPath(source, path) {
  if (!path) return undefined;
  return String(path)
    .replace(/^event\./, '')
    .split('.')
    .reduce((value, part) => value?.[part], source);
}

function resolveAmountMinor(line, event) {
  if (Number.isInteger(line.amountMinor)) return line.amountMinor;

  const sourceValue = getPath(event, line.amountSource);
  const multiplier = line.multiplier == null ? 1 : Number(line.multiplier);

  const amount = Math.round(Number(sourceValue || 0) * multiplier);
  if (!Number.isFinite(amount) || amount < 0) {
    const error = new Error('Posting line resolved to an invalid amount');
    error.status = 422;
    error.code = 'INVALID_POSTING_AMOUNT';
    throw error;
  }

  return amount;
}

function buildJournalFromTemplate({
  template,
  event,
}) {
  const lines = Array.isArray(template.lines) ? template.lines : [];
  if (lines.length < 2) {
    const error = new Error('Posting template requires at least two journal lines');
    error.status = 422;
    error.code = 'INVALID_POSTING_TEMPLATE';
    throw error;
  }

  const journalLines = lines.map((line) => ({
    accountCode: line.accountCode,
    direction: line.direction,
    amountMinor: resolveAmountMinor(line, event),
    memo: line.memo || event.event_type,
    dimensions: line.dimensions || {},
  }));

  const debitTotalMinor = journalLines
    .filter((line) => line.direction === 'debit')
    .reduce((sum, line) => sum + Number(line.amountMinor), 0);

  const creditTotalMinor = journalLines
    .filter((line) => line.direction === 'credit')
    .reduce((sum, line) => sum + Number(line.amountMinor), 0);

  return {
    currency: event.currency,
    lines: journalLines,
    debitTotalMinor,
    creditTotalMinor,
    balanced: debitTotalMinor === creditTotalMinor,
  };
}

async function prepareAccountingEvent(businessEvent, { transaction = null } = {}) {
  const existing = await FinanceAccountingEvent.findOne({
    where: { business_event_id: businessEvent.id },
    transaction,
  });

  if (existing) return existing;

  const { rule, template } = await resolvePostingRule(businessEvent);
  const journal = buildJournalFromTemplate({
    template,
    event: businessEvent.toJSON ? businessEvent.toJSON() : businessEvent,
  });

  if (!journal.balanced) {
    const error = new Error('Generated journal is not balanced');
    error.status = 422;
    error.code = 'FINANCE_JOURNAL_NOT_BALANCED';
    error.context = {
      debitTotalMinor: journal.debitTotalMinor,
      creditTotalMinor: journal.creditTotalMinor,
    };
    throw error;
  }

  return FinanceAccountingEvent.create({
    business_event_id: businessEvent.id,
    posting_rule_id: rule.id,
    posting_template_id: template.id,
    accounting_reference:
      `ACE-${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    currency: journal.currency,
    debit_total_minor: journal.debitTotalMinor,
    credit_total_minor: journal.creditTotalMinor,
    balanced: true,
    journal_payload: journal,
    status: 'prepared',
  }, { transaction });
}

module.exports = {
  getPath,
  resolveAmountMinor,
  buildJournalFromTemplate,
  prepareAccountingEvent,
};
