// backend/src/controllers/payment.controller.js
//
// Payment lifecycle. Four serious bugs are fixed here:
//
//   1. Mock payments could run in production → gated in payment.service.js.
//   2. The customer's entered phone was IGNORED — the controller destructured
//      only { payment_method, currency } and sent req.user.phone to the provider.
//      Someone paying from a different EcoCash line got the USSD prompt on their
//      profile number, and the payment silently failed.
//   3. A failed payment CANCELLED the whole order. One transient poll failure and
//      the customer's request was destroyed. It now simply stays unpaid.
//   4. No idempotency: a double-tap fired two provider calls, and a retried
//      webhook repeated its side effects.
const crypto = require('crypto');
const {
  initiatePayment, parseWebhook, pollStatus, MOCK,
} = require('../services/payment.service');
const { sequelize } = require('../config/db');
const { Order, PaymentAttempt, PaymentEvent } = require('../models/associations');
const { PAYMENT_STATUS } = require('../config/constants');
const { logger } = require('../utils/logger');
const {
  emitPaymentCaptured,
  emitPaymentFailed,
} = require('../services/paymentFinanceEvents.service');

const MOBILE_METHODS = ['ecocash', 'onemoney', 'innbucks', 'omari'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Zimbabwe mobile numbers → local 07XXXXXXXX.
// Accepts +263 77…, 263 77…, 077…, 77…
function normalizeZwPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;

  let local = digits;
  if (local.startsWith('263')) local = '0' + local.slice(3);
  else if (!local.startsWith('0')) local = '0' + local;

  // 077/078 Econet · 071 NetOne · 073 Telecel
  if (!/^0(7[1378])\d{7}$/.test(local)) return null;
  return local;
}

const maskPhone = (p) => (p ? p.slice(0, 4) + '***' + p.slice(-2) : null);

const hashPayload = (obj) =>
  crypto.createHash('sha256').update(JSON.stringify(obj || {})).digest('hex');

// Payment status is MONOTONIC. Gateways deliver events out of order; without
// this, a delayed "failed" webhook arriving after "paid" would unpay a settled
// order.
const RANK = { pending: 0, failed: 1, cancelled: 1, success: 2 };
const canTransition = (from, to) => (RANK[to] ?? 0) > (RANK[from] ?? 0);

// An order is paid iff SOME attempt succeeded — derived, never assigned by
// whichever event happened to land last.
async function recomputeOrderPayment(orderId, tx) {
  const paid = await PaymentAttempt.count({
    where: { order_id: orderId, status: 'success' },
    transaction: tx,
  });
  const status = paid > 0 ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING;
  await Order.update({ payment_status: status }, { where: { id: orderId }, transaction: tx });
  return status;
}

// ─── Initiate ─────────────────────────────────────────────────────────────────
// POST /api/payments/:id/pay
async function initiateOrderPayment(req, res) {
  try {
    const { id } = req.params;
    const { payment_method, currency, payment_phone, idempotency_key } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (order.payment_status === PAYMENT_STATUS.SUCCESS) {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const method = (payment_method || order.payment_method || '').toLowerCase();
    if (!method) return res.status(400).json({ error: 'payment_method is required' });

    // ── The phone fix ────────────────────────────────────────────────────────
    // Mobile money goes to the number the customer TYPED, not their profile
    // number. Paying from a spouse's line, a colleague's, or a second SIM is
    // completely normal here.
    let phone = null;
    if (MOBILE_METHODS.includes(method)) {
      phone = normalizeZwPhone(payment_phone || req.user.phone);
      if (!phone) {
        return res.status(400).json({
          error: 'Enter a valid Zimbabwean mobile money number (e.g. 0771234567)',
        });
      }
    }

    // ── Idempotency ──────────────────────────────────────────────────────────
    // The same key always returns the SAME attempt, so a double-tap, a proxy
    // retry, or an offline replay can only ever produce one USSD prompt.
    const key = idempotency_key || `${order.id}:${method}:${phone || 'redirect'}`;

    const existing = await PaymentAttempt.findOne({ where: { idempotency_key: key } });
    if (existing && existing.status === 'success') {
      return res.status(400).json({ error: 'Order already paid' });
    }
    if (existing && existing.status === 'pending') {
      logger.info('payment_initiate_idempotent_hit', { orderId: order.id, attemptId: existing.id });
      return res.status(200).json({
        message:     'Payment already initiated',
        reference:   existing.provider_reference,
        redirectUrl: existing.redirect_url,
        pollUrl:     existing.poll_url,
        status:      PAYMENT_STATUS.PENDING,
        attemptId:   existing.id,
        sentTo:      maskPhone(existing.payment_phone),
        mock:        MOCK,
      });
    }

    // Reserve the attempt BEFORE calling the provider. If two requests race, the
    // unique constraint means exactly one wins — one provider call, one prompt.
    let attempt;
    try {
      attempt = await PaymentAttempt.create({
        order_id:        order.id,
        idempotency_key: key,
        amount_usd:      order.total_usd,
        currency:        currency || 'USD',
        method,
        payment_phone:   phone,
        provider:        'paynow',
        status:          'pending',
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        const winner = await PaymentAttempt.findOne({ where: { idempotency_key: key } });
        return res.status(200).json({
          message:     'Payment already initiated',
          reference:   winner?.provider_reference,
          pollUrl:     winner?.poll_url,
          redirectUrl: winner?.redirect_url,
          status:      PAYMENT_STATUS.PENDING,
          attemptId:   winner?.id,
          mock:        MOCK,
        });
      }
      throw err;
    }

    // ── Call the provider ────────────────────────────────────────────────────
    let result;
    try {
      result = await initiatePayment({
        orderId:  order.id,
        amount:   order.total_usd,
        phone,                        // the number they actually entered
        method,
        currency: currency || 'USD',
        email:    req.user.email,
      });
    } catch (err) {
      await attempt.update({ status: 'failed', resolved_at: new Date() });
      logger.error('payment_initiate_failed', { orderId: order.id, error: err.message });
      return res.status(502).json({ error: 'Could not reach the payment provider. Please try again.' });
    }

    await attempt.update({
      provider_reference: result.reference,
      poll_url:           result.pollUrl || null,
      redirect_url:       result.redirectUrl || null,
    });

    // The order points at the live attempt, but its PAID state is derived from
    // attempts — never written here.
    await order.update({
      payment_method:    method,
      payment_reference: result.reference,
      payment_poll_url:  result.pollUrl || null,
      currency_paid:     currency || 'USD',
    });

    logger.info('payment_initiated', {
      orderId: order.id, attemptId: attempt.id, method, phone: maskPhone(phone),
    });

    return res.status(200).json({
      message:      'Payment initiated',
      reference:    result.reference,
      redirectUrl:  result.redirectUrl || null,
      pollUrl:      result.pollUrl || null,
      instructions: result.instructions || null,
      status:       result.status,
      attemptId:    attempt.id,
      sentTo:       maskPhone(phone),   // so the UI can say where the prompt went
      mock:         MOCK,
    });
  } catch (err) {
    logger.error('payment_initiate_error', { error: err.message, stack: err.stack });
    return res.status(500).json({ error: 'Failed to start payment' });
  }
}

// ─── Poll (mobile money confirmation) ─────────────────────────────────────────
// GET /api/payments/:id/poll
async function pollOrderPayment(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    const attempt = await PaymentAttempt.findOne({
      where: { order_id: order.id, status: 'pending' },
      order: [['createdAt', 'DESC']],
    });

    if (!attempt || !attempt.poll_url) {
      return res.status(200).json({
        status: order.payment_status,
        paid:   order.payment_status === PAYMENT_STATUS.SUCCESS,
      });
    }

    const result = await pollStatus(attempt.poll_url);
    const next = result.paid ? 'success'
               : result.status === PAYMENT_STATUS.FAILED ? 'failed'
               : 'pending';

    if (next !== 'pending') {
      await applyPaymentOutcome({
        attempt, next, rawStatus: result.raw?.status, payload: result.raw, source: 'poll',
      });
    }

    const fresh = await Order.findByPk(order.id);
    return res.status(200).json({
      status: fresh.payment_status,
      paid:   fresh.payment_status === PAYMENT_STATUS.SUCCESS,
    });
  } catch (err) {
    logger.error('payment_poll_error', { error: err.message });
    return res.status(500).json({ error: 'Could not check payment status' });
  }
}

// ─── Webhook ──────────────────────────────────────────────────────────────────
// POST /api/payments/webhook  (Paynow's resulturl)
async function handleWebhook(req, res) {
  try {
    const parsed = parseWebhook(req.body);
    if (!parsed.hashValid) {
      logger.warn('payment_webhook_bad_signature', {});
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const reference   = req.body?.reference || req.body?.Reference || '';
    const payloadHash = hashPayload(req.body);

    // ── Deduplicate ──────────────────────────────────────────────────────────
    // Gateways retry. The unique (reference, payload_hash) constraint means the
    // same event can arrive ten times and be applied exactly once.
    let event;
    try {
      event = await PaymentEvent.create({
        provider:           'paynow',
        provider_reference: reference,
        raw_status:         req.body?.status,
        normalized_status:  parsed.status,
        payload_hash:       payloadHash,
        order_id:           parsed.orderId || null,
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        logger.info('payment_webhook_duplicate', { reference });
        return res.status(200).json({ received: true, duplicate: true });
      }
      throw err;
    }

    const attempt = await PaymentAttempt.findOne({ where: { provider_reference: reference } });
    if (!attempt) {
      await event.update({ ignored_why: 'no matching attempt' });
      // Still 200 — a 4xx just makes Paynow retry forever.
      return res.status(200).json({ received: true });
    }

    const next = parsed.status === PAYMENT_STATUS.SUCCESS ? 'success'
               : parsed.status === PAYMENT_STATUS.FAILED  ? 'failed'
               : 'pending';

    if (next === 'pending') {
      await event.update({ attempt_id: attempt.id, ignored_why: 'still pending' });
      return res.status(200).json({ received: true });
    }

    const applied = await applyPaymentOutcome({
      attempt, next, rawStatus: req.body?.status, payload: req.body, source: 'webhook',
    });

    await event.update({
      attempt_id:  attempt.id,
      applied,
      ignored_why: applied ? null : 'would regress a settled payment',
    });

    return res.status(200).json({ received: true });
  } catch (err) {
    logger.error('payment_webhook_error', { error: err.message });
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ─── Apply an outcome — transactionally, monotonically ────────────────────────
async function applyPaymentOutcome({ attempt, next, rawStatus, payload, source }) {
  return sequelize.transaction(async (tx) => {
    // Lock the attempt so a webhook and a poll can't both resolve it at once.
    const locked = await PaymentAttempt.findByPk(attempt.id, {
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (!canTransition(locked.status, next)) {
      logger.info('payment_transition_refused', {
        attemptId: locked.id, from: locked.status, to: next, source,
      });
      return false;   // a settled payment is never dragged backwards
    }

    await locked.update({
      status: next,
      resolved_at: new Date(),
      provider_payload_hash: hashPayload(payload),
    }, { transaction: tx });

    const orderStatus = await recomputeOrderPayment(locked.order_id, tx);

    // Finance event publication is atomic with the authoritative payment
    // resolution. This closes the "payment succeeded but accounting never heard"
    // failure mode.
    if (next === 'success') {
      await emitPaymentCaptured({
        payment: locked,
        transaction: tx,
      });
    } else if (next === 'failed') {
      await emitPaymentFailed({
        payment: locked,
        transaction: tx,
        reason: rawStatus || 'provider_reported_failure',
      });
    }

    logger.info('payment_resolved', {
      attemptId: locked.id, orderId: locked.order_id,
      outcome: next, orderPaymentStatus: orderStatus, rawStatus, source,
    });

    // NOTE: a failed payment does NOT cancel the order.
    //
    // It used to. One transient blip on a poll and the customer's entire request
    // was destroyed — food, groceries, a truck of cement — because a USSD prompt
    // timed out. The order simply stays unpaid; the customer retries, or picks a
    // different method. Cancelling is a customer or admin decision, not a side
    // effect of a flaky gateway.
    return true;
  });
}

// ─── Mock poll (development only) ─────────────────────────────────────────────
async function mockPoll(req, res) {
  if (!MOCK) return res.status(404).json({ error: 'Not found' });
  try {
    const fakeUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const result = await pollStatus(fakeUrl);
    return res.status(200).json(result.raw || { status: result.status });
  } catch {
    return res.status(200).json({ status: 'Sent' });
  }
}

module.exports = {
  initiateOrderPayment, pollOrderPayment, handleWebhook, mockPoll,
};
