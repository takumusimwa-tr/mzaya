/**
 * ============================================================================
 * MZAYA
 * Middleware: Request Validation
 * Path: backend/src/middleware/validateRequest.js
 * ----------------------------------------------------------------------------
 * Validates request body, params, or query against a Joi schema and replaces the
 * selected request segment with the normalized value returned by Joi.
 * ============================================================================
 */

function validationResponse(res, error) {
  return res.status(400).json({
    error: 'Invalid request',
    details: error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    })),
  });
}

function validateRequest(schema, segment = 'body') {
  if (!schema || typeof schema.validate !== 'function') {
    throw new TypeError('validateRequest requires a Joi schema');
  }

  if (!['body', 'params', 'query'].includes(segment)) {
    throw new TypeError(`Unsupported request segment: ${segment}`);
  }

  return (req, res, next) => {
    const { value, error } = schema.validate(req[segment], {
      abortEarly: false,
      convert: true,
      stripUnknown: false,
    });

    if (error) return validationResponse(res, error);

    req[segment] = value;
    return next();
  };
}

module.exports = { validateRequest, validationResponse };
