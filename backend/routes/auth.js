const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/request-reactivation', authController.requestReactivation);
router.get('/admin-notifications', authController.adminNotifications);
router.post('/doctor-link-login', authController.doctorLinkLogin);

module.exports = router;
