const { EventEmitter } = require('events');

const treasuryExecutionEvents = new EventEmitter();
treasuryExecutionEvents.setMaxListeners(50);

const TREASURY_EXECUTION_EVENT = Object.freeze({
  TRANSFER_APPROVED: 'treasury_transfer:approved',
  TRANSFER_SUBMITTED: 'treasury_transfer:submitted',
  TRANSFER_COMPLETED: 'treasury_transfer:completed',
  TRANSFER_FAILED: 'treasury_transfer:failed',
  FORECAST_APPROVED: 'liquidity_forecast:approved',
  FX_DEAL_SETTLED: 'treasury_fx_deal:settled',
});

module.exports = {
  treasuryExecutionEvents,
  TREASURY_EXECUTION_EVENT,
};
