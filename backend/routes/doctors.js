const express = require('express');
const doctorController = require('../controllers/doctorController');
const upload = require('../middleware/upload');
const { auth, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', doctorController.listDoctors);
router.get('/pending', auth, adminOnly, doctorController.pendingDoctors);
router.get('/:id', auth, doctorController.getDoctor);
router.post('/', upload.doctorDocuments, doctorController.createDoctor);
router.put('/:id', auth, doctorController.updateDoctor);
router.put('/:id/banking', auth, doctorController.updateBanking);
router.put('/:id/approve', auth, adminOnly, doctorController.approveDoctor);
router.put('/:id/reject', auth, adminOnly, doctorController.rejectDoctor);
router.delete('/:id', auth, adminOnly, doctorController.deleteDoctor);

module.exports = router;
