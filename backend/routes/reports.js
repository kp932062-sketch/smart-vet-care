const express = require('express');
const reportController = require('../controllers/reportController');
const { auth, flexibleAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/user', auth, reportController.userReports);
router.get('/doctor', auth, reportController.doctorReports);
router.get('/doctor/:doctorId', reportController.doctorReportsById);
router.get('/doctor/:doctorId/analytics', auth, reportController.doctorAnalytics);
router.get('/verify/:appointmentUid', reportController.verifyReportByAppointmentUid);
router.get('/:appointmentUid/pdf', auth, reportController.downloadReportByAppointmentUid);
router.get('/:id/download', flexibleAuth, reportController.downloadReport);
router.put('/:reportId/clinical-note', flexibleAuth, reportController.updateClinicalNote);

module.exports = router;
