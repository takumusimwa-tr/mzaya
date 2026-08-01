const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  TaxReturn,
  TaxFilingPeriod,
  TaxRegistration,
} = require('../models/associations');
const {
  calculateTaxReturnValues,
} = require('./taxReturnCalculation.service');
const { recordTaxReturnAudit } = require('./taxReturnAudit.service');
const {
  taxReportingEvents,
  TAX_REPORTING_EVENT,
} = require('../events/taxReporting.events');

function serviceError(message, status = 400, code = 'TAX_RETURN_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function buildReturnReference(periodCode) {
  return `TAX-${periodCode}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function prepareTaxReturn({
  filingPeriodId,
  registrationId,
  actorId,
  adjustmentsMinor = 0,
}) {
  return sequelize.transaction(async (transaction) => {
    const [period, registration] = await Promise.all([
      TaxFilingPeriod.findByPk(filingPeriodId, { transaction }),
      TaxRegistration.findByPk(registrationId, { transaction }),
    ]);

    if (!period || !registration) {
      throw serviceError(
        'Tax filing period or registration not found',
        404,
        'TAX_CONFIGURATION_NOT_FOUND'
      );
    }

    if (period.status !== 'open') {
      throw serviceError(
        'Tax filing period is not open',
        409,
        'TAX_FILING_PERIOD_CLOSED'
      );
    }

    const values = await calculateTaxReturnValues({
      jurisdictionId: period.jurisdiction_id,
      startDate: period.start_date,
      endDate: period.end_date,
    });

    const netTaxDueMinor =
      Number(values.outputTaxMinor) -
      Number(values.inputTaxMinor) +
      Number(adjustmentsMinor);

    const [taxReturn] = await TaxReturn.findOrCreate({
      where: {
        filing_period_id: filingPeriodId,
        registration_id: registrationId,
      },
      defaults: {
        return_reference: buildReturnReference(period.period_code),
        status: 'draft',
        taxable_sales_minor: values.taxableSalesMinor,
        output_tax_minor: values.outputTaxMinor,
        input_tax_minor: values.inputTaxMinor,
        adjustments_minor: adjustmentsMinor,
        net_tax_due_minor: netTaxDueMinor,
        currency: registration.metadata?.currency || 'USD',
        prepared_by: actorId,
        prepared_at: new Date(),
      },
      transaction,
    });

    await recordTaxReturnAudit({
      taxReturnId: taxReturn.id,
      actorId,
      action: 'tax_return_prepared',
      newValue: {
        taxableSalesMinor: taxReturn.taxable_sales_minor,
        netTaxDueMinor: taxReturn.net_tax_due_minor,
      },
      transaction,
    });

    transaction.afterCommit(() => {
      taxReportingEvents.emit(TAX_REPORTING_EVENT.RETURN_PREPARED, {
        taxReturnId: taxReturn.id,
        filingPeriodId,
      });
    });

    return taxReturn;
  });
}

async function approveTaxReturn({
  taxReturnId,
  actorId,
}) {
  const taxReturn = await TaxReturn.findByPk(taxReturnId);

  if (!taxReturn) {
    throw serviceError('Tax return not found', 404, 'TAX_RETURN_NOT_FOUND');
  }

  if (taxReturn.status !== 'draft') {
    throw serviceError(
      'Only draft returns can be approved',
      409,
      'INVALID_TAX_RETURN_STATUS'
    );
  }

  await taxReturn.update({
    status: 'approved',
    approved_by: actorId,
    approved_at: new Date(),
  });

  await recordTaxReturnAudit({
    taxReturnId,
    actorId,
    action: 'tax_return_approved',
    previousValue: { status: 'draft' },
    newValue: { status: 'approved' },
  });

  taxReportingEvents.emit(TAX_REPORTING_EVENT.RETURN_APPROVED, {
    taxReturnId,
  });

  return taxReturn;
}

async function submitTaxReturn({
  taxReturnId,
  actorId,
  submissionReference,
}) {
  const taxReturn = await TaxReturn.findByPk(taxReturnId, {
    include: [{
      model: TaxFilingPeriod,
      as: 'filingPeriod',
      required: true,
    }],
  });

  if (!taxReturn) {
    throw serviceError('Tax return not found', 404, 'TAX_RETURN_NOT_FOUND');
  }

  if (taxReturn.status !== 'approved') {
    throw serviceError(
      'Tax return must be approved before submission',
      409,
      'INVALID_TAX_RETURN_STATUS'
    );
  }

  await taxReturn.update({
    status: 'submitted',
    submitted_by: actorId,
    submitted_at: new Date(),
    submission_reference: submissionReference,
  });

  await taxReturn.filingPeriod.update({
    status: 'filed',
    filed_at: new Date(),
  });

  await recordTaxReturnAudit({
    taxReturnId,
    actorId,
    action: 'tax_return_submitted',
    previousValue: { status: 'approved' },
    newValue: {
      status: 'submitted',
      submissionReference,
    },
  });

  taxReportingEvents.emit(TAX_REPORTING_EVENT.RETURN_SUBMITTED, {
    taxReturnId,
    filingPeriodId: taxReturn.filing_period_id,
  });

  return taxReturn;
}

module.exports = {
  buildReturnReference,
  prepareTaxReturn,
  approveTaxReturn,
  submitTaxReturn,
};
