const router=require('express').Router();
const {authenticate,requireRole}=require('../middleware/auth.middleware');
const {USER_ROLE}=require('../config/constants');
const {validateRequest}=require('../middleware/validateRequest');
const c=require('../controllers/revenueRecognition.controller');
const s=require('../validators/profitability.validator');
router.use(authenticate);router.use(requireRole(USER_ROLE.ADMIN));router.get('/',c.list);router.post('/:scheduleId/recognize',validateRequest(s.scheduleParams,'params'),validateRequest(s.recognitionBody),c.recognize);router.post('/:scheduleId/reverse',validateRequest(s.scheduleParams,'params'),validateRequest(s.recognitionBody),c.reverse);module.exports=router;
