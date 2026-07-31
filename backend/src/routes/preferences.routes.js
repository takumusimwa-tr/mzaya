const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  getPreferences,
  updatePreferences,
} = require('../controllers/preferences.controller');
const {
  updatePreferencesSchema,
} = require('../validators/preferences.validator');

router.use(authenticate);

router.get('/', getPreferences);

router.put(
  '/',
  validateRequest(updatePreferencesSchema, 'body'),
  updatePreferences
);

module.exports = router;
