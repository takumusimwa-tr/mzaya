const { TaxRegistration } = require('../models/associations');
const { recordComplianceAudit } = require('./complianceAudit.service');

async function upsertTaxRegistration({
  jurisdictionId,
  registrationType,
  registrationNumber,
  legalName,
  effectiveFrom,
  effectiveTo = null,
  actorId,
}) {
  const [registration] = await TaxRegistration.upsert({
    jurisdiction_id: jurisdictionId,
    registration_type: registrationType,
    registration_number: registrationNumber,
    legal_name: legalName,
    effective_from: effectiveFrom,
    effective_to: effectiveTo,
    status: 'active',
  }, { returning: true });

  await recordComplianceAudit({
    actorId,
    action: 'tax_registration_saved',
    resourceType: 'tax_registration',
    resourceId: registration.id,
    newValue: {
      jurisdictionId,
      registrationType,
      legalName,
    },
  });

  return registration;
}

module.exports = { upsertTaxRegistration };
