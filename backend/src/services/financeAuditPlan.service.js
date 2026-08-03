const crypto = require('crypto');
const {
  FinanceAuditPlan,
  FinanceAuditEngagement,
  FinanceAuditProcedure,
} = require('../models/associations');

const STANDARD_PROCEDURES = [
  ['maker_checker', 'Test maker-checker separation', 'financial_controls', 'automated', 10],
  ['ledger_integrity', 'Test ledger balancing and immutability', 'ledger', 'automated', 20],
  ['bank_reconciliation', 'Test bank reconciliation completeness', 'treasury', 'hybrid', 30],
  ['settlement_controls', 'Test settlement approvals and completeness', 'settlements', 'hybrid', 40],
  ['revenue_recognition', 'Test revenue-recognition timing and reversals', 'revenue', 'hybrid', 50],
  ['tax_compliance', 'Test tax filing readiness and evidence', 'tax', 'manual', 60],
  ['financial_close', 'Test close checklist and sign-off', 'close', 'hybrid', 70],
];

async function createAuditPlan({
  name,
  fiscalYear,
  planningMethod,
  riskUniverse = [],
  ownerId,
}) {
  return FinanceAuditPlan.create({
    plan_reference: `FAP-${fiscalYear}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    name,
    fiscal_year: fiscalYear,
    planning_method: planningMethod,
    risk_universe: riskUniverse,
    owner_id: ownerId,
  });
}

async function createAuditEngagement({
  auditPlanId,
  name,
  scopeType,
  scopeValue,
  periodFrom,
  periodTo,
  riskRating,
  leadAuditorId,
}) {
  const engagement = await FinanceAuditEngagement.create({
    audit_plan_id: auditPlanId,
    engagement_reference: `FAE-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    name,
    scope_type: scopeType,
    scope_value: scopeValue,
    period_from: periodFrom,
    period_to: periodTo,
    risk_rating: riskRating,
    lead_auditor_id: leadAuditorId,
  });

  await FinanceAuditProcedure.bulkCreate(
    STANDARD_PROCEDURES.map(([key, procedureName, area, type, sequence]) => ({
      engagement_id: engagement.id,
      procedure_key: key,
      name: procedureName,
      control_area: area,
      procedure_type: type,
      sequence,
      status: 'pending',
    }))
  );

  return engagement;
}

module.exports = {
  STANDARD_PROCEDURES,
  createAuditPlan,
  createAuditEngagement,
};
