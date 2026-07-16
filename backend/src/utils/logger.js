// backend/src/utils/logger.js
//
// Structured logging.
//
// console.log is fine on a laptop and useless in production: you can't filter
// it, you can't search it, and a log aggregator can't parse it. When something
// breaks at 2am you want to grep for one order id, not scroll a wall of text.
//
// So: JSON lines in production (machine-readable, ingestible by any log service),
// human-readable in development.
//
// Deliberately dependency-free. pino/winston are excellent, but this is ~40
// lines and does the job; swapping it later means changing this file only.

const isProd = process.env.NODE_ENV === 'production';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const THRESHOLD = LEVELS[process.env.LOG_LEVEL] ?? (isProd ? LEVELS.info : LEVELS.debug);

// Never log these, whatever the caller passes.
const REDACT = ['password', 'token', 'jwt', 'authorization', 'api_key', 'apiKey',
                'secret', 'integration_key', 'cardNumber', 'cvv'];

function scrub(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const out = Array.isArray(meta) ? [] : {};
  for (const [k, v] of Object.entries(meta)) {
    if (REDACT.some((r) => k.toLowerCase().includes(r.toLowerCase()))) {
      out[k] = '[redacted]';
    } else if (v && typeof v === 'object') {
      out[k] = scrub(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function emit(level, msg, meta = {}) {
  if (LEVELS[level] > THRESHOLD) return;

  const clean = scrub(meta);

  if (isProd) {
    // One JSON object per line — what log aggregators expect.
    process.stdout.write(JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg,
      ...clean,
    }) + '\n');
    return;
  }

  // Development: readable.
  const tag = { error: '❌', warn: '⚠️ ', info: '  ', debug: '·' }[level];
  const extra = Object.keys(clean).length ? ` ${JSON.stringify(clean)}` : '';
  console.log(`${tag} ${msg}${extra}`);
}

const logger = {
  error: (msg, meta) => emit('error', msg, meta),
  warn:  (msg, meta) => emit('warn',  msg, meta),
  info:  (msg, meta) => emit('info',  msg, meta),
  debug: (msg, meta) => emit('debug', msg, meta),
};

// Express middleware: one line per request, with duration.
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    // Health checks are polled constantly; logging them is pure noise.
    if (req.path === '/health' || req.path === '/ready') return;

    const level = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'info';

    logger[level]('request', {
      reqId:  req.id,          // ties every line of this request together
      method: req.method,
      path:   req.originalUrl,
      status: res.statusCode,
      ms:     Date.now() - start,
      userId: req.user?.id,
    });
  });
  next();
}

// A logger bound to one request, so controllers don't have to pass reqId around
// by hand — and can't forget to.
//
//   req.log.error('payment_failed', { orderId })
//
// …emits with reqId and userId already attached.
function attachLogger(req, res, next) {
  const base = { reqId: req.id, userId: req.user?.id };
  req.log = {
    error: (msg, meta) => logger.error(msg, { ...base, userId: req.user?.id, ...meta }),
    warn:  (msg, meta) => logger.warn(msg,  { ...base, userId: req.user?.id, ...meta }),
    info:  (msg, meta) => logger.info(msg,  { ...base, userId: req.user?.id, ...meta }),
    debug: (msg, meta) => logger.debug(msg, { ...base, userId: req.user?.id, ...meta }),
  };
  next();
}

module.exports = { logger, requestLogger, attachLogger };
