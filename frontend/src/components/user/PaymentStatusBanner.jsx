import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaRupeeSign } from 'react-icons/fa';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';

const PaymentStatusBanner = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStatus();
    // Check every 30 seconds
    const interval = setInterval(fetchPaymentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPaymentStatus = async () => {
    try {
      // Check if user is logged in
      const token = getActiveToken();
      const user = sessionStorage.getItem('user');
      
      if (!token || !user) {
        setLoading(false);
        return;
      }

      const response = await api.get('/payments/user/status');
      setPaymentStatus(response.data);
    } catch (error) {
      console.error('Error fetching payment status:', error);
      if (error.response?.status === 401) {
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (!paymentStatus) return null;

  // Show warning if user has pending payments
  if (!paymentStatus.canBookAppointments && paymentStatus.paymentStatus.hasPendingPayments) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r-lg">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-2" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              Payment Required: â‚¹{paymentStatus.paymentStatus.unpaidAmount} pending
            </p>
            <p className="text-xs text-red-700">
              Clear your dues to book new appointments
            </p>
          </div>
          <button
            onClick={() => window.location.hash = '#reports'}
            className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors"
          >
            View Reports
          </button>
        </div>
      </div>
    );
  }

  // Show success if no pending payments
  if (paymentStatus.canBookAppointments && !paymentStatus.paymentStatus.hasPendingPayments) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-3 mb-4 rounded-r-lg">
        <div className="flex items-center">
          <FaCheckCircle className="text-green-500 mr-2" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">
              Account in good standing
            </p>
            <p className="text-xs text-green-700">
              You can book appointments anytime
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStatusBanner;
