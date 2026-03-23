const User = require('../models/User');

/**
 * Middleware to check if user can book appointments based on payment status
 * Blocks users with unpaid consultations from booking new appointments
 */
const checkPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user;
    
    // Get user's payment status
    const user = await User.findById(userId).select('paymentStatus');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if payment restrictions are enabled
    const paymentRestrictionsEnabled = process.env.ENABLE_PAYMENT_RESTRICTIONS === 'true';
    
    if (!paymentRestrictionsEnabled) {
      // If restrictions are disabled, allow booking
      return next();
    }

    // Check if user has pending payments
    if (user.paymentStatus.hasPendingPayments && !user.paymentStatus.canBookAppointments) {
      return res.status(402).json({
        error: 'Payment Required',
        message: `You have unpaid consultations totaling ₹${user.paymentStatus.unpaidAmount}. Please clear pending payments before booking new appointments.`,
        paymentRequired: true,
        details: {
          unpaidAmount: user.paymentStatus.unpaidAmount,
          pendingConsultations: user.paymentStatus.pendingConsultations.length,
          canBookAppointments: false,
          lastPaymentDate: user.paymentStatus.lastPaymentDate
        },
        actions: [
          {
            label: 'View Pending Payments',
            action: 'view_pending_payments',
            endpoint: '/api/payments/user/status'
          },
          {
            label: 'Make Payment',
            action: 'make_payment',
            endpoint: '/api/payments/pending-consultations'
          }
        ]
      });
    }

    // Check if user is blocked due to payment restrictions
    if (user.paymentStatus.paymentRestrictions.blocked) {
      return res.status(402).json({
        error: 'Account Blocked',
        message: user.paymentStatus.paymentRestrictions.blockedReason || 'Your account is blocked due to payment issues.',
        paymentRequired: true,
        details: {
          blocked: true,
          blockedSince: user.paymentStatus.paymentRestrictions.blockedSince,
          minimumPaymentRequired: user.paymentStatus.paymentRestrictions.minimumPaymentRequired
        }
      });
    }

    // User is clear to book appointments
    next();

  } catch (error) {
    console.error(' Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to verify payment status' });
  }
};

/**
 * Middleware to add pending consultation to user's unpaid list when consultation is completed
 */
const addPendingPayment = async (userId, appointmentId, doctorId, amount, consultationDate) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Add consultation to pending payments
    user.paymentStatus.pendingConsultations.push({
      appointmentId: appointmentId,
      doctorId: doctorId,
      amount: amount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      consultationDate: consultationDate,
      status: 'pending'
    });

    // Update payment status
    user.paymentStatus.unpaidAmount += amount;
    user.paymentStatus.hasPendingPayments = true;

    // Set restriction if unpaid amount exceeds threshold
    const maxUnpaidAmount = 2000; // ₹2000 threshold
    if (user.paymentStatus.unpaidAmount >= maxUnpaidAmount) {
      user.paymentStatus.canBookAppointments = false;
      user.paymentStatus.paymentRestrictions.blocked = true;
      user.paymentStatus.paymentRestrictions.blockedReason = `Unpaid amount of ₹${user.paymentStatus.unpaidAmount} exceeds limit. Please clear payments to continue.`;
      user.paymentStatus.paymentRestrictions.blockedSince = new Date();
      user.paymentStatus.paymentRestrictions.minimumPaymentRequired = user.paymentStatus.unpaidAmount;
    }

    await user.save();
    
    console.log(` Added pending payment: User ${userId} owes ₹${amount} for consultation ${appointmentId}`);
    return user.paymentStatus;

  } catch (error) {
    console.error(' Error adding pending payment:', error);
    throw error;
  }
};

/**
 * Middleware to mark overdue payments
 */
const markOverduePayments = async () => {
  try {
    const users = await User.find({
      'paymentStatus.hasPendingPayments': true,
      'paymentStatus.pendingConsultations.dueDate': { $lt: new Date() },
      'paymentStatus.pendingConsultations.status': 'pending'
    });

    for (const user of users) {
      let hasOverdue = false;
      
      user.paymentStatus.pendingConsultations.forEach(consultation => {
        if (consultation.dueDate < new Date() && consultation.status === 'pending') {
          consultation.status = 'overdue';
          hasOverdue = true;
        }
      });

      if (hasOverdue) {
        // Escalate restrictions for overdue payments
        user.paymentStatus.canBookAppointments = false;
        user.paymentStatus.paymentRestrictions.blocked = true;
        user.paymentStatus.paymentRestrictions.blockedReason = 'You have overdue payments. Please clear all pending payments immediately.';
        
        await user.save();
        console.log(` Marked overdue payments for user ${user._id}`);
      }
    }

    console.log(` Processed overdue payments for ${users.length} users`);
  } catch (error) {
    console.error(' Error marking overdue payments:', error);
  }
};

/**
 * Get user's payment restrictions summary
 */
const getPaymentSummary = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('paymentStatus')
      .populate('paymentStatus.pendingConsultations.appointmentId', 'petName date')
      .populate('paymentStatus.pendingConsultations.doctorId', 'name specialization');

    if (!user) {
      throw new Error('User not found');
    }

    const overduePayments = user.paymentStatus.pendingConsultations.filter(
      c => c.status === 'overdue'
    );

    const pendingPayments = user.paymentStatus.pendingConsultations.filter(
      c => c.status === 'pending'
    );

    return {
      canBookAppointments: user.paymentStatus.canBookAppointments,
      totalUnpaid: user.paymentStatus.unpaidAmount,
      pendingCount: pendingPayments.length,
      overdueCount: overduePayments.length,
      isBlocked: user.paymentStatus.paymentRestrictions.blocked,
      blockReason: user.paymentStatus.paymentRestrictions.blockedReason,
      pendingConsultations: user.paymentStatus.pendingConsultations.map(c => ({
        appointmentId: c.appointmentId._id,
        petName: c.appointmentId.petName,
        doctorName: c.doctorId.name,
        amount: c.amount,
        dueDate: c.dueDate,
        status: c.status
      }))
    };

  } catch (error) {
    console.error(' Error getting payment summary:', error);
    throw error;
  }
};

module.exports = {
  checkPaymentStatus,
  addPendingPayment,
  markOverduePayments,
  getPaymentSummary
};