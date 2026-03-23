const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const Appointment = require('../models/Appointment');
const { ensureAutoReportForCompletedAppointment } = require('../services/appointmentReportService');

const ALLOWED_APPOINTMENT_STATUSES = new Set([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'rejected'
]);

const STATUS_TRANSITIONS = {
  pending: new Set(['confirmed', 'cancelled', 'rejected']),
  confirmed: new Set(['completed', 'cancelled']),
  completed: new Set([]),
  cancelled: new Set([]),
  rejected: new Set([])
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function toNumberOrNull(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

async function addDoctor(req, res) {
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      experience,
      consultation_fee,
      availability
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingDoctor = await query('SELECT id FROM doctors WHERE LOWER(email) = LOWER(?) LIMIT 1', [normalizedEmail]);
    if (existingDoctor.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Doctor email already exists.'
      });
    }

    const existingUser = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1', [normalizedEmail]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered as a user.'
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 12);
    const doctorExperience = toNumberOrNull(experience) ?? 0;
    const doctorFee = toNumberOrNull(consultation_fee) ?? 500;
    const profileImage = req.file ? `/uploads/doctors/${req.file.filename}` : null;

    const userInsert = await query(
      `INSERT INTO users (name, email, mobile, password, role, pet_name, status, is_active)
       VALUES (?, ?, ?, ?, 'doctor', NULL, 'active', 1)`,
      [String(name).trim(), normalizedEmail, phone ? String(phone).trim() : null, hashedPassword]
    );

    const doctorInsert = await query(
      `INSERT INTO doctors (
        user_id, name, email, phone, specialization, experience, consultation_fee,
        working_hours, profile_image, approved, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', NOW())`,
      [
        userInsert.insertId,
        String(name).trim(),
        normalizedEmail,
        phone ? String(phone).trim() : null,
        specialization ? String(specialization).trim() : null,
        doctorExperience,
        doctorFee,
        availability ? JSON.stringify({ notes: String(availability).trim() }) : JSON.stringify({}),
        profileImage
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctor: {
        id: Number(doctorInsert.insertId),
        userId: Number(userInsert.insertId),
        name: String(name).trim(),
        email: normalizedEmail,
        phone: phone || null,
        specialization: specialization || null,
        experience: doctorExperience,
        consultation_fee: doctorFee,
        availability: availability || null,
        profile_image: profileImage,
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Add doctor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add doctor.'
    });
  }
}

async function listAllAppointments(req, res) {
  try {
    const rows = await query(
      `SELECT
        a.id,
        a.appointment_uid,
        a.pet_name AS pet_name,
        u.name AS owner_name,
        d.name AS doctor_name,
        d.specialization AS specialization,
        DATE(a.appointment_date) AS date,
        TIME(a.appointment_date) AS time,
        a.reason,
        a.status
      FROM appointments a
      LEFT JOIN users u ON u.id = a.user_id
      LEFT JOIN doctors d ON d.id = a.doctor_id
      ORDER BY a.appointment_date DESC`
    );

    return res.json({
      success: true,
      appointments: rows.map((row) => ({
        id: Number(row.id),
        _id: Number(row.id),
        appointment_uid: row.appointment_uid,
        pet_name: row.pet_name,
        owner_name: row.owner_name,
        doctor_name: row.doctor_name,
        specialization: row.specialization,
        date: row.date,
        time: row.time,
        reason: row.reason,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('List admin appointments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments.'
    });
  }
}

async function updateAppointmentStatus(req, res) {
  try {
    const appointmentId = Number(req.params.id);
    const nextStatus = String(req.body?.status || '').trim().toLowerCase();

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid appointment id is required.'
      });
    }

    if (!ALLOWED_APPOINTMENT_STATUSES.has(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: pending, confirmed, completed, cancelled, rejected.'
      });
    }

    const existingRows = await query(
      `SELECT id, status FROM appointments WHERE id = ? LIMIT 1`,
      [appointmentId]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const currentStatus = String(existingRows[0].status || '').toLowerCase();
    if (!STATUS_TRANSITIONS[currentStatus]?.has(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change appointment status from ${currentStatus} to ${nextStatus}.`
      });
    }

    if (nextStatus === 'completed') {
      await query(
        `UPDATE appointments
         SET status = ?, completed_at = NOW(), report_generated = 1, updated_at = NOW()
         WHERE id = ?`,
        [nextStatus, appointmentId]
      );

      const completedAppointment = await Appointment.findById(appointmentId);
      if (completedAppointment) {
        await ensureAutoReportForCompletedAppointment(completedAppointment);
      }
    } else {
      await query(`UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?`, [nextStatus, appointmentId]);
    }

    const updatedRows = await query(
      `SELECT
        a.id,
        a.appointment_uid,
        a.pet_name AS pet_name,
        u.name AS owner_name,
        d.name AS doctor_name,
        d.specialization AS specialization,
        DATE(a.appointment_date) AS date,
        TIME(a.appointment_date) AS time,
        a.reason,
        a.status
      FROM appointments a
      LEFT JOIN users u ON u.id = a.user_id
      LEFT JOIN doctors d ON d.id = a.doctor_id
      WHERE a.id = ?
      LIMIT 1`,
      [appointmentId]
    );

    const updated = updatedRows[0];
    return res.json({
      success: true,
      message: `Appointment status updated to ${nextStatus}.`,
      appointment: {
        id: Number(updated.id),
        _id: Number(updated.id),
        appointment_uid: updated.appointment_uid,
        pet_name: updated.pet_name,
        owner_name: updated.owner_name,
        doctor_name: updated.doctor_name,
        specialization: updated.specialization,
        date: updated.date,
        time: updated.time,
        reason: updated.reason,
        status: updated.status
      }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status.'
    });
  }
}

module.exports = {
  addDoctor,
  listAllAppointments,
  updateAppointmentStatus
};
