const { query } = require('../config/database');
const { toBoolean, normalizeDate } = require('../utils/sql');

function mapUser(row, includePassword = false) {
  if (!row) {
    return null;
  }

  const user = {
    id: Number(row.id),
    _id: Number(row.id),
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    address: row.address || '',
    emergencyContact: row.emergency_contact || '',
    petName: row.pet_name,
    role: row.role,
    status: row.status,
    isActive: toBoolean(row.is_active),
    subscriptionTier: row.subscription_tier,
    subscriptionExpiry: normalizeDate(row.subscription_expiry),
    lastLoginAt: normalizeDate(row.last_login_at),
    reactivationRequest: {
      requested: toBoolean(row.reactivation_requested),
      reason: row.reactivation_reason,
      requestedAt: normalizeDate(row.reactivation_requested_at),
      status: row.reactivation_status,
      adminResponse: row.reactivation_admin_response,
      respondedAt: normalizeDate(row.reactivation_responded_at)
    },
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };

  if (includePassword) {
    user.password = row.password;
    user.resetPasswordCode = row.reset_password_code;
    user.resetPasswordExpires = normalizeDate(row.reset_password_expires);
  }

  return user;
}

async function findById(id, options = {}) {
  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return mapUser(rows[0], options.includePassword);
}

async function create(data) {
  try {
    const result = await query(
      `INSERT INTO users (name, email, mobile, password, role, pet_name, status, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 1)`,
      [
        data.name.trim(),
        data.email.trim().toLowerCase(),
        data.mobile ? data.mobile.trim() : null,
        data.password,
        data.role || 'user',
        data.petName ? data.petName.trim() : null
      ]
    );

    console.log(`User created successfully, ID: ${result.insertId}`);
    return await findById(result.insertId);
  } catch (error) {
    console.error('User.create SQL error:', {
      sql: 'INSERT users',
      message: error.message,
      code: error.code,
      data
    });
    throw error;
  }
}

async function findByEmail(email, options = {}) {
  try {
    const rows = await query('SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
    return mapUser(rows[0], options.includePassword);
  } catch (error) {
    console.error('User.findByEmail SQL error:', error.message);
    throw error;
  }
}

async function updateLastLogin(id) {
  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id]);
}

async function setResetCode(email, code, expiresAt) {
  await query(
    'UPDATE users SET reset_password_code = ?, reset_password_expires = ? WHERE LOWER(email) = LOWER(?)',
    [code, expiresAt, email]
  );
}

async function updatePassword(id, hashedPassword) {
  await query(
    `UPDATE users
     SET password = ?, reset_password_code = NULL, reset_password_expires = NULL
     WHERE id = ?`,
    [hashedPassword, id]
  );
}

async function updateProfile(id, data) {
  await query(
    `UPDATE users 
     SET name = ?, mobile = ?, address = ?, emergency_contact = ?
     WHERE id = ?`,
    [data.name, data.mobile, data.address, data.emergencyContact, id]
  );
  return findById(id);
}

async function requestReactivation(email, reason) {
  await query(
    `UPDATE users
     SET reactivation_requested = 1,
         reactivation_reason = ?,
         reactivation_status = 'pending',
         reactivation_requested_at = NOW(),
         reactivation_responded_at = NULL,
         reactivation_admin_response = NULL
     WHERE LOWER(email) = LOWER(?)`,
    [reason, email]
  );
}

async function listAll() {
  const rows = await query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map((row) => mapUser(row));
}

async function listAdmins() {
  const rows = await query("SELECT * FROM users WHERE role = 'admin' ORDER BY created_at DESC");
  return rows.map((row) => mapUser(row));
}

module.exports = {
  findById,
  findByEmail,
  create,
  updateLastLogin,
  setResetCode,
  updatePassword,
  updateProfile,
  requestReactivation,
  listAdmins,
  listAll,
  query
};
