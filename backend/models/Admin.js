const { query } = require('../config/database');
const { toBoolean, normalizeDate } = require('../utils/sql');

/**
 * Get real-time analytics aggregates from the database.
 */
async function getAnalytics() {
  const [
    usersResult,
    doctorsResult,
    appointmentsResult,
    revenueResult,
    pendingDoctorsResult
  ] = await Promise.all([
    query('SELECT COUNT(*) AS total FROM users WHERE role != ?', ['admin']),
    query("SELECT COUNT(*) AS total FROM doctors WHERE approved = 1 AND status = 'active'"),
    query('SELECT COUNT(*) AS total FROM appointments'),
    query("SELECT COALESCE(SUM(total_cost), 0) AS totalRevenue, COALESCE(SUM(platform_fee), 0) AS totalCommission, COALESCE(SUM(consultation_fee), 0) AS totalDoctorEarnings FROM treatments"),
    query("SELECT COUNT(*) AS total FROM doctors WHERE approved = 0 AND status != 'rejected'")
  ]);

  const rev = revenueResult[0] || {};
  return {
    totalUsers: Number(usersResult[0]?.total || 0),
    totalDoctors: Number(doctorsResult[0]?.total || 0),
    totalAppointments: Number(appointmentsResult[0]?.total || 0),
    pendingDoctors: Number(pendingDoctorsResult[0]?.total || 0),
    totalRevenue: Number(rev.totalRevenue || 0),
    totalCommission: Number(rev.totalCommission || 0),
    totalDoctorEarnings: Number(rev.totalDoctorEarnings || 0)
  };
}

/**
 * List all users with subscription info for admin management.
 */
async function getSubscriptions() {
  const rows = await query(
    `SELECT id, name, email, role, subscription_tier, subscription_expiry, status, is_active, created_at
     FROM users
     WHERE subscription_tier IS NOT NULL
     ORDER BY subscription_expiry DESC`
  );
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    subscriptionTier: row.subscription_tier,
    subscriptionExpiry: normalizeDate(row.subscription_expiry),
    status: row.status,
    isActive: toBoolean(row.is_active),
    createdAt: normalizeDate(row.created_at)
  }));
}

module.exports = {
  getAnalytics,
  getSubscriptions
};
