const { initiatePayment, parseWebhook, checkPaymentStatus } = require('../services/payment.service');
const { Order } = require('../models/associations');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../config/constants');

// ─── Initiate payment for an order ───────────────────────────────────────────
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
    });

    // Save reference to order
    await order.update({
      payment_method:    payment_method || order.payment_method,
      payment_reference: result.reference,
    });

    return res.status(200).json({
      message:     'Payment initiated',
      reference:   result.reference,
      redirectUrl: result.redirectUrl || null, // for card payments
      status:      result.status,
    });
  } catch (err) {
    console.error('initiateOrderPayment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

// ─── ContiPay webhook — called by ContiPay when payment status changes ────────
async function handleWebhook(req, res) {
  try {
    const { orderId, status } = parseWebhook(req.body);

    if (!orderId) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await order.update({ payment_status: status });

    // If payment failed, cancel the order
    if (status === PAYMENT_STATUS.FAILED) {
      await order.update({
        status:        ORDER_STATUS.CANCELLED,
        cancelled_at:  new Date(),
        cancel_reason: 'Payment failed',
      });
    }

    // Acknowledge receipt to ContiPay
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('handleWebhook error:', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ─── Check payment status manually ───────────────────────────────────────────
async function getPaymentStatus(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });

    if (!order.payment_reference) {
      return res.status(400).json({ error: 'No payment initiated for this order' });
    }

    const result = await checkPaymentStatus(order.payment_reference);
    return res.status(200).json({ status: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { initiateOrderPayment, handleWebhook, getPaymentStatus };