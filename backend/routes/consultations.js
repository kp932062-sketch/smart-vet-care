const express = require('express');
const consultationController = require('../controllers/consultationController');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', auth, consultationController.createConsultation);
router.get('/', auth, consultationController.listConsultations);
router.get('/:id', auth, consultationController.getConsultation);
router.put('/:id/status', auth, consultationController.updateConsultationStatus);
router.post('/:id/rating', auth, consultationController.rateConsultation);

module.exports = router;
