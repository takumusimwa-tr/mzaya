// backend/src/services/payment.service.js
// Paynow (Zimbabwe) payment integration.
//
// Two flows:
//   - Express Checkout (mobile money: EcoCash, OneMoney) → USSD push, then poll.
//   - Web redirect (cards / general / diaspora) → redirect to Paynow, webhook back.
//
// Requests/responses are validated with a SHA512 hash of concatenated field
// values + the Integration Key (Paynow's scheme). Amounts are strings.
//
// MOCK MODE: if PAYNOW_INTEGRATION_ID / PAYNOW_INTEGRATION_KEY are not set,
// the service simulates the whole flow so the app can be built/tested without a
// merchant account. Flip to real by adding the two env vars.
const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
const { PAYMENT_STATUS } = require('../config/constants');

const INTEGRATION_ID  = process.env.PAYNOW_INTEGRATION_ID || '';
const INTEGRATION_KEY = process.env.PAYNOW_INTEGRATION_KEY || '';
const APP_URL         = process.env.APP_URL || 'http://localhost:5000';
const CLIENT_URL      = process.env.CLIENT_URL || 'http://localhost:5173';
const MOCK = !INTEGRATION_ID || !INTEGRATION_KEY;

// Paynow endpoints
const INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const REMOTE_URL   = 'https://www.paynow.co.zw/interface/remotetransaction'; // express (mobile)

// Mobile-money methods use Express Checkout; everything else uses web redirect.
const MOBILE_METHODS = ['ecocash', 'onemoney', 'innbucks', 'omari'];
// Diaspora / card / general go through the web redirect (hosted page).
const REDIRECT_METHODS = ['visa', 'mastercard', 'card', 'diaspora', 'web'];

// ─── Hash helpers (Paynow SHA512 scheme) ──────────────────────────────────────
// Concatenate all values (except 'hash'), append the integration key, SHA512, uppercase.
function generateHash(values) {
  let concat = '';
  for (const key of Object.keys(values)) {
    if (key.toLowerCase() === 'hash') continue;
    concat += String(values[key]);
  }
  concat += INTEGRATION_KEY;
  return crypto.createHash('sha512').update(concat, 'utf8').digest('hex').toUpperCase();
}

function verifyHash(values) {
  const received = values.hash || values.Hash;
  if (!received) return false;
  const expected = generateHash(values);
  return expected === received;
}

// Parse Paynow's url-encoded response body into an object.
function parsePaynowResponse(body) {
  // Paynow returns application/x-www-form-urlencoded text.
  return querystring.parse(body);
}

// ─── Initiate mobile-money express payment (USSD push) ────────────────────────
async function initiateExpress({ orderId, amount, phone, method, currency = 'USD', email }) {
  const reference = `MZAYA-${orderId}`;

  if (MOCK) return mockInitiate({ reference, mobile: true });

  const values = {
    id:              INTEGRATION_ID,
    reference,
    amount:          parseFloat(amount).toFixed(2),
    additionalinfo:  `Mzaya order ${orderId}`,
    returnurl:       `${CLIENT_URL}/orders/${orderId}`,
    resulturl:       `${APP_URL}/api/payments/webhook`,
    authemail:       email || 'customer@mzaya.co.zw',
    phone:           formatPhone(phone),
    method:          method.toLowerCase(),   // 'ecocash' | 'onemoney'
    status:          'Message',
  };
  values.hash = generateHash(values);

  try {
    const res = await axios.post(REMOTE_URL, querystring.stringify(values), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = parsePaynowResponse(res.data);
    if (String(data.status).toLowerCase() !== 'ok') {
      throw new Error(data.error || 'Paynow declined the transaction');
    }
    return {
      status:     PAYMENT_STATUS.PENDING,
      reference,
      pollUrl:    data.pollurl,          // poll this to learn the result
      instructions: data.instructions,   // e.g. "Dial *151# ..."
      raw:        data,
    };
  } catch (err) {
    console.error('Paynow express error:', err?.response?.data || err.message);
    throw new Error('Payment initiation failed');
  }
}

// ─── Initiate web redirect payment (cards / diaspora / general) ───────────────
async function initiateRedirect({ orderId, amount, currency = 'USD', email }) {
  const reference = `MZAYA-${orderId}`;

  if (MOCK) return mockInitiate({ reference, mobile: false, orderId });

  const values = {
    id:             INTEGRATION_ID,
    reference,
    amount:         parseFloat(amount).toFixed(2),
    additionalinfo: `Mzaya order ${orderId}`,
    returnurl:      `${CLIENT_URL}/orders/${orderId}`,
    resulturl:      `${APP_URL}/api/payments/webhook`,
    authemail:      email || '',
    status:         'Message',
  };
  values.hash = generateHash(values);

  try {
    const res = await axios.post(INITIATE_URL, querystring.stringify(values), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = parsePaynowResponse(res.data);
    if (String(data.status).toLowerCase() !== 'ok') {
      throw new Error(data.error || 'Paynow declined the transaction');
    }
    return {
      status:      PAYMENT_STATUS.PENDING,
      reference,
      redirectUrl: data.browserurl,   // send the customer here
      pollUrl:     data.pollurl,
      raw:         data,
    };
  } catch (err) {
    console.error('Paynow redirect error:', err?.response?.data || err.message);
    throw new Error('Payment initiation failed');
  }
}

// ─── Public: route by method ──────────────────────────────────────────────────
async function initiatePayment({ orderId, amount, phone, method, currency, email }) {
  const m = (method || '').toLowerCase();
  if (MOBILE_METHODS.includes(m)) {
    return initiateExpress({ orderId, amount, phone, method: m, currency, email });
  }
  // cards, diaspora, general
  return initiateRedirect({ orderId, amount, currency, email });
}

// ─── Poll a transaction's status (mobile money confirmation) ──────────────────
async function pollStatus(pollUrl) {
  if (MOCK) return mockPoll(pollUrl);
  try {
    const res = await axios.post(pollUrl, '', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = parsePaynowResponse(res.data);
    return {
      status:    normalizeStatus(data.status),
      reference: data.reference,
      paid:      String(data.status).toLowerCase() === 'paid',
      raw:       data,
    };
  } catch (err) {
    console.error('Paynow poll error:', err?.response?.data || err.message);
    throw new Error('Could not check payment status');
  }
}

// ─── Webhook (Paynow calls resulturl on status change) ────────────────────────
function parseWebhook(payload) {
  // Payload is url-decoded already by express.urlencoded, or a raw object.
  const values = payload;
  const okHash = MOCK ? true : verifyHash(values);
  const reference = values.reference || values.Reference || '';
  const orderId = reference.replace('MZAYA-', '');
  return {
    orderId,
    status:      normalizeStatus(values.status || values.Status),
    hashValid:   okHash,
    pollUrl:     values.pollurl,
    raw:         values,
  };
}

// Manual status check by reference isn't a Paynow primitive (you poll the
// pollUrl instead). Kept for controller compatibility.
async function checkPaymentStatus(pollUrl) {
  return pollStatus(pollUrl);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalizeStatus(s) {
  const v = String(s || '').toLowerCase();
  if (v === 'paid' || v === 'awaiting delivery' || v === 'delivered') return PAYMENT_STATUS.SUCCESS;
  if (v === 'cancelled' || v === 'failed' || v === 'disputed') return PAYMENT_STATUS.FAILED;
  return PAYMENT_STATUS.PENDING;
}

// Paynow expects local Zimbabwe format for mobile (0771234567) — keep leading 0.
function formatPhone(phone) {
  const cleaned = String(phone || '').replace(/\D/g, '');
  if (cleaned.startsWith('263')) return `0${cleaned.slice(3)}`;
  if (!cleaned.startsWith('0')) return `0${cleaned}`;
  return cleaned;
}

// ─── Mock mode (no merchant account) ──────────────────────────────────────────
// Simulates Paynow so the full UX is testable. Mobile → "pending" then auto-paid
// on poll. Redirect → a fake browser URL that returns to the order page.
function mockInitiate({ reference, mobile, orderId }) {
  const pollUrl = `${APP_URL}/api/payments/mock-poll?ref=${encodeURIComponent(reference)}&t=${Date.now()}`;
  if (mobile) {
    return {
      status: PAYMENT_STATUS.PENDING,
      reference,
      pollUrl,
      instructions: '[MOCK] Approve the prompt on your phone. Auto-confirms in ~5s.',
      raw: { mock: true },
    };
  }
  return {
    status: PAYMENT_STATUS.PENDING,
    reference,
    // In mock, "redirect" straight back to the order page with a success flag.
    redirectUrl: `${CLIENT_URL}/orders/${orderId}?mockpay=success`,
    pollUrl,
    raw: { mock: true },
  };
}

// Mock poll: pretend the payment succeeds ~5s after initiation.
function mockPoll(pollUrl) {
  let paid = true;
  try {
    const t = Number(new URL(pollUrl).searchParams.get('t')) || 0;
    paid = Date.now() - t > 5000; // succeeds after 5s
  } catch { /* default paid */ }
  return {
    status:    paid ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.PENDING,
    reference: '',
    paid,
    raw:       { mock: true },
  };
}

module.exports = {
  initiatePayment,
  initiateExpress,
  initiateRedirect,
  pollStatus,
  parseWebhook,
  checkPaymentStatus,
  MOCK,
};
