const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const {
  getMyChat,
  listAdminConversations,
  getChatMessages,
  postMessage
} = require('../controllers/chatController');

const router = express.Router();

router.get('/my', auth, getMyChat);
router.get('/conversations', auth, listAdminConversations);
router.get('/:chatId', auth, getChatMessages);
router.post('/message', auth, postMessage);

module.exports = router;
