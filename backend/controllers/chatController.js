const Chat = require('../models/Chat');

function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function normalizeMessage(value) {
  const text = String(value || '').trim();
  return text || null;
}

async function ensureChatAccess(chatId, req) {
  const chat = await Chat.findChatById(chatId);
  if (!chat) {
    return { error: { status: 404, message: 'Chat not found.' } };
  }

  if (req.userRole === 'admin') {
    return { chat };
  }

  if (req.userRole === 'user' || req.userRole === 'farmer') {
    if (Number(chat.userId) !== Number(req.user)) {
      return { error: { status: 403, message: 'Access denied for this chat.' } };
    }
    return { chat };
  }

  return { error: { status: 403, message: 'Only user/admin roles can access this chat.' } };
}

async function getMyChat(req, res) {
  try {
    if (req.userRole !== 'user' && req.userRole !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only users can access personal chat.' });
    }

    const chat = await Chat.getOrCreateUserChat(req.user);
    return res.json({ success: true, data: chat });
  } catch (error) {
    console.error('Get my chat error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load chat.' });
  }
}

async function listAdminConversations(req, res) {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const conversations = await Chat.listConversationsForAdmin();
    return res.json({ success: true, count: conversations.length, data: conversations });
  } catch (error) {
    console.error('List admin conversations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
}

async function getChatMessages(req, res) {
  try {
    const chatId = toPositiveInt(req.params.chatId);
    if (!chatId) {
      return res.status(400).json({ success: false, message: 'Invalid chat id.' });
    }

    const access = await ensureChatAccess(chatId, req);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const messages = await Chat.listMessagesByChatId(chatId);
    return res.json({ success: true, chat: access.chat, count: messages.length, data: messages });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
}

async function postMessage(req, res) {
  try {
    const chatId = toPositiveInt(req.body?.chatId);
    const message = normalizeMessage(req.body?.message);

    if (!chatId) {
      return res.status(400).json({ success: false, message: 'chatId is required.' });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required.' });
    }

    const access = await ensureChatAccess(chatId, req);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const senderRole = req.userRole === 'admin' ? 'admin' : 'user';
    const senderId = Number.isInteger(Number(req.user)) ? Number(req.user) : null;

    const created = await Chat.createMessage({
      chatId,
      senderId,
      senderRole,
      message
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chatId}`).emit('receive_message', created);
    }

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Post message error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
}

module.exports = {
  getMyChat,
  listAdminConversations,
  getChatMessages,
  postMessage
};
