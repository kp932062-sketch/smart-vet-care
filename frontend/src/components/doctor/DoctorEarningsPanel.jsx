import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const DoctorEarningsPanel = ({ doctorLink }) => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Helper function to add doctor link to API headers
  const getDoctorApiConfig = () => {
    const config = {};
    if (doctorLink) {
      config.headers = {
        'Doctor-Link': doctorLink
      };
    }
    return config;
  };

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod, doctorLink]);

  const fetchEarnings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/earnings/earnings?period=${selectedPeriod}`, getDoctorApiConfig());
      setEarnings(response.data);
    } catch (err) {
      console.error('Error fetching earnings:', err);
      setError('Failed to load earnings data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchEarnings}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h3>
            <p className="text-gray-600">Track your consultation revenue</p>
          </div>
        </div>
        
        {/* Period Selector */}
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Earnings Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">₹</div>
          <div className="text-lg font-bold">₹{earnings?.totalEarnings || 0}</div>
          <div className="text-sm text-green-100">Total Earnings</div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-lg font-bold">{earnings?.totalConsultations || 0}</div>
          <div className="text-sm text-blue-100">Consultations</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-lg font-bold">₹{earnings?.pendingEarnings || 0}</div>
          <div className="text-sm text-purple-100">Pending Payout</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="text-2xl mb-1">💳</div>
          <div className="text-lg font-bold">₹{earnings?.summary?.averageEarningPerConsultation || 0}</div>
          <div className="text-sm text-orange-100">Avg per Consult</div>
        </div>
      </div>

      {/* Commission Info */}
      <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">ℹ️</span>
          <h4 className="font-semibold text-blue-900">Commission Structure</h4>
        </div>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Platform Commission: <strong>15%</strong> per consultation</p>
          <p>• Your Earnings: <strong>85%</strong> per consultation</p>
          <p>• Payout Schedule: <strong>Weekly</strong></p>
          <p>• Total Revenue Generated: <strong>₹{earnings?.totalRevenue || 0}</strong></p>
          <p>• Platform Commission: <strong>₹{earnings?.totalCommission || 0}</strong></p>
        </div>
      </div>

      {/* Recent Consultations */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📋</span> Recent Consultations
        </h4>
        
        {earnings?.earningsBreakdown && earnings.earningsBreakdown.length > 0 ? (
          <div className="space-y-3">
            {earnings.earningsBreakdown.slice(0, 5).map((consultation, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {consultation.patientName}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consultation.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {consultation.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {new Date(consultation.date).toLocaleDateString()} at {new Date(consultation.date).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{consultation.doctorEarning}
                    </div>
                    <div className="text-xs text-gray-500">
                      Fee: ₹{consultation.consultationFee} | Commission: ₹{consultation.platformCommission}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-gray-600">No consultations yet</p>
            <p className="text-sm text-gray-500">Start consulting to see your earnings here</p>
          </div>
        )}
      </div>

      {/* Payment Info */}
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🏦</span>
          <h4 className="font-semibold text-yellow-900">Payment Information</h4>
        </div>
        <div className="text-sm text-yellow-700">
          <p>• Payments are processed weekly on Fridays</p>
          <p>• Direct bank transfer to your registered account</p>
          <p>• Payment confirmation via email</p>
          <p>• Contact support for any payment queries</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorEarningsPanel;