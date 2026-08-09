const { Op } = require('sequelize');
const {
  FinancePostingRule,
  FinancePostingTemplate,
} = require('../models/associations');

function conditionMatches(condition = {}, payload = {}) {
  return Object.entries(condition).every(([key, expected]) => {
    const actual = key
      .split('.')
      .reduce((value, part) => value?.[part], payload);

    if (Array.isArray(expected)) return expected.includes(actual);
    return actual === expected;
  });
}

async function resolvePostingRule(event) {
  const now = new Date();

  const rules = await FinancePostingRule.findAll({
    where: {
      event_type: event.event_type,
      status: 'active',
      effective_from: { [Op.lte]: now },
      [Op.and]: [{
        [Op.or]: [
          { effective_to: null },
          { effective_to: { [Op.gte]: now } },
        ],
      }, {
        [Op.or]: [
          { source_system: null },
          { source_system: event.source_system },
        ],
      }],
    },
    order: [['priority', 'ASC']],
  });

  for (const rule of rules) {
    if (!conditionMatches(rule.condition_expression || {}, event.payload || {})) {
      continue;
    }

    const template = await FinancePostingTemplate.findOne({
      where: {
        template_key: rule.posting_template_key,
        status: 'active',
      },
      order: [['version_number', 'DESC']],
    });

    if (template) return { rule, template };
  }

  const error = new Error(`No posting rule matched event type ${event.event_type}`);
  error.status = 422;
  error.code = 'FINANCE_POSTING_RULE_NOT_FOUND';
  throw error;
}

module.exports = {
  conditionMatches,
  resolvePostingRule,
};
