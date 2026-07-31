const {
  ingestProviderWebhook,
} = require('../services/providerWebhook.service');

async function receive(req, res, next) {
  try {
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body || {}));

    const payload = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString('utf8'))
      : req.body;

    const result = await ingestProviderWebhook({
      provider: req.params.provider,
      headers: req.headers,
      rawBody,
      payload,
    });

    return res.status(result.duplicate ? 200 : 202).json({
      received: true,
      duplicate: result.duplicate,
      eventId: result.event.id,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  receive,
};
