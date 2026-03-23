/**
 * Admin ↔ User Direct Messaging Routes
 * Mounted at: /api/admin-chat
 */
const express = require('express');
const { auth, adminOnly } = require('../middleware/authMiddleware');
const { query } = require('../config/database');

const router = express.Router();

/* ─── helpers ─── */
function mapMsg(row) {
  return {
    id:        Number(row.id),
    userId:    Number(row.user_id),
    sender:    row.sender,
    message:   row.message,
    isRead:    Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

/* ─── ADMIN: list all conversations (one row per user who has messages) ─── */
router.get('/conversations', auth, adminOnly, async (req, res) => {
  try {
    const rows = await query(`
      SELECT
        u.id                           AS user_id,
        u.name                         AS user_name,
        u.email                        AS user_email,
        MAX(m.created_at)              AS last_message_at,
        SUM(m.is_read = 0 AND m.sender = 'user') AS unread_count,
        (SELECT message FROM admin_messages
          WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM users u
      JOIN admin_messages m ON m.user_id = u.id
      WHERE u.role != 'admin'
      GROUP BY u.id, u.name, u.email
      ORDER BY last_message_at DESC
    `);
    res.json(rows.map(r => ({
      userId:      Number(r.user_id),
      name:        r.user_name,
      email:       r.user_email,
      lastMessage: r.last_message,
      lastAt:      r.last_message_at,
      unread:      Number(r.unread_count || 0),
    })));
  } catch (err) {
    console.error('admin-chat/conversations error:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ─── ADMIN: get messages for a specific user ─── */
router.get('/messages/:userId', auth, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const rows = await query(
      'SELECT * FROM admin_messages WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );
    // Mark user messages as read
    await query(
      "UPDATE admin_messages SET is_read = 1 WHERE user_id = ? AND sender = 'user' AND is_read = 0",
      [userId]
    );
    res.json(rows.map(mapMsg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── ADMIN: send a message to a user ─── */
router.post('/send/:userId', auth, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    const result = await query(
      "INSERT INTO admin_messages (user_id, sender, message) VALUES (?, 'admin', ?)",
      [userId, message.trim()]
    );
    const rows = await query('SELECT * FROM admin_messages WHERE id = ?', [result.insertId]);
    const msg = mapMsg(rows[0]);

    // Emit via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`admin_chat_${userId}`).emit('admin_chat_message', msg);
    }

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── USER: get own messages with admin ─── */
router.get('/my-messages', auth, async (req, res) => {
  try {
    const userId = req.user;
    const rows = await query(
      'SELECT * FROM admin_messages WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );
    // Mark admin messages as read from user side
    await query(
      "UPDATE admin_messages SET is_read = 1 WHERE user_id = ? AND sender = 'admin' AND is_read = 0",
      [userId]
    );
    res.json(rows.map(mapMsg));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── USER: send a message to admin ─── */
router.post('/send', auth, async (req, res) => {
  try {
    const userId = req.user;
    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message is required' });

    const result = await query(
      "INSERT INTO admin_messages (user_id, sender, message) VALUES (?, 'user', ?)",
      [userId, message.trim()]
    );
    const rows = await query('SELECT * FROM admin_messages WHERE id = ?', [result.insertId]);
    const msg = mapMsg(rows[0]);

    // Notify admin via socket
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('admin_chat_message', { ...msg, fromUser: true });
      io.to(`admin_chat_${userId}`).emit('admin_chat_message', msg);
    }

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── USER: unread count (for badge) ─── */
router.get('/unread', auth, async (req, res) => {
  try {
    const userId = req.user;
    const rows = await query(
      "SELECT COUNT(*) AS cnt FROM admin_messages WHERE user_id = ? AND sender = 'admin' AND is_read = 0",
      [userId]
    );
    res.json({ unread: Number(rows[0].cnt) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
