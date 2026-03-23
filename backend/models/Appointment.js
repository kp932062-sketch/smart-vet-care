const { query } = require('../config/database');
const { parseJson, toBoolean, normalizeDate, toJson } = require('../utils/sql');
const QRCode = require('qrcode');

const generateAppointmentId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APT-${date}-${random}`;
};

async function generateUniqueAppointmentUid(maxAttempts = 25) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateAppointmentId();
    const exists = await query(
      'SELECT id FROM appointments WHERE appointment_uid = ? LIMIT 1',
      [candidate]
    );

    if (!exists.length) {
      return candidate;
    }
  }

  throw new Error('Unable to generate a unique appointment ID. Please retry.');
}

const BASE_SELECT = `
  SELECT
    a.*,
    u.id AS user_ref_id,
    u.name AS user_name,
    u.email AS user_email,
    u.mobile AS user_mobile,
    d.id AS doctor_ref_id,
    d.name AS doctor_name,
    d.specialization AS doctor_specialization,
    d.email AS doctor_email,
    d.consultation_fee AS doctor_consultation_fee,
    p.id AS pet_ref_id,
    p.name AS pet_ref_name,
    p.species AS pet_ref_species,
    p.breed AS pet_ref_breed,
    p.age AS pet_ref_age
  FROM appointments a
  LEFT JOIN users u ON u.id = a.user_id
  LEFT JOIN doctors d ON d.id = a.doctor_id
  LEFT JOIN pets p ON p.id = a.pet_id
`;

function mapAppointment(row) {
  if (!row) {
    return null;
  }

  const appointment = {
    id: Number(row.id),
    _id: Number(row.id),
    appointmentUid: row.appointment_uid,
    appointment_uid: row.appointment_uid,
    user: Number(row.user_id),
    doctor: Number(row.doctor_id),
    petId: row.pet_id ? Number(row.pet_id) : null,
    petName: row.pet_name,
    reason: row.reason,
    description: row.description,
    urgencyLevel: row.urgency_level,
    date: normalizeDate(row.appointment_date),
    appointmentDate: normalizeDate(row.appointment_date),
    status: row.status,
    confirmedAt: normalizeDate(row.confirmed_at),
    cancelledAt: normalizeDate(row.cancelled_at),
    cancellationReason: row.cancellation_reason,
    startedAt: normalizeDate(row.started_at),
    completedAt: normalizeDate(row.completed_at),
    consultation: parseJson(row.consultation, {}),
    prescription: parseJson(row.prescription, {}),
    payment: parseJson(row.payment, {}),
    qrCodeDataUrl: row.qr_code_data_url,
    reportGenerated: toBoolean(row.report_generated),
    rating: row.rating == null ? null : Number(row.rating),
    review: row.review,
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };

  if (row.user_ref_id) {
    appointment.user = {
      _id: Number(row.user_ref_id),
      id: Number(row.user_ref_id),
      name: row.user_name,
      email: row.user_email,
      mobile: row.user_mobile
    };
  }

  if (row.doctor_ref_id) {
    appointment.doctor = {
      _id: Number(row.doctor_ref_id),
      id: Number(row.doctor_ref_id),
      name: row.doctor_name,
      specialization: row.doctor_specialization,
      email: row.doctor_email,
      consultationFee: Number(row.doctor_consultation_fee || 0)
    };
  }

  if (row.pet_ref_id) {
    appointment.pet = {
      _id: Number(row.pet_ref_id),
      id: Number(row.pet_ref_id),
      name: row.pet_ref_name,
      species: row.pet_ref_species,
      breed: row.pet_ref_breed,
      age: row.pet_ref_age
    };
  }

  return appointment;
}

function buildWhere(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.id) {
    clauses.push('a.id = ?');
    params.push(filters.id);
  }

  if (filters.appointmentUid) {
    clauses.push('a.appointment_uid = ?');
    params.push(filters.appointmentUid);
  }

  if (filters.userId) {
    clauses.push('a.user_id = ?');
    params.push(filters.userId);
  }

  if (filters.doctorId) {
    clauses.push('a.doctor_id = ?');
    params.push(filters.doctorId);
  }

  if (filters.status) {
    clauses.push('a.status = ?');
    params.push(filters.status);
  }

  if (filters.date) {
    clauses.push('DATE(a.appointment_date) = DATE(?)');
    params.push(filters.date);
  }

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params
  };
}

async function findById(id) {
  const rows = await query(
    `${BASE_SELECT}
     WHERE a.id = ?
     LIMIT 1`,
    [id]
  );
  return mapAppointment(rows[0]);
}

async function findByUid(appointmentUid) {
  const rows = await query(
    `${BASE_SELECT}
     WHERE a.appointment_uid = ?
     LIMIT 1`,
    [appointmentUid]
  );
  return mapAppointment(rows[0]);
}

async function create(data) {
  const appointmentUid = await generateUniqueAppointmentUid();
  const frontendBase = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const verificationUrl = `${frontendBase}/report-verify/${encodeURIComponent(appointmentUid)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

  const result = await query(
    `INSERT INTO appointments (
      appointment_uid,
      user_id,
      doctor_id,
      pet_id,
      pet_name,
      reason,
      description,
      urgency_level,
      appointment_date,
      status,
      consultation,
      prescription,
      payment,
      qr_code_data_url,
      report_generated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 0)`,
    [
      appointmentUid,
      data.userId,
      data.doctorId,
      data.petId || null,
      data.petName || null,
      data.reason || null,
      data.description || null,
      data.urgencyLevel || 'medium',
      data.appointmentDate,
      toJson(data.consultation || {}),
      toJson(data.prescription || {}),
      toJson(data.payment || {}),
      qrCodeDataUrl
    ]
  );

  return findById(result.insertId);
}

async function listByUserId(userId) {
  const rows = await query(
    `${BASE_SELECT}
     WHERE a.user_id = ?
     ORDER BY a.appointment_date DESC`,
    [userId]
  );
  return rows.map((row) => mapAppointment(row));
}

async function listByDoctorId(doctorId, date) {
  const where = buildWhere({ doctorId, date });
  const rows = await query(
    `${BASE_SELECT}
     ${where.sql}
     ORDER BY a.appointment_date DESC`,
    where.params
  );
  return rows.map((row) => mapAppointment(row));
}

async function listAll(filters = {}) {
  const where = buildWhere(filters);
  const rows = await query(
    `${BASE_SELECT}
     ${where.sql}
     ORDER BY a.appointment_date DESC`,
    where.params
  );
  return rows.map((row) => mapAppointment(row));
}

const FIELD_MAP = {
  status: 'status',
  confirmed_at: 'confirmed_at',
  cancelled_at: 'cancelled_at',
  cancellation_reason: 'cancellation_reason',
  started_at: 'started_at',
  completed_at: 'completed_at',
  consultation: 'consultation',
  prescription: 'prescription',
  payment: 'payment',
  report_generated: 'report_generated',
  rating: 'rating',
  review: 'review'
};

async function updateFields(id, fields) {
  if (!fields || Object.keys(fields).length === 0) {
    return findById(id);
  }

  const setClauses = [];
  const params = [];

  for (const [key, value] of Object.entries(fields)) {
    const dbField = FIELD_MAP[key];
    if (!dbField) {
      continue;
    }

    setClauses.push(`${dbField} = ?`);

    if (dbField === 'consultation' || dbField === 'prescription' || dbField === 'payment') {
      params.push(toJson(value || {}));
    } else if (dbField === 'report_generated') {
      params.push(value ? 1 : 0);
    } else {
      params.push(value);
    }
  }

  if (!setClauses.length) {
    return findById(id);
  }

  params.push(id);
  await query(
    `UPDATE appointments
     SET ${setClauses.join(', ')}, updated_at = NOW()
     WHERE id = ?`,
    params
  );

  return findById(id);
}

module.exports = {
  findById,
  findByUid,
  create,
  listByUserId,
  listByDoctorId,
  listAll,
  updateFields
};
