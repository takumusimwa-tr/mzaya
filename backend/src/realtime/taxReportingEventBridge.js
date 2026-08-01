const {
  taxReportingEvents,
  TAX_REPORTING_EVENT,
} = require('../events/taxReporting.events');

function initializeTaxReportingEventBridge(io) {
  const filingDue = (payload) => {
    io.to('admins').emit('tax_filing:due', payload);
  };

  const returnSubmitted = (payload) => {
    io.to('admins').emit('tax_return:submitted', payload);
    io.to('admins').emit('finance_dashboard:refresh', {
      reason: 'tax_return_submitted',
      at: new Date().toISOString(),
    });
  };

  const invoiceDocumentReady = (payload) => {
    io.to('admins').emit('tax_invoice:document_ready', payload);
  };

  taxReportingEvents.on(
    TAX_REPORTING_EVENT.FILING_DUE,
    filingDue
  );
  taxReportingEvents.on(
    TAX_REPORTING_EVENT.RETURN_SUBMITTED,
    returnSubmitted
  );
  taxReportingEvents.on(
    TAX_REPORTING_EVENT.INVOICE_DOCUMENT_READY,
    invoiceDocumentReady
  );

  return () => {
    taxReportingEvents.off(
      TAX_REPORTING_EVENT.FILING_DUE,
      filingDue
    );
    taxReportingEvents.off(
      TAX_REPORTING_EVENT.RETURN_SUBMITTED,
      returnSubmitted
    );
    taxReportingEvents.off(
      TAX_REPORTING_EVENT.INVOICE_DOCUMENT_READY,
      invoiceDocumentReady
    );
  };
}

module.exports = { initializeTaxReportingEventBridge };
