const { TaxInvoice } = require('../models/associations');
const {
  taxReportingEvents,
  TAX_REPORTING_EVENT,
} = require('../events/taxReporting.events');

/**
 * Provider-neutral invoice document renderer.
 * Inject a PDF renderer and private storage adapter in production.
 */
async function generateInvoiceDocument({
  invoiceId,
  renderer,
  storage,
}) {
  const invoice = await TaxInvoice.findByPk(invoiceId);

  if (!invoice) {
    const error = new Error('Tax invoice not found');
    error.status = 404;
    error.code = 'TAX_INVOICE_NOT_FOUND';
    throw error;
  }

  const buffer = await renderer.render({ invoice });
  const storageKey = [
    'finance',
    'invoices',
    String(invoice.issued_at).slice(0, 10),
    `${invoice.invoice_number}.pdf`,
  ].join('/');

  await storage.putBuffer({
    key: storageKey,
    buffer,
    contentType: 'application/pdf',
  });

  await invoice.update({
    document_storage_key: storageKey,
    document_generated_at: new Date(),
  });

  taxReportingEvents.emit(TAX_REPORTING_EVENT.INVOICE_DOCUMENT_READY, {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
  });

  return invoice;
}

module.exports = { generateInvoiceDocument };
