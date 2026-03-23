const { query } = require('../config/database');
const { parseJson, toBoolean, normalizeDate, toJson } = require('../utils/sql');

function mapReport(row) {
  if (!row) {
    return null;
  }

  return {
    id: Number(row.id),
    _id: Number(row.id),
    title: row.title,
    animal: {
      _id: Number(row.pet_id),
      id: Number(row.pet_id),
      name: row.pet_name,
      type: row.pet_species,
      species: row.pet_species,
      breed: row.pet_breed,
      age: row.pet_age,
      gender: row.pet_gender,
      healthStatus: row.pet_health_status
    },
    farmer: {
      _id: Number(row.user_id),
      id: Number(row.user_id),
      name: row.user_name,
      email: row.user_email,
      phone: row.user_mobile
    },
    doctor: {
      _id: Number(row.doctor_id),
      id: Number(row.doctor_id),
      name: row.doctor_name,
      specialization: row.doctor_specialization,
      email: row.doctor_email,
      experience: row.doctor_experience,
      licenseNumber: row.license_number
    },
    appointment: row.appointment_id
      ? {
          _id: Number(row.appointment_id),
          id: Number(row.appointment_id),
          reason: row.appointment_reason,
          petName: row.appointment_pet_name,
          date: normalizeDate(row.appointment_date)
        }
      : null,
    diagnosis: row.diagnosis,
    symptoms: parseJson(row.symptoms, []),
    treatment: row.treatment_notes,
    recommendations: row.recommendations,
    prescriptions: parseJson(row.prescriptions, []),
    clinicalNote: parseJson(row.clinical_note, null),
    cost: {
      consultationFee: Number(row.consultation_fee || 0),
      platformFee: Number(row.platform_fee || 0),
      tax: Number(row.tax || 0),
      medicinesCost: Number(row.medicines_cost || 0),
      total: Number(row.total_cost || 0)
    },
    paymentStatus: row.payment_status,
    reportAccessible: toBoolean(row.report_accessible),
    paymentId: row.payment_id,
    paidAt: normalizeDate(row.paid_at),
    createdAt: normalizeDate(row.created_at),
    updatedAt: normalizeDate(row.updated_at)
  };
}

const BASE_SELECT = `
  SELECT
    t.*,
    p.name AS pet_name,
    p.species AS pet_species,
    p.breed AS pet_breed,
    p.age AS pet_age,
    p.gender AS pet_gender,
    p.health_status AS pet_health_status,
    u.name AS user_name,
    u.email AS user_email,
    u.mobile AS user_mobile,
    d.name AS doctor_name,
    d.email AS doctor_email,
    d.specialization AS doctor_specialization,
    d.experience AS doctor_experience,
    d.license_number,
    a.reason AS appointment_reason,
    a.pet_name AS appointment_pet_name,
    a.appointment_date
  FROM treatments t
  INNER JOIN pets p ON p.id = t.pet_id
  INNER JOIN users u ON u.id = t.user_id
  INNER JOIN doctors d ON d.id = t.doctor_id
  LEFT JOIN appointments a ON a.id = t.appointment_id
`;

async function create(data) {
  const result = await query(
    `INSERT INTO treatments (
      pet_id, doctor_id, user_id, appointment_id, title, description, diagnosis, symptoms,
      treatment_notes, recommendations, prescriptions, clinical_note, consultation_fee,
      platform_fee, tax, medicines_cost, total_cost, payment_status, report_accessible,
      payment_id, treatment_date, paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.petId,
      data.doctorId,
      data.userId,
      data.appointmentId || null,
      data.title,
      data.description || null,
      data.diagnosis || null,
      toJson(data.symptoms || []),
      data.treatmentNotes || null,
      data.recommendations || null,
      toJson(data.prescriptions || []),
      data.clinicalNote ? toJson(data.clinicalNote) : null,
      Number(data.consultationFee || 0),
      Number(data.platformFee || 0),
      Number(data.tax || 0),
      Number(data.medicinesCost || 0),
      Number(data.totalCost || 0),
      data.paymentStatus || 'unpaid',
      Number(Boolean(data.reportAccessible)),
      data.paymentId || null,
      data.treatmentDate,
      data.paidAt || null
    ]
  );

  return findById(result.insertId);
}

async function findById(id) {
  const rows = await query(`${BASE_SELECT} WHERE t.id = ? LIMIT 1`, [id]);
  return mapReport(rows[0]);
}

async function listByUserId(userId) {
  const rows = await query(
    `${BASE_SELECT} WHERE t.user_id = ? ORDER BY t.treatment_date DESC`,
    [userId]
  );
  return rows.map((row) => mapReport(row));
}

async function listByDoctorId(doctorId) {
  const rows = await query(
    `${BASE_SELECT} WHERE t.doctor_id = ? ORDER BY t.treatment_date DESC`,
    [doctorId]
  );
  return rows.map((row) => mapReport(row));
}

async function updateClinicalNote(id, clinicalNote, doctorId) {
  const payload = {
    ...clinicalNote,
    addedBy: doctorId,
    addedAt: new Date().toISOString()
  };

  await query('UPDATE treatments SET clinical_note = ? WHERE id = ?', [toJson(payload), id]);
  return findById(id);
}

async function getDoctorAnalytics(doctorId, month, year) {
  const params = [doctorId];
  let dateFilter = '';
  if (month && year) {
    dateFilter = ' AND YEAR(t.treatment_date) = ? AND MONTH(t.treatment_date) = ?';
    params.push(year, month);
  }

  const rows = await query(
    `SELECT
       COUNT(*) AS total_consultations,
       COUNT(DISTINCT t.pet_id) AS total_patients,
       COALESCE(SUM(t.total_cost), 0) AS total_revenue
     FROM treatments t
     WHERE t.doctor_id = ?${dateFilter}`,
    params
  );

  return {
    totalConsultations: Number(rows[0]?.total_consultations || 0),
    totalPatients: Number(rows[0]?.total_patients || 0),
    totalRevenue: Number(rows[0]?.total_revenue || 0)
  };
}

module.exports = {
  create,
  findById,
  listByUserId,
  listByDoctorId,
  updateClinicalNote,
  getDoctorAnalytics
};
