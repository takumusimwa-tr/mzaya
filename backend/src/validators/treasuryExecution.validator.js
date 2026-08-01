const Joi = require('joi');

const transferParams = Joi.object({
  transferId: Joi.string().uuid().required(),
});

const dealParams = Joi.object({
  dealId: Joi.string().uuid().required(),
});

const createFxDeal = Joi.object({
  buyCurrency: Joi.string().uppercase().length(3).required(),
  sellCurrency: Joi.string().uppercase().length(3).required(),
  buyAmountMinor: Joi.number().integer().min(1).required(),
  sellAmountMinor: Joi.number().integer().min(1).required(),
  agreedRate: Joi.number().positive().required(),
  counterparty: Joi.string().max(180).required(),
  tradeDate: Joi.date().iso().required(),
  settlementDate: Joi.date().iso().min(Joi.ref('tradeDate')).required(),
}).unknown(false);

const settleFxDeal = Joi.object({
  provider: Joi.string().max(60).required(),
  providerReference: Joi.string().max(180).required(),
}).unknown(false);

const createForecast = Joi.object({
  scenarioId: Joi.string().uuid().required(),
  currency: Joi.string().uppercase().length(3).required(),
  forecastStart: Joi.date().iso().required(),
  forecastEnd: Joi.date().iso().min(Joi.ref('forecastStart')).required(),
  openingCashMinor: Joi.number().integer().required(),
  dates: Joi.array().min(1).items(Joi.string().isoDate()).required(),
  expectedInflowsByDate: Joi.object().required(),
  expectedOutflowsByDate: Joi.object().required(),
}).unknown(false);

module.exports = {
  transferParams,
  dealParams,
  createFxDeal,
  settleFxDeal,
  createForecast,
};
