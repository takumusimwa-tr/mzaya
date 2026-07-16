// backend/src/routes/chat.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { loadOrder } = require('../middleware/ownership.middleware');
const { listMessages, sendMessage, orderContacts } = require('../controllers/chat.controller');

// These routes had NO ownership guard. The controller resolved participants
// internally, but the route itself would happily run for any signed-in user with
// any order id — and /contacts returns PHONE NUMBERS. Anyone could have walked the
// UUID space and harvested customer and Mzaya numbers.
//
// loadOrder({ allow: ['any'] }) now proves the caller is actually the customer,
// the Mzaya, or the vendor on this order before the handler runs.
router.get('/:id/messages',
  authenticate,
  loadOrder({ allow: ['any'] }),
  listMessages);

router.post('/:id/messages',
  authenticate,
  loadOrder({ allow: ['any'] }),
  sendMessage);

router.get('/:id/contacts',
  authenticate,
  loadOrder({ allow: ['any'] }),
  orderContacts);

module.exports = router;
