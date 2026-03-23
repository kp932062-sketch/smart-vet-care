const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

function isEnvAdmin(decoded) {
  return (
    decoded &&
    decoded.role === 'admin' &&
    decoded.email &&
    process.env.ADMIN_EMAIL &&
    decoded.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  );
}

async function auth(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.role || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload.' });
    }

    if (decoded.role === 'doctor') {
      const doctor = await Doctor.findById(decoded.id);
      if (!doctor) {
        return res.status(401).json({ message: 'Doctor account not found.' });
      }
      req.user = doctor.id;
      req.userRole = 'doctor';
      req.userObj = doctor;
      return next();
    }

    if (isEnvAdmin(decoded)) {
      req.user = decoded.id || 'env-admin';
      req.userRole = 'admin';
      req.userObj = {
        id: decoded.id || 'env-admin',
        name: 'SmartVet Administrator',
        email: decoded.email,
        role: 'admin',
        isActive: true
      };
      return next();
    }

    const user = await User.findById(decoded.id, { includePassword: false });
    if (!user) {
      return res.status(401).json({ message: 'User account not found.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account has been deactivated.' });
    }

    req.user = user.id;
    req.userRole = user.role;
    req.userObj = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

async function doctorAuth(req, res, next) {
  try {
    const bodyDoctorLink = req.body && typeof req.body === 'object' ? req.body.doctorLink : undefined;
    const doctorLink = req.header('Doctor-Link') || req.query.doctorLink || bodyDoctorLink;
    if (doctorLink) {
      const doctor = await Doctor.findByAccessLink(doctorLink);
      if (!doctor) {
        return res.status(401).json({ message: 'Invalid doctor access link.' });
      }
      req.user = doctor.id;
      req.userRole = 'doctor';
      req.userObj = doctor;
      req.isDoctorLink = true;
      return next();
    }

    return auth(req, res, () => {
      if (req.userRole !== 'doctor') {
        return res.status(403).json({ message: 'Doctor authentication required.' });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed.' });
  }
}

async function flexibleAuth(req, res, next) {
  const hasDoctorLink = req.header('Doctor-Link') || req.query.doctorLink;
  return hasDoctorLink ? doctorAuth(req, res, next) : auth(req, res, next);
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

const adminOnly = authorize('admin');
const doctorOnly = authorize('doctor');
const userOnly = authorize('user', 'farmer');

// Backward-compatible aliases used by legacy route files.
const authMiddleware = auth;
function adminMiddleware(req, res, next) {
  return adminOnly(req, res, next);
}

module.exports = {
  auth,
  authMiddleware,
  doctorAuth,
  flexibleAuth,
  authorize,
  adminMiddleware,
  adminOnly,
  doctorOnly,
  userOnly
};
