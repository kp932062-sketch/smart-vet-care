const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Report = require('../models/Report');
const MedicalReport = require('../models/MedicalReport');

function qrDataUrlToBuffer(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return null;
  }

  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    return null;
  }

  try {
    return Buffer.from(parts[1], 'base64');
  } catch (_error) {
    return null;
  }
}

async function downloadReportByAppointmentUid(req, res) {
  try {
    const appointmentUid = String(req.params.appointmentUid || '').trim().toUpperCase();
    if (!appointmentUid) {
      return res.status(400).json({ message: 'appointment_uid is required.' });
    }

    const report = await MedicalReport.findByAppointmentUid(appointmentUid);
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found for this appointment ID.' });
    }

    if (req.userRole === 'doctor' && Number(report.doctor_id) !== Number(req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if ((req.userRole === 'user' || req.userRole === 'farmer') && Number(report.user_id) !== Number(req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filename = `SmartVet_${appointmentUid}_Report.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const frontendBase = String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const verificationUrl = `${frontendBase}/report-verify/${encodeURIComponent(appointmentUid)}`;
    const qrCodeDataUrl = report.qr_code_data_url || (await QRCode.toDataURL(verificationUrl));
    const qrBuffer = qrDataUrlToBuffer(qrCodeDataUrl);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('SmartVet Medical Report', { align: 'center' });
    doc.moveDown(1.2);

    doc.fontSize(12).text(`Appointment ID: ${appointmentUid}`);
    doc.text(`Patient Name: ${report.pet_name || 'N/A'}`);
    doc.text(`Owner Name: ${report.owner_name || 'N/A'}`);
    doc.text(`Doctor Name: Dr. ${report.doctor_name || 'N/A'}`);
    doc.text(`Date: ${report.report_date || 'N/A'}`);
    doc.moveDown(0.8);

    doc.fontSize(13).text('Diagnosis', { underline: true });
    doc.fontSize(12).text(report.diagnosis || 'N/A');
    doc.moveDown(0.6);

    doc.fontSize(13).text('Treatment', { underline: true });
    doc.fontSize(12).text(report.treatment || 'N/A');
    doc.moveDown(0.6);

    doc.fontSize(13).text('Prescription', { underline: true });
    doc.fontSize(12).text(report.prescription || 'N/A');
    doc.moveDown(0.6);

    doc.fontSize(13).text('Notes', { underline: true });
    doc.fontSize(12).text(report.notes || 'N/A');

    if (qrBuffer) {
      doc.moveDown(1.2);
      doc.fontSize(11).text('Appointment QR', { align: 'left' });
      doc.image(qrBuffer, { fit: [120, 120], align: 'left' });
    }

    doc.end();
  } catch (error) {
    console.error('Error generating appointment PDF report:', error);
    res.status(500).json({ message: 'Error generating PDF report', error: error.message });
  }
}

async function verifyReportByAppointmentUid(req, res) {
  try {
    const appointmentUid = String(req.params.appointmentUid || '').trim().toUpperCase();
    if (!appointmentUid) {
      return res.status(400).json({ message: 'appointment_uid is required.' });
    }

    const report = await MedicalReport.findByAppointmentUid(appointmentUid);
    if (!report) {
      return res.status(404).json({ message: 'No verified report found for this appointment ID.' });
    }

    return res.json({
      success: true,
      data: {
        appointmentUid: report.appointment_uid,
        petName: report.pet_name,
        ownerName: report.owner_name,
        doctorName: report.doctor_name,
        diagnosis: report.diagnosis,
        treatment: report.treatment,
        prescription: report.prescription,
        notes: report.notes,
        reportDate: report.report_date,
        qrCodeDataUrl: report.qr_code_data_url,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error verifying report by appointment UID:', error);
    res.status(500).json({ message: 'Error verifying report', error: error.message });
  }
}

async function userReports(req, res) {
  try {
    const reports = await Report.listByUserId(req.user);
    res.json({
      message: 'Reports fetched successfully',
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
}

async function doctorReports(req, res) {
  try {
    res.json(await Report.listByDoctorId(req.user));
  } catch (error) {
    console.error('Error fetching doctor reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
}

async function doctorReportsById(req, res) {
  try {
    res.json(await Report.listByDoctorId(req.params.doctorId));
  } catch (error) {
    console.error('Error fetching doctor reports:', error);
    res.status(500).json({ message: 'Error fetching doctor reports', error: error.message });
  }
}

async function doctorAnalytics(req, res) {
  try {
    const month = req.query.month ? Number(req.query.month) : null;
    const year = req.query.year ? Number(req.query.year) : null;
    const analytics = await Report.getDoctorAnalytics(Number(req.params.doctorId), month, year);
    res.json({
      success: true,
      analytics: {
        ...analytics,
        monthlyRevenue: analytics.totalRevenue,
        monthlyStats: [],
        commonDiseases: [],
        treatmentSuccess: 0,
        avgConsultationTime: 25,
        selectedPeriod: month && year ? `${year}-${String(month).padStart(2, '0')}` : 'all-time',
        growthPercentage: 0,
        revenueGrowth: 0
      }
    });
  } catch (error) {
    console.error('Error fetching doctor analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
}

async function updateClinicalNote(req, res) {
  try {
    const report = await Report.updateClinicalNote(req.params.reportId, req.body.clinicalNote, req.user);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error updating clinical note:', error);
    res.status(500).json({ message: 'Error updating clinical note', error: error.message });
  }
}

async function downloadReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (req.userRole === 'doctor' && Number(report.doctor.id) !== Number(req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if ((req.userRole === 'user' || req.userRole === 'farmer') && Number(report.farmer.id) !== Number(req.user)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filename = `SmartVet_Report_${report.animal.name}_${new Date().toISOString().slice(0, 10)}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);
    doc.fontSize(20).text('SmartVet Medical Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report: ${report.title}`);
    doc.text(`Pet: ${report.animal.name} (${report.animal.species || report.animal.type})`);
    doc.text(`Owner: ${report.farmer.name}`);
    doc.text(`Doctor: Dr. ${report.doctor.name}`);
    doc.text(`Date: ${report.createdAt?.toLocaleString() || ''}`);
    doc.moveDown();
    doc.text(`Diagnosis: ${report.diagnosis || 'N/A'}`);
    doc.text(`Symptoms: ${(report.symptoms || []).join(', ') || 'N/A'}`);
    doc.text(`Treatment: ${report.treatment || 'N/A'}`);
    doc.text(`Recommendations: ${report.recommendations || 'N/A'}`);
    doc.moveDown();
    doc.text(`Consultation Fee: Rs.${report.cost.consultationFee}`);
    doc.text(`Platform Fee: Rs.${report.cost.platformFee}`);
    doc.text(`Tax: Rs.${report.cost.tax}`);
    doc.text(`Total: Rs.${report.cost.total}`);
    doc.end();
  } catch (error) {
    console.error('Error generating PDF report:', error);
    res.status(500).json({ message: 'Error generating PDF report', error: error.message });
  }
}

module.exports = {
  userReports,
  doctorReports,
  doctorReportsById,
  doctorAnalytics,
  updateClinicalNote,
  downloadReport,
  downloadReportByAppointmentUid,
  verifyReportByAppointmentUid
};
