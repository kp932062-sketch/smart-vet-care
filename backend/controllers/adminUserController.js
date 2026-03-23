const User = require('../models/User');

function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function normalizeOptionalText(value) {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

function mapAdminUser(row) {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    role: row.role,
    created_at: row.created_at
  };
}

async function getAdminCount() {
  const rows = await User.query("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'");
  return Number(rows[0]?.total || 0);
}

async function listUsers(_req, res) {
  try {
    const rows = await User.query(
      `SELECT id, name, email, mobile AS phone, status, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      count: rows.length,
      data: rows.map(mapAdminUser)
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

async function updateUser(req, res) {
  try {
    const userId = toPositiveInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    const existing = await User.findById(userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const name = normalizeOptionalText(req.body?.name);
    const email = normalizeOptionalText(req.body?.email);
    const phone = normalizeOptionalText(req.body?.phone);

    if (name !== undefined && !name) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty.' });
    }

    if (email !== undefined && !email) {
      return res.status(400).json({ success: false, message: 'Email cannot be empty.' });
    }

    if (email && email.toLowerCase() !== String(existing.email || '').toLowerCase()) {
      const alreadyUsed = await User.findByEmail(email);
      if (alreadyUsed && Number(alreadyUsed.id) !== Number(existing.id)) {
        return res.status(409).json({ success: false, message: 'Email is already in use.' });
      }
    }

    await User.query(
      `UPDATE users
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           mobile = COALESCE(?, mobile)
       WHERE id = ?`,
      [
        name === undefined ? null : name,
        email === undefined ? null : String(email || '').toLowerCase(),
        phone === undefined ? null : phone,
        userId
      ]
    );

    const updated = await User.findById(userId);
    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: mapAdminUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.mobile,
        status: updated.status,
        role: updated.role,
        created_at: updated.createdAt
      })
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

async function updateUserStatus(req, res) {
  try {
    const userId = toPositiveInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    const status = String(req.body?.status || '').trim().toLowerCase();
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be active or blocked.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (String(req.user) === String(userId) || String(req.userObj?.id) === String(userId)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own status.' });
    }

    await User.query('UPDATE users SET status = ?, is_active = ? WHERE id = ?', [
      status,
      status === 'active' ? 1 : 0,
      userId
    ]);

    return res.json({ success: true, message: `User status updated to ${status}.` });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

async function deleteUser(req, res) {
  try {
    const userId = toPositiveInt(req.params.id);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid user id.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (String(req.user) === String(userId) || String(req.userObj?.id) === String(userId)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    if (targetUser.role === 'admin') {
      const adminCount = await getAdminCount();
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin account.' });
      }
    }

    // Soft delete to preserve audit/history references.
    await User.query('UPDATE users SET status = ?, is_active = 0 WHERE id = ?', ['deleted', userId]);

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}

module.exports = {
  listUsers,
  updateUser,
  updateUserStatus,
  deleteUser
};