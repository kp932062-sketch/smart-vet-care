const { query } = require('../config/database');

function mapChat(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    userId: Number(row.user_id),
    adminId: row.admin_id == null ? null : Number(row.admin_id),
    createdAt: row.created_at
  };
}

function mapMessage(row) {
  if (!row) return null;

  return {
    id: Number(row.id),
    chatId: Number(row.chat_id),
    senderId: row.sender_id == null ? null : Number(row.sender_id),
    senderRole: row.sender_role,
    message: row.message,
    createdAt: row.created_at
  };
}

async function getDefaultAdminUserId() {
  const rows = await query(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1"
  );

  return rows[0] ? Number(rows[0].id) : null;
}

async function findChatById(chatId) {
  const rows = await query('SELECT * FROM chats WHERE id = ? LIMIT 1', [chatId]);
  return mapChat(rows[0]);
}

async function findChatByUserId(userId) {
  const rows = await query('SELECT * FROM chats WHERE user_id = ? LIMIT 1', [userId]);
  return mapChat(rows[0]);
}

async function getOrCreateUserChat(userId) {
  const existing = await findChatByUserId(userId);
  if (existing) {
    return existing;
  }

  const adminId = await getDefaultAdminUserId();

  const result = await query('INSERT INTO chats (user_id, admin_id) VALUES (?, ?)', [
    userId,
    adminId
  ]);

  return findChatById(result.insertId);
}

async function listMessagesByChatId(chatId) {
  const rows = await query(
    'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC, id ASC',
    [chatId]
  );

  return rows.map(mapMessage);
}

async function createMessage(data) {
  const result = await query(
    `INSERT INTO messages (chat_id, sender_id, sender_role, message)
     VALUES (?, ?, ?, ?)`,
    [data.chatId, data.senderId || null, data.senderRole, data.message]
  );

  const rows = await query('SELECT * FROM messages WHERE id = ? LIMIT 1', [result.insertId]);
  return mapMessage(rows[0]);
}

async function listConversationsForAdmin() {
  const rows = await query(
    `SELECT
      c.id AS chat_id,
      c.user_id,
      c.admin_id,
      c.created_at,
      u.name AS user_name,
      u.email AS user_email,
      m_last.message AS last_message,
      m_last.created_at AS last_message_at
    FROM chats c
    INNER JOIN users u ON u.id = c.user_id
    LEFT JOIN messages m_last ON m_last.id = (
      SELECT m2.id
      FROM messages m2
      WHERE m2.chat_id = c.id
      ORDER BY m2.created_at DESC, m2.id DESC
      LIMIT 1
    )
    ORDER BY COALESCE(m_last.created_at, c.created_at) DESC`
  );

  return rows.map((row) => ({
    id: Number(row.chat_id),
    userId: Number(row.user_id),
    adminId: row.admin_id == null ? null : Number(row.admin_id),
    createdAt: row.created_at,
    user: {
      id: Number(row.user_id),
      name: row.user_name,
      email: row.user_email
    },
    lastMessage: row.last_message || null,
    lastMessageAt: row.last_message_at || null
  }));
}

module.exports = {
  getDefaultAdminUserId,
  findChatById,
  findChatByUserId,
  getOrCreateUserChat,
  listMessagesByChatId,
  createMessage,
  listConversationsForAdmin
};
