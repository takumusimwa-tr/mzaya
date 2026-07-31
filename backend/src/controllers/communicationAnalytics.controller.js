const {
  getCommunicationOverview,
  getLiveCommunicationHealth,
} = require('../services/communicationAnalytics.service');

async function overview(req, res, next) {
  try {
    return res.status(200).json(await getCommunicationOverview(req.query));
  } catch (error) {
    return next(error);
  }
}

async function health(req, res, next) {
  try {
    return res.status(200).json(await getLiveCommunicationHealth());
  } catch (error) {
    return next(error);
  }
}

module.exports = { overview, health };
