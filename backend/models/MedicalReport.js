const { query } = require('../config/database');

function mapMedicalReport(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    appointment_id: row.appointment_id == null ? null : Number(row.appointment_id),
    appointment_uid: row.appointment_uid,
    pet_name: row.pet_name,
    owner_name: row.owner_name,
    doctor_name: row.doctor_name,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    prescription: row.prescription,
    notes: row.notes,
    qr_code_data_url: row.qr_code_data_url,
    report_date: row.report_date,
    created_at: row.created_at,
    appointment_date: row.appointment_date || null,
    user_id: row.user_id == null ? null : Number(row.user_id),
    doctor_id: row.doctor_id == null ? null : Number(row.doctor_id)
  };
}

function buildAdminSearch(searchTerm = '') {
  const normalized = String(searchTerm || '').trim();
  const hasSearch = normalized.length > 0;
  const like = `%${normalized}%`;

  return {
    hasSearch,
    whereSql: hasSearch
      ? 'WHERE mr.appointment_uid LIKE ? OR mr.pet_name LIKE ? OR mr.owner_name LIKE ? OR mr.doctor_name LIKE ?'
      : '',
    whereParams: hasSearch ? [like, like, like, like] : []
  };
}

async function listAll({ searchTerm = '', page = 1, limit = 10 } = {}) {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  const offset = (parsedPage - 1) * parsedLimit;
  const { whereSql, whereParams } = buildAdminSearch(searchTerm);

  const countRows = await query(
    `SELECT COUNT(*) AS total
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     ${whereSql}`,
    whereParams
  );

  const total = Number(countRows[0]?.total || 0);

  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     ${whereSql}
     ORDER BY mr.report_date DESC, mr.id DESC
     LIMIT ${parsedLimit} OFFSET ${offset}`,
    whereParams
  );

  return {
    data: rows.map(mapMedicalReport),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / parsedLimit))
    }
  };
}

async function listAllForExport(searchTerm = '') {
  const { whereSql, whereParams } = buildAdminSearch(searchTerm);

  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     ${whereSql}
     ORDER BY mr.report_date DESC, mr.id DESC`,
    whereParams
  );

  return rows.map(mapMedicalReport);
}

async function findById(id) {
  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     WHERE mr.id = ?
     LIMIT 1`,
    [id]
  );

  return mapMedicalReport(rows[0]);
}

async function findByAppointmentId(appointmentId) {
  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     WHERE mr.appointment_id = ?
     LIMIT 1`,
    [appointmentId]
  );

  return mapMedicalReport(rows[0]);
}

async function findByAppointmentUid(appointmentUid) {
  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     LEFT JOIN appointments a ON a.id = mr.appointment_id
     WHERE mr.appointment_uid = ?
     LIMIT 1`,
    [appointmentUid]
  );

  return mapMedicalReport(rows[0]);
}

async function listByUserId(userId, searchTerm = '') {
  const normalized = String(searchTerm || '').trim();
  const hasSearch = normalized.length > 0;
  const like = `%${normalized}%`;

  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     INNER JOIN appointments a ON a.id = mr.appointment_id
     WHERE a.user_id = ?
       ${hasSearch ? 'AND (mr.appointment_uid LIKE ? OR mr.pet_name LIKE ? OR mr.doctor_name LIKE ?)' : ''}
     ORDER BY mr.report_date DESC, mr.id DESC`,
    hasSearch ? [userId, like, like, like] : [userId]
  );

  return rows.map(mapMedicalReport);
}

async function findByIdForUser(id, userId) {
  const rows = await query(
    `SELECT
       mr.*,
       a.user_id,
       a.doctor_id,
       a.appointment_date
     FROM medical_reports mr
     INNER JOIN appointments a ON a.id = mr.appointment_id
     WHERE mr.id = ? AND a.user_id = ?
     LIMIT 1`,
    [id, userId]
  );

  return mapMedicalReport(rows[0]);
}

async function getAppointmentContextById(appointmentId) {
  const rows = await query(
    `SELECT
       a.id,
       a.appointment_uid,
       a.qr_code_data_url,
       a.appointment_date,
       a.user_id,
       a.doctor_id,
       a.pet_name,
       u.name AS owner_name,
       d.name AS doctor_name
     FROM appointments a
     INNER JOIN users u ON u.id = a.user_id
     INNER JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = ?
     LIMIT 1`,
    [appointmentId]
  );

  return rows[0] || null;
}

async function getAppointmentContextByUid(appointmentUid) {
  const rows = await query(
    `SELECT
       a.id,
       a.appointment_uid,
       a.qr_code_data_url,
       a.appointment_date,
       a.user_id,
       a.doctor_id,
       a.pet_name,
       u.name AS owner_name,
       d.name AS doctor_name
     FROM appointments a
     INNER JOIN users u ON u.id = a.user_id
     INNER JOIN doctors d ON d.id = a.doctor_id
     WHERE a.appointment_uid = ?
     LIMIT 1`,
    [appointmentUid]
  );

  return rows[0] || null;
}

async function create(data) {
  const result = await query(
    `INSERT INTO medical_reports (
      appointment_id,
      appointment_uid,
      pet_name,
      owner_name,
      doctor_name,
      diagnosis,
      treatment,
      prescription,
      notes,
      qr_code_data_url,
      report_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.appointment_id,
      data.appointment_uid,
      data.pet_name,
      data.owner_name,
      data.doctor_name,
      data.diagnosis,
      data.treatment,
      data.prescription,
      data.notes,
      data.qr_code_data_url || null,
      data.report_date
    ]
  );

  return findById(result.insertId);
}

async function update(id, data) {
  await query(
    `UPDATE medical_reports
     SET
       appointment_id = ?,
       appointment_uid = ?,
       pet_name = ?,
       owner_name = ?,
       doctor_name = ?,
       diagnosis = ?,
       treatment = ?,
       prescription = ?,
       notes = ?,
       qr_code_data_url = ?,
       report_date = ?
     WHERE id = ?`,
    [
      data.appointment_id,
      data.appointment_uid,
      data.pet_name,
      data.owner_name,
      data.doctor_name,
      data.diagnosis,
      data.treatment,
      data.prescription,
      data.notes,
      data.qr_code_data_url || null,
      data.report_date,
      id
    ]
  );

  return findById(id);
}

module.exports = {
  listAll,
  listAllForExport,
  findById,
  findByAppointmentId,
  findByAppointmentUid,
  listByUserId,
  findByIdForUser,
  getAppointmentContextById,
  getAppointmentContextByUid,
  create,
  update
};