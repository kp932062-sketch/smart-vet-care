const crypto = require('crypto');
const { query } = require('../config/database');
const { parseJson, toBoolean, normalizeDate, toJson } = require('../utils/sql');

function mapDoctor(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    _id: Number(row.id),
    userId: row.user_id ? Number(row.user_id) : null,
    name: row.name,
    email: row.email,
    phone: row.phone,
    specialization: row.specialization,
    experience: Number(row.experience || 0),
    qualifications: row.qualifications,
    consultationFee: Number(row.consultation_fee || 0),
    licenseNumber: row.license_number,
    isAvailable: toBoolean(row.is_available),
    isOnline: toBoolean(row.is_online),
    approved: toBoolean(row.approved),
    status: row.status,
    uniqueAccessLink: row.unique_access_link,
    profileImage: row.profile_image,
    bio: row.bio,
    languages: parseJson(row.languages, []),
    workingHours: parseJson(row.working_hours, {}),
    documents: parseJson(row.documents, {}),
    profileCompleteness: Number(row.profile_completeness || 0),
    bankDetails: {
      accountHolderName: row.bank_account_holder_name,
      accountNumber: row.bank_account_number,
      ifscCode: row.bank_ifsc_code,
      bankName: row.bank_name,
      verified: toBoolean(row.bank_verified)
    },
    submittedAt: normalizeDate(row.submitted_at),
    approvedAt: normalizeDate(row.approved_at),
    rejectedAt: normalizeDate(row.rejected_at),
    rejectionReason: row.rejection_reason,
    lastLoginAt: normalizeDate(row.last_login_at),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

function calculateProfileCompleteness(data, documents = {}) {
  const requiredFields = ['name', 'email', 'phone', 'specialization', 'experience', 'qualifications', 'consultationFee'];
  const requiredDocs = ['license', 'degree', 'photo', 'idProof'];
  const fieldScore = (requiredFields.filter((field) => data[field]).length / requiredFields.length) * 60;
  const docScore = (requiredDocs.filter((field) => documents[field]).length / requiredDocs.length) * 40;
  return Math.round(fieldScore + docScore);
}

async function findById(id) {
  const rows = await query('SELECT * FROM doctors WHERE id = ? LIMIT 1', [id]);
  return mapDoctor(rows[0]);
}

async function findByEmail(email) {
  const rows = await query('SELECT * FROM doctors WHERE LOWER(email) = LOWER(?) LIMIT 1', [email]);
  return mapDoctor(rows[0]);
}

async function findByAccessLink(token) {
  const rows = await query(
    `SELECT * FROM doctors
     WHERE unique_access_link = ? AND approved = 1 AND status = 'active'
     LIMIT 1`,
    [token]
  );
  return mapDoctor(rows[0]);
}

async function listApproved() {
  const rows = await query(
    "SELECT * FROM doctors WHERE approved = 1 AND status = 'active' ORDER BY created_at DESC"
  );
  return rows.map((row) => mapDoctor(row));
}

async function listPending() {
  const rows = await query(
    "SELECT * FROM doctors WHERE approved = 0 AND status <> 'rejected' ORDER BY created_at DESC"
  );
  return rows.map((row) => mapDoctor(row));
}

async function createApplication(data) {
  const documents = data.documents || {};
  const profileCompleteness = calculateProfileCompleteness(data, documents);

  const result = await query(
    `INSERT INTO doctors (
      name, email, phone, specialization, experience, qualifications, consultation_fee,
      license_number, bio, languages, working_hours, documents, profile_completeness,
      approved, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', NOW())`,
    [
      data.name,
      data.email.toLowerCase(),
      data.phone || null,
      data.specialization || null,
      Number(data.experience || 0),
      data.qualifications || null,
      Number(data.consultationFee || 500),
      data.licenseNumber || null,
      data.bio || null,
      toJson(data.languages || []),
      toJson(data.workingHours || {}),
      toJson(documents),
      profileCompleteness
    ]
  );

  return findById(result.insertId);
}

async function updateById(id, data) {
  await query(
    `UPDATE doctors
     SET name = COALESCE(?, name),
         phone = COALESCE(?, phone),
         specialization = COALESCE(?, specialization),
         experience = COALESCE(?, experience),
         qualifications = COALESCE(?, qualifications),
         consultation_fee = COALESCE(?, consultation_fee),
         bio = COALESCE(?, bio),
         languages = COALESCE(?, languages),
         working_hours = COALESCE(?, working_hours),
         is_available = COALESCE(?, is_available),
         profile_image = COALESCE(?, profile_image)
     WHERE id = ?`,
    [
      data.name ?? null,
      data.phone ?? null,
      data.specialization ?? null,
      data.experience ?? null,
      data.qualifications ?? null,
      data.consultationFee ?? null,
      data.bio ?? null,
      data.languages ? toJson(data.languages) : null,
      data.workingHours ? toJson(data.workingHours) : null,
      data.isAvailable == null ? null : Number(Boolean(data.isAvailable)),
      data.profileImage ?? null,
      id
    ]
  );

  return findById(id);
}

async function updateBanking(id, bankDetails) {
  await query(
    `UPDATE doctors
     SET bank_account_holder_name = ?,
         bank_account_number = ?,
         bank_ifsc_code = ?,
         bank_name = ?,
         bank_verified = 0
     WHERE id = ?`,
    [
      bankDetails.accountHolderName,
      bankDetails.accountNumber,
      bankDetails.ifscCode,
      bankDetails.bankName,
      id
    ]
  );

  return findById(id);
}

async function approve(id) {
  const accessLink = crypto.randomBytes(24).toString('hex');
  await query(
    `UPDATE doctors
     SET approved = 1,
         status = 'active',
         unique_access_link = ?,
         approved_at = NOW()
     WHERE id = ?`,
    [accessLink, id]
  );
  return findById(id);
}

async function reject(id, reason) {
  await query(
    `UPDATE doctors
     SET approved = 0,
         status = 'rejected',
         rejection_reason = ?,
         rejected_at = NOW()
     WHERE id = ?`,
    [reason || 'Application requirements not met', id]
  );
  return findById(id);
}

async function remove(id) {
  const doctor = await findById(id);
  if (!doctor) {
    return null;
  }
  await query('DELETE FROM doctors WHERE id = ?', [id]);
  return doctor;
}

async function touchLastLogin(id) {
  await query('UPDATE doctors SET last_login_at = NOW() WHERE id = ?', [id]);
}

module.exports = {
  calculateProfileCompleteness,
  findById,
  findByEmail,
  findByAccessLink,
  listApproved,
  listPending,
  createApplication,
  updateById,
  updateBanking,
  approve,
  reject,
  remove,
  touchLastLogin
};
