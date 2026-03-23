const express = require('express');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const router = express.Router();

router.get('/:token', async (req, res) => {
  try {
    const doctor = await Doctor.findByAccessLink(req.params.token);
    if (!doctor) {
      return res.status(404).json({
        error: 'Invalid or expired access link. This account may have been removed or deactivated. Please contact admin.',
        code: 'DOCTOR_NOT_FOUND',
        redirectTo: '/contact'
      });
    }

    await Doctor.touchLastLogin(doctor.id);
    const token = jwt.sign(
      { id: doctor.id, role: 'doctor', email: doctor.email, name: doctor.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Access granted successfully',
      user: {
        ...doctor,
        token
      }
    });
  } catch (error) {
    console.error('Error verifying doctor access:', error);
    res.status(500).json({ error: 'Failed to verify access link' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const doctor = await Doctor.findByAccessLink(req.body.accessToken);
    if (!doctor) {
      return res.status(401).json({ error: 'Invalid or expired access link' });
    }

    await Doctor.touchLastLogin(doctor.id);
    const token = jwt.sign(
      { id: doctor.id, role: 'doctor', email: doctor.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      doctor
    });
  } catch (error) {
    console.error('Error in doctor login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/:token/setup', async (req, res) => {
  try {
    const doctor = await Doctor.findByAccessLink(req.params.token);
    if (!doctor) {
      return res.status(404).json({ error: 'Invalid access link' });
    }

    const updatedDoctor = await Doctor.updateById(doctor.id, req.body);
    res.json({
      success: true,
      message: 'Profile setup completed successfully',
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error('Error completing doctor setup:', error);
    res.status(500).json({ error: 'Failed to complete profile setup' });
  }
});

module.exports = router;
