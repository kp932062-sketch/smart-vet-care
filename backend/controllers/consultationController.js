const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Animal = require('../models/Animal');
const { toJson } = require('../utils/sql');

async function createConsultation(req, res) {
  try {
    const { doctorId, animalId, scheduledDate, scheduledTime, symptoms, description, urgencyLevel } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.approved || !doctor.isAvailable) {
      return res.status(400).json({ message: 'Doctor is not available for consultation' });
    }

    const animal = await Animal.findByIdForOwner(animalId, req.user);
    if (!animal) {
      return res.status(400).json({ message: 'Animal not found or unauthorized' });
    }

    const consultation = await Appointment.create({
      userId: req.user,
      doctorId,
      petId: animalId,
      petName: animal.name,
      reason: symptoms,
      description,
      urgencyLevel: urgencyLevel || 'medium',
      appointmentDate: `${scheduledDate} ${scheduledTime}:00`,
      consultation: {
        symptoms,
        description
      }
    });

    res.status(201).json(consultation);
  } catch (error) {
    console.error('Error booking consultation:', error);
    res.status(500).json({ message: 'Failed to book consultation' });
  }
}

async function listConsultations(req, res) {
  try {
    if (req.userRole === 'doctor') {
      return res.json(await Appointment.listByDoctorId(req.user, req.query.date));
    }
    res.json(await Appointment.listByUserId(req.user));
  } catch (error) {
    console.error('Error fetching consultations:', error);
    res.status(500).json({ message: 'Failed to fetch consultations' });
  }
}

async function getConsultation(req, res) {
  try {
    const consultation = await Appointment.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    res.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    res.status(500).json({ message: 'Failed to fetch consultation details' });
  }
}

async function updateConsultationStatus(req, res) {
  try {
    const consultation = await Appointment.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    const update = {
      status: req.body.status || consultation.status,
      consultation: toJson({
        ...(consultation.consultation || {}),
        diagnosis: req.body.diagnosis ?? consultation.consultation?.diagnosis,
        treatment: req.body.treatment ?? consultation.consultation?.treatment,
        doctorNotes: req.body.doctorNotes ?? consultation.consultation?.doctorNotes
      }),
      prescription: req.body.prescriptions ? toJson(req.body.prescriptions) : toJson(consultation.prescription || {})
    };

    if (req.body.status === 'in_progress') {
      update.started_at = new Date();
    }
    if (req.body.status === 'completed') {
      update.completed_at = new Date();
    }

    res.json(await Appointment.updateFields(req.params.id, update));
  } catch (error) {
    console.error('Error updating consultation:', error);
    res.status(500).json({ message: 'Failed to update consultation' });
  }
}

async function rateConsultation(req, res) {
  try {
    const consultation = await Appointment.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found or unauthorized' });
    }
    if (Number(consultation.user.id || consultation.user) !== Number(req.user)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    res.json(await Appointment.updateFields(req.params.id, {
      rating: req.body.rating,
      review: req.body.review || null
    }));
  } catch (error) {
    console.error('Error rating consultation:', error);
    res.status(500).json({ message: 'Failed to rate consultation' });
  }
}

module.exports = {
  createConsultation,
  listConsultations,
  getConsultation,
  updateConsultationStatus,
  rateConsultation
};
