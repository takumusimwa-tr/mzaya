const crypto = require('crypto');
const {
  FinanceValidationRule, FinanceMasterDataRecord,
  FinanceMasterDataVersion, FinanceDataQualityResult,
} = require('../models/associations');

function evaluateRule(rule, payload) {
  const c = rule.configuration || {};
  if (rule.rule_type === 'required_fields') {
    const missing = (c.fields || []).filter((f) => payload?.[f] == null || payload?.[f] === '');
    return missing.length
      ? { passed: false, code: 'MISSING_REQUIRED_FIELDS', message: `Missing: ${missing.join(', ')}` }
      : { passed: true };
  }
  if (rule.rule_type === 'allowed_values') {
    const ok = (c.values || []).includes(payload?.[c.field]);
    return ok ? { passed: true } : {
      passed: false, code: 'INVALID_ALLOWED_VALUE', message: `${c.field} has an invalid value`,
    };
  }
  if (rule.rule_type === 'date_range') {
    const from = payload?.[c.fromField];
    const to = payload?.[c.toField];
    return !from || !to || new Date(to) >= new Date(from)
      ? { passed: true }
      : { passed: false, code: 'INVALID_DATE_RANGE', message: 'Effective-to precedes effective-from' };
  }
  return { passed: true };
}

async function runDataQualityAssessment({ domainId = null } = {}) {
  const runReference = `DQ-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
  const rules = await FinanceValidationRule.findAll({
    where: domainId ? { domain_id: domainId, status: 'active' } : { status: 'active' },
  });
  const records = await FinanceMasterDataRecord.findAll({
    where: domainId ? { domain_id: domainId } : undefined,
    include: [{ model: FinanceMasterDataVersion, as: 'currentVersion', required: false }],
  });

  const results = [];
  for (const record of records) {
    for (const rule of rules.filter((r) => !r.domain_id || String(r.domain_id) === String(record.domain_id))) {
      const evaluation = evaluateRule(rule, record.currentVersion?.payload || {});
      results.push(await FinanceDataQualityResult.create({
        run_reference: runReference,
        rule_id: rule.id,
        domain_id: record.domain_id,
        record_id: record.id,
        result: evaluation.passed ? 'passed' : 'failed',
        issue_code: evaluation.code || null,
        issue_message: evaluation.message || null,
        detected_value: evaluation.passed ? {} : { recordKey: record.record_key },
      }));
    }
  }
  return { runReference, results };
}

module.exports = { evaluateRule, runDataQualityAssessment };
