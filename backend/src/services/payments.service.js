const axios = require('axios');
const { CONTIPAY, PAYMENT_STATUS } = require('../config/constants');

// ─── Determine ContiPay base URL ──────────────────────────────────────────────
const BASE_URL = process.env.NODE_ENV === 'production'
  ? CONTIPAY.LIVE_URL
  : CONTIPAY.DEV_URL;

// ─── Initiate a direct payment (EcoCash, OneMoney, InnBucks, O'Mari) ──────────
// Customer gets a USSD push prompt on their phone to confirm
async function initiateDirectPayment({ orderId, amount, phone, method, currency = 'USD' }) {
  const providerCode = CONTIPAY.PROVIDER_CODES[method];
  if (!providerCode) {
    throw new Error(`Unsupported payment method: ${method}`);
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/payments/initiate`,
      {
        merchantCode:  process.env.CONTIPAY_MERCHANT_CODE,
        reference:     `MZAYA-${orderId}`,
        amount:        parseFloat(amount).toFixed(2),
        currency,
        phone:         formatPhone(phone),
        provider:      providerCode,
        webhookUrl:    `${process.env.APP_URL}/api/payments/webhook`,
        description:   `Mzaya order ${orderId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTIPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      status:    PAYMENT_STATUS.PENDING,
      reference: response.data.reference,
      raw:       response.data,
    };
  } catch (err) {
    console.error('ContiPay direct payment error:', err?.response?.data || err.message);
    throw new Error('Payment initiation failed');
  }
}

// ─── Initiate a redirect payment (Visa, Mastercard, ZIPIT) ───────────────────
// Returns a URL — redirect the customer's browser to complete payment
async function initiateRedirectPayment({ orderId, amount, method, currency = 'USD' }) {
  const providerCode = CONTIPAY.PROVIDER_CODES[method];
  if (!providerCode) {
    throw new Error(`Unsupported payment method: ${method}`);
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/v1/payments/redirect`,
      {
        merchantCode: process.env.CONTIPAY_MERCHANT_CODE,
        reference:    `MZAYA-${orderId}`,
        amount:       parseFloat(amount).toFixed(2),
        currency,
        provider:     providerCode,
        successUrl:   `${process.env.APP_URL}/api/payments/success`,
        cancelUrl:    `${process.env.APP_URL}/api/payments/cancel`,
        webhookUrl:   `${process.env.APP_URL}/api/payments/webhook`,
        description:  `Mzaya order ${orderId}`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTIPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      status:      PAYMENT_STATUS.PENDING,
      redirectUrl: response.data.redirectUrl,
      reference:   response.data.reference,
      raw:         response.data,
    };
  } catch (err) {
    console.error('ContiPay redirect payment error:', err?.response?.data || err.message);
    throw new Error('Payment initiation failed');
  }
}

// ─── Handle ContiPay webhook (called by ContiPay when payment status changes) ─
function parseWebhook(payload) {
  // ContiPay sends: { reference, status, amount, currency, provider, ... }
  const { reference, status } = payload;

  // Extract orderId from reference e.g. "MZAYA-uuid-here"
  const orderId = reference?.replace('MZAYA-', '');

  const normalizedStatus = status === 'SUCCESS'
    ? PAYMENT_STATUS.SUCCESS
    : PAYMENT_STATUS.FAILED;

  return { orderId, status: normalizedStatus, raw: payload };
}

// ─── Check payment status manually ───────────────────────────────────────────
async function checkPaymentStatus(reference) {
  try {
    const response = await axios.get(
      `${BASE_URL}/v1/payments/status/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CONTIPAY_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (err) {
    console.error('ContiPay status check error:', err?.response?.data || err.message);
    throw new Error('Could not check payment status');
  }
}

// ─── Helper: format phone to international format ─────────────────────────────
// ContiPay expects: 2637XXXXXXXX (no +, no spaces)
function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `263${cleaned.slice(1)}`;
  if (cleaned.startsWith('263')) return cleaned;
  return `263${cleaned}`;
}

// ─── Route to correct initiation method based on payment method ───────────────
const REDIRECT_METHODS = ['visa', 'mastercard', 'zipit'];

async function initiatePayment({ orderId, amount, phone, method, currency }) {
  if (REDIRECT_METHODS.includes(method)) {
    return initiateRedirectPayment({ orderId, amount, method, currency });
  }
  return initiateDirectPayment({ orderId, amount, phone, method, currency });
}

module.exports = {
  initiatePayment,
  initiateDirectPayment,
  initiateRedirectPayment,
  parseWebhook,
  checkPaymentStatus,
};