const MedicalReport = require('../models/MedicalReport');

function toPositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function isValidDate(value) {
  if (!value) {
    return false;
  }
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeText(value, fieldName, { required = false, maxLength = null } = {}) {
  const normalized = value == null ? '' : String(value).trim();

  if (required && !normalized) {
    return { error: `${fieldName} is required.` };
  }

  if (maxLength && normalized.length > maxLength) {
    return { error: `${fieldName} must be at most ${maxLength} characters.` };
  }

  return { value: normalized || null };
}

function validateReportPayload(payload) {
  const appointmentUid = String(payload.appointment_uid || '').trim().toUpperCase();
  if (!appointmentUid) {
    return { error: 'appointment_uid is required.' };
  }

  const reportDateValue = String(payload.report_date || '').trim();
  if (!isValidDate(reportDateValue)) {
    return { error: 'report_date must be a valid date.' };
  }

  const diagnosis = normalizeText(payload.diagnosis, 'diagnosis', { required: true });
  if (diagnosis.error) {
    return { error: diagnosis.error };
  }

  const treatment = normalizeText(payload.treatment, 'treatment', { required: true });
  if (treatment.error) {
    return { error: treatment.error };
  }

  const prescription = normalizeText(payload.prescription, 'prescription');
  if (prescription.error) {
    return { error: prescription.error };
  }

  const notes = normalizeText(payload.notes, 'notes');
  if (notes.error) {
    return { error: notes.error };
  }

  return {
    value: {
      appointment_uid: appointmentUid,
      diagnosis: diagnosis.value,
      treatment: treatment.value,
      prescription: prescription.value,
      notes: notes.value,
      report_date: reportDateValue
    }
  };
}

async function buildConsistentPayload(validatedPayload) {
  const appointment = await MedicalReport.getAppointmentContextByUid(validatedPayload.appointment_uid);
  if (!appointment) {
    return { error: 'Appointment not found for appointment_uid.' };
  }

  return {
    value: {
      ...validatedPayload,
      appointment_id: Number(appointment.id),
      pet_name: appointment.pet_name || 'N/A',
      owner_name: appointment.owner_name || 'N/A',
      doctor_name: appointment.doctor_name || 'N/A',
      qr_code_data_url: appointment.qr_code_data_url || null
    }
  };
}

async function listAdminReports(req, res) {
  try {
    const searchTerm = req.query?.appointment_uid || req.query?.q || '';
    const page = toPositiveInt(req.query?.page) || 1;
    const limit = toPositiveInt(req.query?.limit) || 10;

    const reports = await MedicalReport.listAll({ searchTerm, page, limit });

    return res.json({
      success: true,
      count: reports.pagination.total,
      data: reports.data,
      pagination: reports.pagination
    });
  } catch (error) {
    console.error('Admin list reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch reports.'
    });
  }
}

function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function exportAdminReportsCsv(req, res) {
  try {
    const searchTerm = req.query?.appointment_uid || req.query?.q || '';
    const reports = await MedicalReport.listAllForExport(searchTerm);

    const header = [
      'report_id',
      'appointment_uid',
      'pet_name',
      'owner_name',
      'doctor_name',
      'diagnosis',
      'treatment',
      'prescription',
      'notes',
      'report_date',
      'created_at'
    ];

    const rows = reports.map((report) => [
      report.id,
      report.appointment_uid,
      report.pet_name,
      report.owner_name,
      report.doctor_name,
      report.diagnosis,
      report.treatment,
      report.prescription,
      report.notes,
      report.report_date,
      report.created_at
    ]);

    const csv = [header, ...rows]
      .map((line) => line.map(escapeCsv).join(','))
      .join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="admin-medical-reports-${stamp}.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    console.error('Admin export reports CSV error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export reports CSV.'
    });
  }
}

async function createAdminReport(req, res) {
  try {
    const validated = validateReportPayload(req.body || {});
    if (validated.error) {
      return res.status(400).json({ success: false, message: validated.error });
    }

    const existing = await MedicalReport.findByAppointmentUid(validated.value.appointment_uid);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A medical report already exists for this appointment UID.'
      });
    }

    const consistent = await buildConsistentPayload(validated.value);
    if (consistent.error) {
      return res.status(404).json({ success: false, message: consistent.error });
    }

    const created = await MedicalReport.create(consistent.value);
    return res.status(201).json({
      success: true,
      message: 'Medical report created successfully.',
      data: created
    });
  } catch (error) {
    console.error('Admin create report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create medical report.'
    });
  }
}

async function updateAdminReport(req, res) {
  try {
    const reportId = toPositiveInt(req.params.id);
    if (!reportId) {
      return res.status(400).json({ success: false, message: 'Invalid report id.' });
    }

    const existingReport = await MedicalReport.findById(reportId);
    if (!existingReport) {
      return res.status(404).json({ success: false, message: 'Medical report not found.' });
    }

    const validated = validateReportPayload(req.body || {});
    if (validated.error) {
      return res.status(400).json({ success: false, message: validated.error });
    }

    if (validated.value.appointment_uid !== existingReport.appointment_uid) {
      const duplicate = await MedicalReport.findByAppointmentUid(validated.value.appointment_uid);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another medical report already uses this appointment UID.'
        });
      }
    }

    const consistent = await buildConsistentPayload(validated.value);
    if (consistent.error) {
      return res.status(404).json({ success: false, message: consistent.error });
    }

    const updated = await MedicalReport.update(reportId, consistent.value);
    return res.json({
      success: true,
      message: 'Medical report updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('Admin update report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update medical report.'
    });
  }
}

async function listUserReports(req, res) {
  try {
    const reports = await MedicalReport.listByUserId(req.user, req.query?.appointment_uid || req.query?.q || '');
    return res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('User list reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your reports.'
    });
  }
}

async function getUserReportById(req, res) {
  try {
    const reportId = toPositiveInt(req.params.id);
    if (!reportId) {
      return res.status(400).json({ success: false, message: 'Invalid report id.' });
    }

    const report = await MedicalReport.findByIdForUser(reportId, req.user);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found.'
      });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error('User get report by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report details.'
    });
  }
}

async function getUserReportByAppointmentUid(req, res) {
  try {
    const appointmentUid = String(req.params.appointmentUid || '').trim().toUpperCase();
    if (!appointmentUid) {
      return res.status(400).json({ success: false, message: 'appointment_uid is required.' });
    }

    const report = await MedicalReport.findByAppointmentUid(appointmentUid);
    if (!report || Number(report.user_id) !== Number(req.user)) {
      return res.status(404).json({
        success: false,
        message: 'Medical report not found.'
      });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error('User get report by appointment uid error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch report details.'
    });
  }
}

module.exports = {
  listAdminReports,
  createAdminReport,
  updateAdminReport,
  exportAdminReportsCsv,
  listUserReports,
  getUserReportById,
  getUserReportByAppointmentUid,
  validateReportPayload,
  buildConsistentPayload
};