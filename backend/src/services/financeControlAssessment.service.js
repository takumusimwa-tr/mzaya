const {
  FinanceControlAssessment,
} = require('../models/associations');
const {
  financeAuditEvents,
  FINANCE_AUDIT_EVENT,
} = require('../events/financeAudit.events');

function calculateEffectiveness({
  sampleSize,
  exceptionsCount,
}) {
  const size = Number(sampleSize || 0);
  const exceptions = Number(exceptionsCount || 0);

  if (size <= 0) return null;
  return Number(Math.max(0, 1 - exceptions / size).toFixed(4));
}

function rateOperatingEffectiveness(score) {
  if (score == null) return 'not_tested';
  if (score >= 0.98) return 'effective';
  if (score >= 0.9) return 'partially_effective';
  return 'ineffective';
}

async function saveControlAssessment(payload) {
  const effectivenessScore = calculateEffectiveness({
    sampleSize: payload.sampleSize,
    exceptionsCount: payload.exceptionsCount,
  });

  const assessment = await FinanceControlAssessment.create({
    procedure_id: payload.procedureId || null,
    control_key: payload.controlKey,
    control_name: payload.controlName,
    control_area: payload.controlArea,
    design_rating: payload.designRating,
    operating_rating: rateOperatingEffectiveness(effectivenessScore),
    test_period_from: payload.testPeriodFrom,
    test_period_to: payload.testPeriodTo,
    population_size: payload.populationSize,
    sample_size: payload.sampleSize,
    exceptions_count: payload.exceptionsCount,
    effectiveness_score: effectivenessScore,
    conclusion: payload.conclusion,
    assessed_by: payload.assessedBy,
    metadata: payload.metadata || {},
  });

  financeAuditEvents.emit(
    FINANCE_AUDIT_EVENT.ASSESSMENT_COMPLETED,
    {
      assessmentId: assessment.id,
      operatingRating: assessment.operating_rating,
    }
  );

  return assessment;
}

module.exports = {
  calculateEffectiveness,
  rateOperatingEffectiveness,
  saveControlAssessment,
};
