/**
 * ============================================================================
 * MZAYA
 * Test Suite: Vendor Security and Validation
 * Path: backend/tests/vendors.test.js
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Prevents regressions in vendor ownership, branch approval and menu isolation.
 *
 * Change Log
 * ----------
 * July 2026 — Initial security regression suite.
 * ============================================================================
 */

const request = require('supertest');
const app = require('../src/app');
const {
  models,
  resetDatabase,
  makeCity,
  makeUser,
  makeVendor,
  makeMenuItem,
  tokenFor,
} = require('./setup');

const { Vendor, MenuItem } = models;

beforeAll(resetDatabase);

describe('Vendor profile authorization', () => {
  it('does not let one vendor update another vendor branch', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const outsider = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);
    await makeVendor(outsider, city);

    const response = await request(app)
      .put(`/api/vendors/${branch.id}`)
      .set('Authorization', `Bearer ${tokenFor(outsider)}`)
      .send({ name: 'Hijacked name' });

    expect(response.status).toBe(403);

    const fresh = await Vendor.findByPk(branch.id);
    expect(fresh.name).not.toBe('Hijacked name');
  });

  it('does not let a vendor self-approve a pending branch', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city, { is_active: false });

    const response = await request(app)
      .put(`/api/vendors/${branch.id}`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`)
      .send({ is_active: true });

    expect(response.status).toBe(400);

    const fresh = await Vendor.findByPk(branch.id);
    expect(fresh.is_active).toBe(false);
  });

  it('accepts the canonical opening-hours shape', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);

    const day = { open: '08:00', close: '20:00', closed: false };
    const openingHours = {
      mon: day,
      tue: day,
      wed: day,
      thu: day,
      fri: day,
      sat: day,
      sun: { ...day, closed: true },
    };

    const response = await request(app)
      .put(`/api/vendors/${branch.id}`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`)
      .send({ opening_hours: openingHours });

    expect(response.status).toBe(200);
    expect(response.body.vendor.opening_hours.sun.closed).toBe(true);
  });

  it('rejects malformed opening-hour times', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);

    const response = await request(app)
      .put(`/api/vendors/${branch.id}`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`)
      .send({
        opening_hours: {
          mon: { open: '25:00', close: '20:00', closed: false },
        },
      });

    expect(response.status).toBe(400);
  });
});

describe('Vendor menu isolation', () => {
  it('does not let one vendor add an item to another vendor menu', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const outsider = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);
    await makeVendor(outsider, city);

    const response = await request(app)
      .post(`/api/vendors/${branch.id}/menu`)
      .set('Authorization', `Bearer ${tokenFor(outsider)}`)
      .send({ name: 'Injected item', price_usd: 10 });

    expect(response.status).toBe(403);
    expect(
      await MenuItem.count({ where: { vendor_id: branch.id } })
    ).toBe(0);
  });

  it('does not let one vendor edit another vendor menu item', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const outsider = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);
    await makeVendor(outsider, city);
    const item = await makeMenuItem(branch);

    const response = await request(app)
      .put(`/api/vendors/${branch.id}/menu/${item.id}`)
      .set('Authorization', `Bearer ${tokenFor(outsider)}`)
      .send({ price_usd: 0.01 });

    expect(response.status).toBe(403);

    const fresh = await MenuItem.findByPk(item.id);
    expect(Number(fresh.price_usd)).toBe(5);
  });

  it('does not accept an item ID belonging to a different vendor URL', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const { branch: branchA } = await makeVendor(owner, city);
    const { branch: branchB } = await makeVendor(owner, city);
    const item = await makeMenuItem(branchA);

    const response = await request(app)
      .delete(`/api/vendors/${branchB.id}/menu/${item.id}`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`);

    expect(response.status).toBe(404);
    expect(await MenuItem.findByPk(item.id)).toBeTruthy();
  });

  it('rejects negative prices and unknown menu fields', async () => {
    const city = await makeCity();
    const owner = await makeUser('vendor');
    const { branch } = await makeVendor(owner, city);

    const response = await request(app)
      .post(`/api/vendors/${branch.id}/menu`)
      .set('Authorization', `Bearer ${tokenFor(owner)}`)
      .send({
        name: 'Unsafe item',
        price_usd: -5,
        vendor_id: 'forged',
      });

    expect(response.status).toBe(400);
  });
});
