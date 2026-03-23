const express = require('express');
const { auth, authorize } = require('../middleware/authMiddleware');
const {
  listUserReports,
  getUserReportById,
  getUserReportByAppointmentUid
} = require('../controllers/medicalReportController');

const router = express.Router();

router.get('/reports', auth, authorize('user', 'farmer'), listUserReports);
router.get('/reports/by-appointment/:appointmentUid', auth, authorize('user', 'farmer'), getUserReportByAppointmentUid);
router.get('/reports/:id', auth, authorize('user', 'farmer'), getUserReportById);

module.exports = router;