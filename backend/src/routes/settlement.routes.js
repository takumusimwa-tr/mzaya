const router = require('express').Router();
const {
  authenticate,
  requireRole,
} = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const profileController = require('../controllers/settlementProfile.controller');
const settlementController = require('../controllers/settlement.controller');
const schemas = require('../validators/settlement.validator');

router.use(authenticate);
router.use(requireRole(USER_ROLE.ADMIN));

router.put(
  '/profiles',
  validateRequest(schemas.upsertProfileSchema),
  profileController.upsert
);

router.post(
  '/batches',
  validateRequest(schemas.createBatchSchema),
  settlementController.createBatch
);

router.get(
  '/batches/:batchId',
  validateRequest(schemas.batchIdParamsSchema, 'params'),
  settlementController.getBatch
);

router.patch(
  '/batches/:batchId/approve',
  validateRequest(schemas.batchIdParamsSchema, 'params'),
  settlementController.approveBatch
);

router.post(
  '/batches/:batchId/submit',
  validateRequest(schemas.batchIdParamsSchema, 'params'),
  settlementController.submitBatch
);

router.post(
  '/adjustments',
  validateRequest(schemas.createAdjustmentSchema),
  settlementController.createAdjustment
);

module.exports = router;
