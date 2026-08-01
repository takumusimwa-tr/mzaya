const { EventEmitter } = require('events');

const taxReportingEvents = new EventEmitter();
taxReportingEvents.setMaxListeners(50);

const TAX_REPORTING_EVENT = Object.freeze({
  RETURN_PREPARED: 'tax_return:prepared',
  RETURN_APPROVED: 'tax_return:approved',
  RETURN_SUBMITTED: 'tax_return:submitted',
  FILING_DUE: 'tax_filing:due',
  INVOICE_DOCUMENT_READY: 'tax_invoice:document_ready',
});

module.exports = {
  taxReportingEvents,
  TAX_REPORTING_EVENT,
};
