// backend/src/routes/chat.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { listMessages, sendMessage, orderContacts } = require('../controllers/chat.controller');

router.get('/:id/messages',  authenticate, listMessages);
router.post('/:id/messages', authenticate, sendMessage);
router.get('/:id/contacts',  authenticate, orderContacts);

module.exports = router;
