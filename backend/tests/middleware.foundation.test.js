/**
 * ============================================================================
 * MZAYA
 * Test Suite: Middleware Foundation
 * Path: backend/tests/middleware.foundation.test.js
 * ============================================================================
 */

const express = require('express');
const request = require('supertest');
const Joi = require('joi');

const { validateRequest } = require('../src/middleware/validateRequest');
const { auditLogger } = require('../src/middleware/auditLogger');
const { notFoundHandler, errorHandler } = require('../src/middleware/errorHandler');

describe('validateRequest', () => {
  it('normalizes valid payloads before the controller runs', async () => {
    const app = express();
    app.use(express.json());

    app.post(
      '/test',
      validateRequest(
        Joi.object({
          name: Joi.string().trim().required(),
          quantity: Joi.number().integer().required(),
        }).unknown(false)
      ),
      (req, res) => res.json(req.body)
    );

    const response = await request(app)
      .post('/test')
      .send({ name: '  Ginger  ', quantity: '5' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ name: 'Ginger', quantity: 5 });
  });

  it('returns all validation failures in a canonical shape', async () => {
    const app = express();
    app.use(express.json());

    app.post(
      '/test',
      validateRequest(
        Joi.object({
          name: Joi.string().required(),
          quantity: Joi.number().min(1).required(),
        }).unknown(false)
      ),
      (_req, res) => res.json({ ok: true })
    );

    const response = await request(app)
      .post('/test')
      .send({ quantity: 0, forged: true });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Invalid request');
    expect(response.body.details.length).toBeGreaterThanOrEqual(2);
  });
});

describe('auditLogger', () => {
  it('does not change the response lifecycle', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.id = 'request-test';
      req.user = { id: 'user-test', role: 'vendor' };
      next();
    });

    app.post(
      '/audit',
      auditLogger('update', 'vendor_branch'),
      (_req, res) => res.status(204).send()
    );

    const response = await request(app).post('/audit');
    expect(response.status).toBe(204);
  });
});

describe('canonical errors', () => {
  it('returns a request ID for missing routes', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.id = 'request-404';
      next();
    });
    app.use(notFoundHandler);

    const response = await request(app).get('/missing');

    expect(response.status).toBe(404);
    expect(response.body.requestId).toBe('request-404');
  });

  it('returns controlled errors through errorHandler', async () => {
    const app = express();
    app.use((req, _res, next) => {
      req.id = 'request-500';
      next();
    });
    app.get('/explode', () => {
      const error = new Error('Controlled failure');
      error.status = 422;
      throw error;
    });
    app.use(errorHandler);

    const response = await request(app).get('/explode');

    expect(response.status).toBe(422);
    expect(response.body.error).toBe('Controlled failure');
    expect(response.body.requestId).toBe('request-500');
  });
});
