const { sequelize } = require('../config/db');
const { TaxInvoice } = require('../models/associations');
const { nextInvoiceNumber } = require('./invoiceNumber.service');
const { calculateTax } = require('./taxCalculation.service');
const { recordComplianceAudit } = require('./complianceAudit.service');

async function generateTaxInvoice({
  jurisdictionId,
  orderId,
  paymentId,
  customerId,
  currency,
  subtotalMinor,
  taxableMinor,
  documentType = 'invoice',
  createdBy,
  metadata = {},
}) {
  return sequelize.transaction(async (transaction) => {
    const fiscalYear = new Date().getUTCFullYear();
    const invoiceNumber = await nextInvoiceNumber({
      jurisdictionId,
      documentType,
      fiscalYear,
      transaction,
    });

    const tax = await calculateTax({
      jurisdictionId,
      taxType: 'vat',
      appliesTo: 'platform_fee',
      taxableMinor,
    });

    const invoice = await TaxInvoice.create({
      invoice_number: invoiceNumber,
      document_type: documentType,
      jurisdiction_id: jurisdictionId,
      order_id: orderId,
      payment_id: paymentId,
      customer_id: customerId,
      currency: String(currency).toUpperCase(),
      subtotal_minor: subtotalMinor,
      tax_minor: tax.taxMinor,
      total_minor: Number(subtotalMinor) + Number(tax.taxMinor),
      created_by: createdBy,
      metadata: {
        ...metadata,
        taxRateId: tax.taxRateId,
        rateBasisPoints: tax.rateBasisPoints,
      },
    }, { transaction });

    await recordComplianceAudit({
      actorId: createdBy,
      action: 'invoice_issued',
      resourceType: 'tax_invoice',
      resourceId: invoice.id,
      newValue: {
        invoiceNumber,
        totalMinor: invoice.total_minor,
      },
      transaction,
    });

    return invoice;
  });
}

module.exports = { generateTaxInvoice };
