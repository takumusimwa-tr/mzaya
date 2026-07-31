const service = require('../services/messageModeration.service');

async function createReport(req, res, next) {
  try {
    const report = await service.reportMessage({
      messageId: req.params.messageId,
      reporterId: req.user.id,
      reason: req.body.reason,
      details: req.body.details,
    });
    return res.status(201).json({ report });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    return res.status(200).json(await service.listReports(req.query));
  } catch (error) {
    return next(error);
  }
}

async function resolve(req, res, next) {
  try {
    const report = await service.resolveReport({
      reportId: req.params.reportId,
      reviewerId: req.user.id,
      ...req.body,
    });
    return res.status(200).json({ report });
  } catch (error) {
    return next(error);
  }
}

async function applyAction(req, res, next) {
  try {
    const action = await service.applyModerationAction({
      conversationId: req.params.conversationId,
      actorId: req.user.id,
      ...req.body,
    });
    return res.status(201).json({ action });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createReport, list, resolve, applyAction };
