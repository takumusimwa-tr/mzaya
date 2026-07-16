const request = require('supertest');
const app = require('../src/app');
const {
  models, resetDatabase,
  makeCity, makeUser, makeOrder, tokenFor,
} = require('./setup');

const { Order, PaymentAttempt } = models;

beforeAll(resetDatabase);

describe('Payment idempotency', () => {
  // A double-tap used to fire TWO provider calls — two USSD prompts, and on a real
  // gateway, a possible double charge. Attempts are now keyed by an idempotency
  // key with a unique constraint, so the same intent can only ever produce one.
  it('does not create a second attempt for the same idempotency key', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);
    const auth = { Authorization: `Bearer ${tokenFor(customer)}` };

    const body = {
      payment_method: 'ecocash',
      payment_phone: '0771234567',
      idempotency_key: 'same-key-twice',
    };

    const first  = await request(app).post(`/api/payments/${order.id}/pay`).set(auth).send(body);
    const second = await request(app).post(`/api/payments/${order.id}/pay`).set(auth).send(body);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);

    const attempts = await PaymentAttempt.count({ where: { order_id: order.id } });
    expect(attempts).toBe(1);   // NOT two
  });

  it('survives two concurrent pay requests', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);
    const auth = { Authorization: `Bearer ${tokenFor(customer)}` };

    const body = {
      payment_method: 'ecocash',
      payment_phone: '0771234567',
      idempotency_key: 'concurrent-key',
    };

    await Promise.all([
      request(app).post(`/api/payments/${order.id}/pay`).set(auth).send(body),
      request(app).post(`/api/payments/${order.id}/pay`).set(auth).send(body),
    ]);

    // The unique constraint is the arbiter — one attempt, whichever request won.
    const attempts = await PaymentAttempt.count({ where: { order_id: order.id } });
    expect(attempts).toBe(1);
  });
});

describe('Payment phone', () => {
  // The controller used to destructure only { payment_method, currency } and send
  // req.user.phone to the provider — silently IGNORING the number the customer
  // typed. Anyone paying from a spouse's line, a colleague's, or a second SIM never
  // received the prompt, and the payment just failed.
  it('sends the prompt to the number the customer entered, not their profile number', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer', { phone: '0770000000' });
    const order = await makeOrder(customer, city);

    const res = await request(app)
      .post(`/api/payments/${order.id}/pay`)
      .set('Authorization', `Bearer ${tokenFor(customer)}`)
      .send({
        payment_method: 'ecocash',
        payment_phone: '0779999999',   // NOT their profile number
      });

    expect(res.status).toBe(200);

    const attempt = await PaymentAttempt.findOne({ where: { order_id: order.id } });
    expect(attempt.payment_phone).toBe('0779999999');
    expect(attempt.payment_phone).not.toBe(customer.phone);
  });

  it('normalises +263 into local format', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    await request(app)
      .post(`/api/payments/${order.id}/pay`)
      .set('Authorization', `Bearer ${tokenFor(customer)}`)
      .send({ payment_method: 'ecocash', payment_phone: '+263771234567' });

    const attempt = await PaymentAttempt.findOne({ where: { order_id: order.id } });
    expect(attempt.payment_phone).toBe('0771234567');
  });

  it('rejects a number that is not a Zimbabwean mobile', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const res = await request(app)
      .post(`/api/payments/${order.id}/pay`)
      .set('Authorization', `Bearer ${tokenFor(customer)}`)
      .send({ payment_method: 'ecocash', payment_phone: '12345' });

    expect(res.status).toBe(400);
  });
});

describe('Payment outcomes', () => {
  // A failed payment used to CANCEL THE ORDER. One transient blip on a poll and the
  // customer's entire request — food, groceries, a truck of cement — was destroyed
  // because a USSD prompt timed out.
  it('does NOT cancel the order when a payment fails', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const attempt = await PaymentAttempt.create({
      order_id: order.id,
      idempotency_key: `fail-${order.id}`,
      amount_usd: order.total_usd,
      method: 'ecocash',
      provider: 'paynow',
      provider_reference: `MZAYA-${order.id}`,
      status: 'pending',
    });

    // Simulate the provider reporting failure.
    await request(app).post('/api/payments/webhook').send({
      reference: attempt.provider_reference,
      status: 'Cancelled',
      hash: 'x',      // MOCK mode skips hash verification
    });

    const fresh = await Order.findByPk(order.id);
    expect(fresh.status).not.toBe('cancelled');   // the order SURVIVES
    expect(fresh.payment_status).not.toBe('success');
  });

  // Gateways deliver out of order. A delayed "failed" arriving after "paid" must not
  // unpay a settled order.
  it('never regresses a settled payment', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const attempt = await PaymentAttempt.create({
      order_id: order.id,
      idempotency_key: `mono-${order.id}`,
      amount_usd: order.total_usd,
      method: 'ecocash',
      provider: 'paynow',
      provider_reference: `MZAYA-${order.id}`,
      status: 'pending',
    });

    // Paid.
    await request(app).post('/api/payments/webhook').send({
      reference: attempt.provider_reference, status: 'Paid', hash: 'x',
    });

    let fresh = await Order.findByPk(order.id);
    expect(fresh.payment_status).toBe('success');

    // Then a late failure arrives.
    await request(app).post('/api/payments/webhook').send({
      reference: attempt.provider_reference, status: 'Cancelled', hash: 'x',
    });

    fresh = await Order.findByPk(order.id);
    expect(fresh.payment_status).toBe('success');   // STILL paid

    const finalAttempt = await PaymentAttempt.findByPk(attempt.id);
    expect(finalAttempt.status).toBe('success');
  });

  it('applies a duplicate webhook exactly once', async () => {
    const city = await makeCity();
    const customer = await makeUser('customer');
    const order = await makeOrder(customer, city);

    const attempt = await PaymentAttempt.create({
      order_id: order.id,
      idempotency_key: `dup-${order.id}`,
      amount_usd: order.total_usd,
      method: 'ecocash',
      provider: 'paynow',
      provider_reference: `MZAYA-${order.id}`,
      status: 'pending',
    });

    const payload = { reference: attempt.provider_reference, status: 'Paid', hash: 'x' };

    const a = await request(app).post('/api/payments/webhook').send(payload);
    const b = await request(app).post('/api/payments/webhook').send(payload);

    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(b.body.duplicate).toBe(true);   // recognised, not re-applied
  });
});

describe('Payment ownership', () => {
  it('does not let you pay for someone else\'s order', async () => {
    const city = await makeCity();
    const owner = await makeUser('customer');
    const stranger = await makeUser('customer');
    const order = await makeOrder(owner, city);

    const res = await request(app)
      .post(`/api/payments/${order.id}/pay`)
      .set('Authorization', `Bearer ${tokenFor(stranger)}`)
      .send({ payment_method: 'ecocash', payment_phone: '0771234567' });

    expect(res.status).toBe(403);
  });
});
