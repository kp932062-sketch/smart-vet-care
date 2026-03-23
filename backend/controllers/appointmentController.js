const { transaction } = require('../config/database');
const { toJson } = require('../utils/sql');
const Appointment = require('../models/Appointment');
const Animal = require('../models/Animal');
const Doctor = require('../models/Doctor');
const Report = require('../models/Report');
const User = require('../models/User');
const { ensureAutoReportForCompletedAppointment } = require('../services/appointmentReportService');

function buildPaymentSummary(consultationFee) {
  const platformFee = Math.round(Number(consultationFee || 0) * 0.15);
  const tax = Math.round(Number(consultationFee || 0) * 0.05);
  const totalAmount = Number(consultationFee || 0) + platformFee + tax;
  return {
    consultationFee: Number(consultationFee || 0),
    platformFee,
    tax,
    totalAmount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

async function createAppointment(req, res) {
  try {
    const { doctor, user, petId, petName, reason, date, time } = req.body;
    if (!doctor || !user || !petName || !reason || !date || !time) {
      return res.status(400).json({
        error: 'All fields are required: doctor, user, petName, reason, date, time'
      });
    }
    if (Number(user) !== Number(req.user)) {
      return res.status(403).json({ error: 'You can only book appointments for yourself' });
    }

    const doctorRecord = await Doctor.findById(doctor);
    if (!doctorRecord || !doctorRecord.approved) {
      return res.status(400).json({ error: 'Doctor is not available' });
    }

    const appointment = await Appointment.create({
      userId: req.user,
      doctorId: doctor,
      petId: petId || null,
      petName,
      reason,
      appointmentDate: `${date} ${time}:00`,
      description: req.body.description || null,
      urgencyLevel: req.body.urgencyLevel || 'medium'
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
}

async function listUserAppointments(req, res) {
  try {
    const appointments = await Appointment.listByUserId(req.params.id);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
}

async function listAppointmentsByEmail(req, res) {
  try {
    const user = await User.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(await Appointment.listByUserId(user.id));
  } catch (error) {
    console.error('Error fetching appointments by email:', error);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
}

async function listAllAppointments(req, res) {
  try {
    const appointments = await Appointment.listAll({
      doctorId: req.query.doctor,
      status: req.query.status,
      date: req.query.date
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to load appointments' });
  }
}

async function listDoctorAppointments(req, res) {
  try {
    const doctorId = Number(req.params.doctorId);
    if (req.userRole === 'doctor' && Number(req.user) !== doctorId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    res.json(await Appointment.listByDoctorId(doctorId, req.query.date));
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ message: 'Failed to load doctor appointments' });
  }
}

async function confirmAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (Number(appointment.doctor.id || appointment.doctor) !== Number(req.user)) {
      return res.status(403).json({ message: 'You can only confirm your own appointments' });
    }

    res.json(await Appointment.updateFields(req.params.id, {
      status: 'confirmed',
      confirmed_at: new Date()
    }));
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ message: 'Failed to confirm appointment' });
  }
}

async function cancelAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwner = Number(appointment.user.id || appointment.user) === Number(req.user);
    const isDoctor = Number(appointment.doctor.id || appointment.doctor) === Number(req.user);
    if (!isOwner && !isDoctor && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(await Appointment.updateFields(req.params.id, {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: req.body.reason || null
    }));
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}

async function updateConsultation(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (Number(appointment.doctor.id || appointment.doctor) !== Number(req.user)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(await Appointment.updateFields(req.params.id, {
      consultation: toJson(req.body.consultation || appointment.consultation || {}),
      prescription: toJson(req.body.prescription || appointment.prescription || {}),
      payment: toJson(req.body.payment || appointment.payment || {})
    }));
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ message: 'Failed to update consultation' });
  }
}

async function completeAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (Number(appointment.doctor.id || appointment.doctor) !== Number(req.user)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const consultationFee = Number(req.body.consultationFee || appointment.doctor.consultationFee || 500);
    const payment = buildPaymentSummary(consultationFee);

    const result = await transaction(async (connection) => {
      await connection.execute(
        `UPDATE appointments
         SET consultation = ?, prescription = ?, payment = ?, status = 'completed',
             completed_at = NOW(), report_generated = 1
         WHERE id = ?`,
        [
          toJson(req.body.consultation || appointment.consultation || {}),
          toJson(req.body.prescription || appointment.prescription || {}),
          toJson(payment),
          req.params.id
        ]
      );

      const updatedAppointment = await Appointment.findById(req.params.id);
      let petId = updatedAppointment.petId;
      if (!petId) {
        const animal = await Animal.create({
          ownerId: updatedAppointment.user.id || updatedAppointment.user,
          name: updatedAppointment.petName || 'Pet',
          species: 'pet',
          healthStatus: 'under_treatment'
        });
        petId = animal.id;
        await connection.execute('UPDATE appointments SET pet_id = ? WHERE id = ?', [petId, req.params.id]);
      }

      const report = await Report.create({
        petId,
        doctorId: updatedAppointment.doctor.id || updatedAppointment.doctor,
        userId: updatedAppointment.user.id || updatedAppointment.user,
        appointmentId: updatedAppointment.id,
        title: `Consultation Report - ${updatedAppointment.petName}`,
        description: updatedAppointment.reason,
        diagnosis: req.body.consultation?.diagnosis || null,
        symptoms: req.body.consultation?.symptoms ? [req.body.consultation.symptoms] : [],
        treatmentNotes: req.body.consultation?.examination || 'Routine examination completed',
        recommendations: req.body.consultation?.recommendations || null,
        prescriptions: req.body.prescription?.medicines || [],
        consultationFee: payment.consultationFee,
        platformFee: payment.platformFee,
        tax: payment.tax,
        medicinesCost: 0,
        totalCost: payment.totalAmount,
        paymentStatus: 'unpaid',
        reportAccessible: false,
        treatmentDate: new Date()
      });

      const latestAppointment = await Appointment.findById(req.params.id);
      const medicalReportResult = await ensureAutoReportForCompletedAppointment(latestAppointment, {
        consultation: req.body.consultation || {},
        prescription: req.body.prescription || {}
      });

      return {
        appointment: latestAppointment,
        report,
        medicalReport: medicalReportResult.report,
        medicalReportCreated: medicalReportResult.created
      };
    });

    res.json({
      ...result,
      message: 'Consultation completed successfully. Report generated and waiting for payment.',
      nextStep: 'payment_required'
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Failed to complete appointment', error: error.message });
  }
}

async function patchAppointment(req, res) {
  try {
    const updated = await Appointment.updateFields(req.params.id, {
      status: req.body.status || 'pending'
    });
    if (!updated) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Failed to update appointment' });
  }
}

async function deleteAppointment(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await Appointment.updateFields(req.params.id, {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: 'Deleted by administrator'
    });
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Failed to cancel appointment' });
  }
}

async function paymentStatus(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    if (Number(appointment.user.id || appointment.user) !== Number(req.user)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({
      success: true,
      paymentStatus: {
        appointmentId: appointment.id,
        status: appointment.status,
        reportReady: appointment.status === 'completed',
        paymentRequired: appointment.payment?.status !== 'completed',
        paymentCompleted: appointment.payment?.status === 'completed',
        consultationFee: appointment.payment?.consultationFee || 0,
        platformFee: appointment.payment?.platformFee || 0,
        totalAmount: appointment.payment?.totalAmount || 0,
        doctorName: appointment.doctor.name,
        petName: appointment.petName,
        appointmentDate: appointment.appointmentDate
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
}

module.exports = {
  createAppointment,
  listUserAppointments,
  listAppointmentsByEmail,
  listAllAppointments,
  listDoctorAppointments,
  confirmAppointment,
  cancelAppointment,
  updateConsultation,
  completeAppointment,
  patchAppointment,
  deleteAppointment,
  paymentStatus
};
