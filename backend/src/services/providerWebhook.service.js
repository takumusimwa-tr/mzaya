const crypto = require('crypto');
const {
  ProviderWebhookEvent,
} = require('../models/associations');
const {
  verifyProviderSignature,
} = require('./providerSignature.service');
const {
  providerWebhookEvents,
  PROVIDER_WEBHOOK_EVENT,
} = require('../events/providerWebhook.events');

function serviceError(message, status = 400, code = 'WEBHOOK_ERROR') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeHeaders(headers = {}) {
  const allowed = [
    'content-type',
    'user-agent',
    'x-webhook-signature',
    'x-event-id',
    'x-event-type',
  ];

  return Object.fromEntries(
    Object.entries(headers)
      .map(([key, value]) => [key.toLowerCase(), value])
      .filter(([key]) => allowed.includes(key))
  );
}

function deriveEventIdentity({
  provider,
  headers,
  payload,
  rawBody,
}) {
  const providerEventId =
    headers['x-event-id'] ||
    payload.eventId ||
    payload.reference ||
    payload.pollUrl ||
    crypto
      .createHash('sha256')
      .update(rawBody)
      .digest('hex');

  const eventType =
    headers['x-event-type'] ||
    payload.eventType ||
    payload.status ||
    'unknown';

  return {
    providerEventId: String(providerEventId).slice(0, 180),
    eventType: String(eventType).slice(0, 100),
  };
}

async function ingestProviderWebhook({
  provider,
  headers,
  rawBody,
  payload,
}) {
  const normalizedHeaders = normalizeHeaders(headers);
  const signatureValid = verifyProviderSignature({
    provider,
    rawBody,
    headers: normalizedHeaders,
  });

  if (!signatureValid) {
    throw serviceError(
      'Webhook signature verification failed',
      401,
      'WEBHOOK_SIGNATURE_INVALID'
    );
  }

  const identity = deriveEventIdentity({
    provider,
    headers: normalizedHeaders,
    payload,
    rawBody,
  });

  const [event, created] = await ProviderWebhookEvent.findOrCreate({
    where: {
      provider: String(provider).toLowerCase(),
      provider_event_id: identity.providerEventId,
    },
    defaults: {
      event_type: identity.eventType,
      signature_valid: true,
      status: 'received',
      payload,
      headers: normalizedHeaders,
      next_attempt_at: new Date(),
    },
  });

  if (created) {
    providerWebhookEvents.emit(PROVIDER_WEBHOOK_EVENT.RECEIVED, {
      webhookEventId: event.id,
      provider: event.provider,
      eventType: event.event_type,
    });
  }

  return {
    event,
    duplicate: !created,
  };
}

module.exports = {
  normalizeHeaders,
  deriveEventIdentity,
  ingestProviderWebhook,
};
