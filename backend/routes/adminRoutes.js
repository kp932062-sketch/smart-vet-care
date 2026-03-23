const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const User = require('../models/User');
const Admin = require('../models/Admin');
const doctorController = require('../controllers/doctorController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
  addDoctor,
  listAllAppointments,
  updateAppointmentStatus
} = require('../controllers/adminController');
const {
  listUsers,
  updateUser,
  updateUserStatus,
  deleteUser
} = require('../controllers/adminUserController');
const {
  listAdminReports,
  createAdminReport,
  updateAdminReport,
  exportAdminReportsCsv
} = require('../controllers/medicalReportController');
const {
  createAnimal,
  updateAnimal,
  deleteAnimal,
  createBreed,
  updateBreed,
  deleteBreed,
  createReason,
  updateReason,
  deleteReason
} = require('../controllers/suggestionController');

const router = express.Router();

const doctorsUploadDir = path.join(__dirname, '..', 'uploads', 'doctors');
if (!fs.existsSync(doctorsUploadDir)) {
  fs.mkdirSync(doctorsUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, doctorsUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path
      .basename(file.originalname || 'profile', ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file && file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Only image files are allowed for profile image.'));
  }
});

router.post('/doctors', authMiddleware, adminMiddleware, imageUpload.single('profileImage'), addDoctor);

router.get('/reports', authMiddleware, adminMiddleware, listAdminReports);
router.get('/reports/export/csv', authMiddleware, adminMiddleware, exportAdminReportsCsv);
router.post('/reports', authMiddleware, adminMiddleware, createAdminReport);
router.put('/reports/:id', authMiddleware, adminMiddleware, updateAdminReport);

router.get('/dashboard', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const analytics = await Admin.getAnalytics();
    res.json({
      mode: 'database',
      statistics: {
        totalUsers: Number(analytics.totalUsers || 0),
        activeDoctors: Number(analytics.totalDoctors || 0),
        totalAppointments: Number(analytics.totalAppointments || 0),
        totalRevenue: Number(analytics.totalRevenue || 0)
      },
      message: 'Admin dashboard statistics fetched from database.'
    });
  } catch (error) {
    console.error('Failed to fetch dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

router.get('/analytics', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const analytics = await Admin.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// User Management
router.get('/users', authMiddleware, adminMiddleware, listUsers);
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);
router.put('/users/:id/status', authMiddleware, adminMiddleware, updateUserStatus);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

router.get('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

router.patch('/users/:id/delete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.query('UPDATE users SET status = "deleted", is_active = 0 WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'User soft-deleted' });
  } catch (error) {
    console.error('Error soft-deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.delete('/users/:id/hard-delete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return res.json({ success: true, message: 'User hard-deleted' });
  } catch (error) {
    console.error('Error hard-deleting user:', error);
    return res.status(500).json({ error: 'Failed to hard-delete user' });
  }
});

// Doctor Management (matching frontend expectations)
router.post('/doctors/:id/approve', authMiddleware, adminMiddleware, doctorController.approveDoctor);
router.post('/doctors/:id/reject', authMiddleware, adminMiddleware, doctorController.rejectDoctor);
router.delete('/doctors/:id/remove', authMiddleware, adminMiddleware, doctorController.deleteDoctor);

// Appointments Management
router.get('/appointments', authMiddleware, adminMiddleware, listAllAppointments);
router.put('/appointments/:id/status', authMiddleware, adminMiddleware, updateAppointmentStatus);

// Suggestion Management
router.post('/animals', authMiddleware, adminMiddleware, createAnimal);
router.put('/animals/:id', authMiddleware, adminMiddleware, updateAnimal);
router.delete('/animals/:id', authMiddleware, adminMiddleware, deleteAnimal);

router.post('/breeds', authMiddleware, adminMiddleware, createBreed);
router.put('/breeds/:id', authMiddleware, adminMiddleware, updateBreed);
router.delete('/breeds/:id', authMiddleware, adminMiddleware, deleteBreed);

router.post('/reasons', authMiddleware, adminMiddleware, createReason);
router.put('/reasons/:id', authMiddleware, adminMiddleware, updateReason);
router.delete('/reasons/:id', authMiddleware, adminMiddleware, deleteReason);

module.exports = router;
