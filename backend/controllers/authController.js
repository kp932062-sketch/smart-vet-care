const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendEmail } = require('../services/emailService');
const allowedRoles = new Set(['user', 'farmer', 'doctor', 'admin']);

function createToken(payload) {
  if (!payload || payload.id == null || !payload.role) {
    throw new Error('JWT payload must include id and role.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function buildEnvAdminUser() {
  return {
    id: 'env-admin',
    name: 'SmartVet Administrator',
    email: process.env.ADMIN_EMAIL,
    role: 'admin',
    isActive: true
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res) {
  // Check DB availability
  if (!req.app.locals.databaseAvailable) {
    console.error('Register failed: Database unavailable');
    return res.status(503).json({ 
      success: false, 
      message: 'Service temporarily unavailable. Please try again later (database issue).' 
    });
  }

  try {
    const { name, email, mobile, password, petName, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required.' 
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters.' 
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists. Please use a different email or login.' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile ? mobile.trim() : null,
      password: hashedPassword,
      petName: petName ? petName.trim() : null,
      role: allowedRoles.has(role) ? role : 'user'
    });

    const token = createToken({ id: user.id, email: user.email, role: user.role });

    // Optional welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(err => 
      console.error('Welcome email failed (non-critical):', err.message)
    );

    console.log(`User registered: ${user.email} (ID: ${user.id})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register detailed error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      body: req.body
    });

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ 
        success: false, 
        message: 'Database schema not initialized. Contact admin.' 
      });
    }
    if (error.code?.startsWith('ER_DUP_ENTRY')) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
}

async function sendWelcomeEmail(email, name) {
  const { sendEmail } = require('../services/emailService');
  await sendEmail({
    to: email,
    subject: 'Welcome to SmartVet!',
    text: `Hello ${name}, your SmartVet account is ready.`
  });
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    if (normalizedEmail === envAdminEmail && password === envAdminPassword) {
      const adminUser = buildEnvAdminUser();
      const token = createToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role, source: 'env' });
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        role: adminUser.role,
        user: adminUser
      });
    }

    if (!req.app.locals.databaseAvailable) {
      return res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable. Database connection is not ready.'
      });
    }

    const user = await User.findByEmail(email, { includePassword: true });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      if (normalizedEmail === envAdminEmail) {
        return res.status(400).json({
          success: false,
          message: 'Invalid admin password. Check ADMIN_PASSWORD in backend/.env.'
        });
      }

      if (normalizedEmail === 'admin@vetcare.com' && envAdminEmail && normalizedEmail !== envAdminEmail) {
        return res.status(400).json({
          success: false,
          message: `This project is configured with a different admin email: ${envAdminEmail}`
        });
      }

      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // STRICT ADMIN LOCK: Block any database user with role 'admin' from logging in.
    // Admin login is restricted exclusively to the ADMIN_EMAIL and ADMIN_PASSWORD in .env.
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Database admin accounts are disabled. Please use the primary admin credentials.' });
    }

    await User.updateLastLogin(user.id);
    const token = createToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      success: true,
      message: 'User login successful',
      token,
      role: user.role,
      user: await User.findById(user.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || '';

    if (normalizedEmail === envAdminEmail && password === envAdminPassword) {
      const adminUser = buildEnvAdminUser();
      const token = createToken({ id: adminUser.id, email: adminUser.email, role: adminUser.role, source: 'env' });
      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        role: adminUser.role,
        user: adminUser
      });
    }

    res.status(500).json({ success: false, message: 'Server error during login' });
  }
}

async function requestReactivation(req, res) {
  try {
    const { email, reason } = req.body;
    if (!email || !reason || reason.trim().length < 3) {
      return res.status(400).json({ error: 'Email and valid reason are required.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.isActive) {
      return res.status(400).json({ error: 'Account is already active.' });
    }

    await User.requestReactivation(email, reason.trim());
    res.json({ success: true, message: 'Reactivation request submitted.' });
  } catch (error) {
    console.error('Error in reactivation request:', error);
    res.status(500).json({ error: 'Failed to submit reactivation request.' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email, { includePassword: true });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await User.setResetCode(email, code, expiresAt);

    try {
      await sendEmail({
        to: email,
        subject: 'SmartVet Password Reset Code',
        text: `Your reset code is ${code}. It expires in 15 minutes.`
      });
    } catch (error) {
      console.error('Failed to send reset code:', error.message);
    }

    res.json({ message: 'Password reset code sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending reset code' });
  }
}

async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findByEmail(email, { includePassword: true });
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    if (user.resetPasswordCode !== code || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(user.id, hashedPassword);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

async function adminNotifications(req, res) {
  try {
    const pendingDoctors = await Doctor.listPending();
    const recentAppointments = await Appointment.listAll();
    res.json({
      pendingDoctors,
      recentAppointments: recentAppointments.slice(0, 10)
    });
  } catch (error) {
    console.error('Failed to fetch admin notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

async function doctorLinkLogin(req, res) {
  try {
    const { link } = req.body;
    const doctor = await Doctor.findByAccessLink(link);
    if (!doctor) {
      return res.status(404).json({ error: 'Invalid or expired link' });
    }

    await Doctor.touchLastLogin(doctor.id);
    const token = createToken({ id: doctor.id, role: 'doctor', email: doctor.email });
    const doctorUser = {
      ...doctor,
      token
    };

    res.json({
      success: true,
      message: 'Doctor login successful',
      token,
      role: 'doctor',
      user: doctorUser
    });
  } catch (error) {
    console.error('Doctor link login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = {
  register,
  login,
  requestReactivation,
  forgotPassword,
  resetPassword,
  adminNotifications,
  doctorLinkLogin
};
