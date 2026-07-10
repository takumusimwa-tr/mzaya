// backend/src/controllers/payment.controller.js
const {
  initiatePayment, parseWebhook, pollStatus, MOCK,
} = require('../services/payment.service');
const { Order } = require('../models/associations');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../config/constants');

// ─── Initiate payment for an order ────────────────────────────────────────────
async function initiateOrderPayment(req, res) {
  try {
    const { id } = req.params;
    const { payment_method, currency } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (order.payment_status === PAYMENT_STATUS.SUCCESS) {
      return res.status(400).json({ error: 'Order already paid' });
    }

    const result = await initiatePayment({
      orderId:  order.id,
      amount:   order.total_usd,
      phone:    req.user.phone,
      method:   payment_method || order.payment_method,
      currency: currency || 'USD',
      email:    req.user.email,
    });

    await order.update({
      payment_method:    payment_method || order.payment_method,
      payment_reference: result.reference,
      payment_poll_url:  result.pollUrl || null,
      currency_paid:     currency || 'USD',
    });

    return res.status(200).json({
      message:      'Payment initiated',
      reference:    result.reference,
      redirectUrl:  result.redirectUrl || null,   // web/card/diaspora
      pollUrl:      result.pollUrl || null,        // mobile money → poll this
      instructions: result.instructions || null,  // USSD hint
      status:       result.status,
      mock:         MOCK,
    });
  } catch (err) {
    console.error('initiateOrderPayment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Poll payment status (mobile money confirmation) ──────────────────────────
async function pollOrderPayment(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (!order.payment_poll_url) return res.status(400).json({ error: 'Nothing to poll for this order' });

    const result = await pollStatus(order.payment_poll_url);

    // Persist a resolved status.
    if (result.status && result.status !== PAYMENT_STATUS.PENDING) {
      await order.update({ payment_status: result.status });
      if (result.status === PAYMENT_STATUS.FAILED) {
        await order.update({
          status:        ORDER_STATUS.CANCELLED,
          cancelled_at:  new Date(),
          cancel_reason: 'Payment failed',
        });
      }
    }

    return res.status(200).json({ status: result.status, paid: result.paid });
  } catch (err) {
    console.error('pollOrderPayment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Webhook — Paynow calls resulturl on status change ────────────────────────
async function handleWebhook(req, res) {
  try {
    const { orderId, status, hashValid } = parseWebhook(req.body);
    if (!hashValid) return res.status(400).json({ error: 'Invalid signature' });
    if (!orderId)  return res.status(400).json({ error: 'Invalid webhook payload' });

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ payment_status: status });

    if (status === PAYMENT_STATUS.FAILED) {
      await order.update({
        status:        ORDER_STATUS.CANCELLED,
        cancelled_at:  new Date(),
        cancel_reason: 'Payment failed',
      });
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('handleWebhook error:', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ─── Mock poll endpoint (only used in MOCK mode) ──────────────────────────────
// The mock pollUrl points here; it reports success ~5s after initiation.
async function mockPoll(req, res) {
  const { pollStatus } = require('../services/payment.service');
  try {
    const fakeUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const result = await pollStatus(fakeUrl);
    return res.status(200).json(result.raw || { status: result.status });
  } catch (err) {
    return res.status(200).json({ status: 'Sent' });
  }
}

module.exports = {
  initiateOrderPayment, pollOrderPayment, handleWebhook, mockPoll,
};
