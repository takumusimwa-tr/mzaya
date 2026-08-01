const { Op } = require('sequelize');
const {
  ProviderWebhookEvent,
  ProviderWebhookAttempt,
} = require('../models/associations');
const {
  routeProviderWebhook,
} = require('./providerWebhookRouter.service');
const {
  providerWebhookEvents,
  PROVIDER_WEBHOOK_EVENT,
} = require('../events/providerWebhook.events');

const MAX_ATTEMPTS = Number(process.env.WEBHOOK_MAX_ATTEMPTS || 8);

function retryDelayMs(attemptNumber) {
  const minutes = Math.min(60, 2 ** Math.max(0, attemptNumber - 1));
  return minutes * 60 * 1000;
}

async function processWebhookEvent(webhookEventId) {
  const event = await ProviderWebhookEvent.findByPk(webhookEventId);

  if (!event) return null;
  if (event.status === 'processed') return event;

  const attemptNumber = Number(event.attempt_count) + 1;
  const attempt = await ProviderWebhookAttempt.create({
    webhook_event_id: event.id,
    attempt_number: attemptNumber,
    status: 'processing',
  });

  await event.update({
    status: 'processing',
    attempt_count: attemptNumber,
    processing_started_at: new Date(),
    last_error: null,
  });

  try {
    const result = await routeProviderWebhook(event);

    await attempt.update({
      status: 'processed',
      completed_at: new Date(),
    });

    await event.update({
      status: 'processed',
      processed_at: new Date(),
      next_attempt_at: null,
      last_error: null,
    });

    providerWebhookEvents.emit(PROVIDER_WEBHOOK_EVENT.PROCESSED, {
      webhookEventId: event.id,
      provider: event.provider,
      resourceType: result.resourceType,
      resourceId: result.resourceId,
    });

    return event;
  } catch (error) {
    const terminal = attemptNumber >= MAX_ATTEMPTS;
    const nextAttemptAt = terminal
      ? null
      : new Date(Date.now() + retryDelayMs(attemptNumber));

    await attempt.update({
      status: 'failed',
      error_message: String(error.message || error).slice(0, 1000),
      completed_at: new Date(),
    });

    await event.update({
      status: terminal ? 'dead_letter' : 'failed',
      failed_at: new Date(),
      next_attempt_at: nextAttemptAt,
      last_error: String(error.message || error).slice(0, 1000),
    });

    providerWebhookEvents.emit(PROVIDER_WEBHOOK_EVENT.FAILED, {
      webhookEventId: event.id,
      provider: event.provider,
      terminal,
      error: error.message,
    });

    throw error;
  }
}

async function processDueWebhookEvents({
  limit = 50,
}) {
  const events = await ProviderWebhookEvent.findAll({
    where: {
      status: { [Op.in]: ['received', 'failed'] },
      [Op.or]: [
        { next_attempt_at: null },
        { next_attempt_at: { [Op.lte]: new Date() } },
      ],
    },
    order: [['received_at', 'ASC']],
    limit: Math.min(Number(limit) || 50, 200),
  });

  const results = [];

  for (const event of events) {
    try {
      results.push(await processWebhookEvent(event.id));
    } catch {
      results.push(null);
    }
  }

  return results;
}

module.exports = {
  retryDelayMs,
  processWebhookEvent,
  processDueWebhookEvents,
};
