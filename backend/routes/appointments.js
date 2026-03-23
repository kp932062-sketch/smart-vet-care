const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { auth, doctorAuth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user/:id', auth, appointmentController.listUserAppointments);
router.post('/', auth, appointmentController.createAppointment);
router.put('/:id/confirm', doctorAuth, appointmentController.confirmAppointment);
router.put('/:id/cancel', auth, appointmentController.cancelAppointment);
router.put('/:id/consultation', doctorAuth, appointmentController.updateConsultation);
router.put('/:id/complete', doctorAuth, appointmentController.completeAppointment);
router.get('/doctor/:doctorId', doctorAuth, appointmentController.listDoctorAppointments);
router.get('/:id/payment-status', auth, appointmentController.paymentStatus);
router.patch('/:id', auth, appointmentController.patchAppointment);
router.delete('/:id', auth, adminOnly, appointmentController.deleteAppointment);
router.get('/', auth, appointmentController.listAllAppointments);
router.get('/:email', auth, appointmentController.listAppointmentsByEmail);

module.exports = router;
