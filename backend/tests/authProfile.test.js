const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/userModel');

describe('authenticated profile contract', () => {
  async function register(phone, email = null) {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Profile Test',
        phone,
        email,
        password: 'Passw0rd!',
        role: 'customer',
      });
    expect(response.status).toBe(201);
    return response.body;
  }

  test('updates safe profile fields and reissues a usable token', async () => {
    const account = await register('+263771000101', 'old-profile@example.com');

    const updated = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${account.token}`)
      .send({
        name: 'Updated Profile',
        phone: '+263771000102',
        email: 'NEW-PROFILE@EXAMPLE.COM',
        role: 'admin',
        isVerified: true,
      });

    expect(updated.status).toBe(200);
    expect(updated.body.user.name).toBe('Updated Profile');
    expect(updated.body.user.phone).toBe('+263771000102');
    expect(updated.body.user.email).toBe('new-profile@example.com');
    expect(updated.body.user.role).toBe('customer');
    expect(updated.body.user.isVerified).toBe(false);
    expect(updated.body.user.password).toBeUndefined();
    expect(updated.body.token).toBeTruthy();

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${updated.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.phone).toBe('+263771000102');
  });

  test('rejects phone and email collisions without mutating the account', async () => {
    await register('+263771000201', 'taken@example.com');
    const account = await register('+263771000202', 'mine@example.com');

    const phoneConflict = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${account.token}`)
      .send({ phone: '+263771000201' });

    expect(phoneConflict.status).toBe(409);

    const emailConflict = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${account.token}`)
      .send({ email: 'TAKEN@EXAMPLE.COM' });

    expect(emailConflict.status).toBe(409);

    const stored = await User.findOne({ where: { phone: '+263771000202' } });
    expect(stored.email).toBe('mine@example.com');
  });

  test('does not expose privileged fields through self-service updates', async () => {
    const account = await register('+263771000301');

    const response = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${account.token}`)
      .send({
        role: 'admin',
        isVerified: true,
        password: 'different-password',
        city_id: '00000000-0000-0000-0000-000000000000',
        location: { lat: 1, lng: 2 },
      });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe('customer');
    expect(response.body.user.isVerified).toBe(false);
    expect(response.body.user.city_id).toBeNull();
    expect(response.body.user.location).toBeNull();
  });
});
