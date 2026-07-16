// backend/src/middleware/requestId.middleware.js
//
// Give every request an id, and put it on the response.
//
// Without this, a production incident looks like: a customer says "my payment
// failed around 3pm", and you go hunting through logs for anything that might be
// theirs. With it, they (or your support screen) can quote a single id and you
// pull the exact request, the exact payment attempt, and the exact provider
// callback — end to end.
//
// It also survives a proxy: Render/Cloudflare will pass through an inbound
// X-Request-Id, so a trace can span services rather than restarting at our door.
const crypto = require('crypto');

function requestId(req, res, next) {
  // Honour an upstream id if there is one, so traces join up across services.
  const incoming = req.headers['x-request-id'] || req.headers['x-correlation-id'];

  req.id = (typeof incoming === 'string' && incoming.length <= 100 && /^[\w-]+$/.test(incoming))
    ? incoming
    : crypto.randomUUID();

  // Echo it back — the client can show it in an error message, and support can
  // ask for it.
  res.setHeader('X-Request-Id', req.id);

  next();
}

module.exports = { requestId };
