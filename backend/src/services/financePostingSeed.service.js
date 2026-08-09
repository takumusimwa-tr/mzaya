const path = require('path');
const fs = require('fs');
const {
  FinancePostingRule,
  FinancePostingTemplate,
} = require('../models/associations');

const TEMPLATE_DIR = path.join(
  __dirname,
  '..',
  'config',
  'financePostingTemplates'
);

function loadPostingTemplateConfigs() {
  return fs
    .readdirSync(TEMPLATE_DIR)
    .filter((name) => name.endsWith('.js'))
    .sort()
    .map((name) => {
      // Config files are code-owned, not user-controlled dynamic modules.
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path.join(TEMPLATE_DIR, name));
    });
}

function normalizeTemplateConfig(config) {
  return {
    template_key: config.templateKey,
    name: config.name,
    description: config.description || null,
    lines: config.lines,
    status: 'active',
    version_number: 1,
    metadata: {
      seededBy: 'financePostingSeed.service',
      conditions: config.conditions || null,
    },
  };
}

async function ensureFinancePostingConfiguration() {
  const configs = loadPostingTemplateConfigs();

  for (const config of configs) {
    const normalized = normalizeTemplateConfig(config);

    const [template] = await FinancePostingTemplate.findOrCreate({
      where: {
        template_key: config.templateKey,
      },
      defaults: normalized,
    });

    // Keep code-owned template definitions current before production cutover.
    await template.update({
      name: normalized.name,
      description: normalized.description,
      lines: normalized.lines,
      status: 'active',
      metadata: normalized.metadata,
    });

    const ruleKey = `seed:${config.templateKey}`;

    const [rule] = await FinancePostingRule.findOrCreate({
      where: {
        rule_key: ruleKey,
      },
      defaults: {
        rule_key: ruleKey,
        name: config.name,
        event_type: config.eventType,
        source_system: null,
        condition_expression: config.conditions || {},
        posting_template_key: config.templateKey,
        priority: 100,
        status: 'active',
        effective_from: new Date('2026-01-01T00:00:00.000Z'),
        metadata: {
          seededBy: 'financePostingSeed.service',
        },
      },
    });

    await rule.update({
      name: config.name,
      event_type: config.eventType,
      condition_expression: config.conditions || {},
      posting_template_key: config.templateKey,
      status: 'active',
    });
  }

  return {
    templateCount: configs.length,
    ruleCount: configs.length,
  };
}

module.exports = {
  loadPostingTemplateConfigs,
  normalizeTemplateConfig,
  ensureFinancePostingConfiguration,
};
