const MedicalReport = require('../models/MedicalReport');

function formatDateOnly(input) {
  const date = input ? new Date(input) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function normalizePrescription(prescription) {
  if (!prescription) {
    return 'No prescription provided';
  }

  if (typeof prescription === 'string') {
    const trimmed = prescription.trim();
    return trimmed || 'No prescription provided';
  }

  if (Array.isArray(prescription)) {
    if (!prescription.length) {
      return 'No prescription provided';
    }
    return prescription
      .map((item) => (typeof item === 'string' ? item : item?.name || JSON.stringify(item)))
      .join(', ');
  }

  if (Array.isArray(prescription.medicines)) {
    return prescription.medicines
      .map((item) => item?.name || item?.medicine || item?.drug || JSON.stringify(item))
      .join(', ') || 'No prescription provided';
  }

  return JSON.stringify(prescription);
}

function buildAutoNotes(appointment) {
  const base = `Auto-generated for completed appointment ${appointment.appointmentUid}`;
  const reason = appointment.reason ? `Reason: ${appointment.reason}.` : '';
  return `${base}. ${reason}`.trim();
}

function buildAutoReportPayload(appointment, overrides = {}) {
  const consultation = overrides.consultation || appointment.consultation || {};
  const prescription = overrides.prescription || appointment.prescription || {};

  return {
    appointment_id: Number(appointment.id),
    appointment_uid: String(appointment.appointmentUid || '').trim().toUpperCase(),
    pet_name: appointment.petName || 'Pet',
    owner_name: appointment.user?.name || 'Owner',
    doctor_name: appointment.doctor?.name || 'Doctor',
    diagnosis:
      consultation.diagnosis ||
      appointment.reason ||
      'General veterinary consultation completed',
    treatment:
      consultation.treatment ||
      consultation.examination ||
      consultation.recommendations ||
      'Consultation completed and treatment plan documented',
    prescription: normalizePrescription(prescription),
    notes: consultation.notes || buildAutoNotes(appointment),
    qr_code_data_url: appointment.qrCodeDataUrl || null,
    report_date: formatDateOnly(appointment.completedAt || new Date())
  };
}

async function ensureAutoReportForCompletedAppointment(appointment, overrides = {}) {
  if (!appointment || !appointment.id || !appointment.appointmentUid) {
    throw new Error('Appointment payload must include id and appointmentUid.');
  }

  const existing = await MedicalReport.findByAppointmentUid(appointment.appointmentUid);
  if (existing) {
    return { report: existing, created: false };
  }

  const payload = buildAutoReportPayload(appointment, overrides);
  const report = await MedicalReport.create(payload);
  return { report, created: true };
}

module.exports = {
  buildAutoReportPayload,
  ensureAutoReportForCompletedAppointment
};
