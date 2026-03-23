import React, { useState, useEffect } from 'react';
import { FaUniversity, FaEdit, FaSave, FaTimes, FaCheckCircle, FaClock, FaRupeeSign, FaChartLine } from 'react-icons/fa';
import api from '../../utils/api';
import FormInput from '../common/FormInput';

const BankingPanel = () => {
  const [doctor, setDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    verified: false
  });
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    monthlyEarnings: 0,
    platformFee: 0,
    consultationsCompleted: 0,
    averagePerConsultation: 0,
    pendingPayoutsList: [],
    processedPayoutsList: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorData = JSON.parse(sessionStorage.getItem('doctor'));
        if (doctorData) {
          setDoctor(doctorData);
          
          // Fetch latest doctor data with banking details
          const doctorResponse = await api.get(`/api/doctors/${doctorData._id}`);
          const updatedDoctor = doctorResponse.data;
          
          setBankDetails(updatedDoctor.bankDetails || {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            verified: false
          });
          
          // Fetch detailed earnings data
          const earningsResponse = await api.get(`/api/payments/doctor/earnings/${doctorData._id}`);
          const earningsData = earningsResponse.data;
          
          const currentDate = new Date();
          const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          
          setEarnings({
            totalEarnings: earningsData.earnings.totalEarnings || 0,
            pendingPayouts: earningsData.earnings.pendingPayout || 0,
            monthlyEarnings: updatedDoctor.monthlyEarnings?.get ? updatedDoctor.monthlyEarnings.get(currentMonth) || 0 : 0,
            platformFee: Math.round((earningsData.earnings.totalEarnings || 0) * 0.18), // 18% platform fee
            consultationsCompleted: earningsData.earnings.consultationsCompleted || 0,
            averagePerConsultation: earningsData.earnings.averagePerConsultation || 0,
            pendingPayoutsList: earningsData.payouts.pending || [],
            processedPayoutsList: earningsData.payouts.processed || []
          });
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        setMessage({ type: 'error', text: 'Failed to load banking information' });
      }
    };

    fetchDoctorData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveBankDetails = async () => {
    if (!doctor) return;
    
    setLoading(true);
    try {
      const response = await api.put(`/api/doctors/${doctor._id}/banking`, {
        bankDetails
      });
      
      setMessage({ type: 'success', text: 'Banking details saved successfully!' });
      setEditMode(false);
      
      // Update local storage
      const updatedDoctor = { ...doctor, bankDetails: response.data.bankDetails };
      sessionStorage.setItem('doctor', JSON.stringify(updatedDoctor));
      setDoctor(updatedDoctor);
      
    } catch (error) {
      console.error('Error saving banking details:', error);
      setMessage({ type: 'error', text: 'Failed to save banking details' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FaUniversity className="text-2xl text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Banking & Earnings</h2>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FaEdit />
            Edit Details
          </button>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <FaRupeeSign className="text-emerald-600" />
            <span className="text-sm font-medium text-gray-600">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {formatCurrency(earnings.totalEarnings)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All time earnings
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <FaClock className="text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Pending Payouts</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(earnings.pendingPayouts)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Next payout: Monday
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <FaChartLine className="text-blue-600" />
            <span className="text-sm font-medium text-gray-600">This Month</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(earnings.monthlyEarnings)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Current month earnings
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-600">💼</span>
            <span className="text-sm font-medium text-gray-600">Platform Fee (18%)</span>
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {formatCurrency(earnings.platformFee)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total fees deducted
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">🏥</span>
            <span className="text-sm font-medium text-gray-600">Consultations Completed</span>
          </div>
          <div className="text-2xl font-bold text-indigo-600">
            {earnings.consultationsCompleted}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Total consultations
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium text-gray-600">Average per Consultation</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(earnings.averagePerConsultation)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            After platform fee
          </div>
        </div>
      </div>

      {/* Banking Details Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Banking Information</h3>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            bankDetails.verified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-orange-100 text-orange-800'
          }`}>
            {bankDetails.verified ? <FaCheckCircle /> : <FaClock />}
            {bankDetails.verified ? 'Verified' : 'Pending Verification'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder Name
            </label>
            {editMode ? (
              <FormInput
                type="text"
                name="accountHolderName"
                label=""
                value={bankDetails.accountHolderName}
                onChange={handleInputChange}
                placeholder="Enter account holder name"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                {bankDetails.accountHolderName || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number
            </label>
            {editMode ? (
              <FormInput
                type="text"
                name="accountNumber"
                label=""
                value={bankDetails.accountNumber}
                onChange={handleInputChange}
                placeholder="Enter account number"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                {bankDetails.accountNumber ? 
                  `****${bankDetails.accountNumber.slice(-4)}` : 
                  'Not provided'
                }
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code
            </label>
            {editMode ? (
              <FormInput
                type="text"
                name="ifscCode"
                label=""
                value={bankDetails.ifscCode}
                onChange={handleInputChange}
                placeholder="Enter IFSC code"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                {bankDetails.ifscCode || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name
            </label>
            {editMode ? (
              <FormInput
                type="text"
                name="bankName"
                label=""
                value={bankDetails.bankName}
                onChange={handleInputChange}
                placeholder="Enter bank name"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
                {bankDetails.bankName || 'Not provided'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons for Edit Mode */}
        {editMode && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveBankDetails}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <FaSave />
              {loading ? 'Saving...' : 'Save Details'}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setMessage({ type: '', text: '' });
              }}
              className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payouts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaClock className="text-orange-600" />
            Pending Payouts
          </h3>
          {earnings.pendingPayoutsList && earnings.pendingPayoutsList.length > 0 ? (
            <div className="space-y-3">
              {earnings.pendingPayoutsList.map((payout, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div>
                    <div className="font-medium text-gray-800">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Consultation: {new Date(payout.consultationDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-600">
                      Next payout
                    </div>
                    <div className="text-xs text-gray-500">
                      {payout.scheduledFor ? new Date(payout.scheduledFor).toLocaleDateString() : 'Monday'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaCheckCircle className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>No pending payouts</p>
              <p className="text-sm">All earnings have been processed</p>
            </div>
          )}
        </div>

        {/* Recent Payouts */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-green-600" />
            Recent Payouts
          </h3>
          {earnings.processedPayoutsList && earnings.processedPayoutsList.length > 0 ? (
            <div className="space-y-3">
              {earnings.processedPayoutsList.slice(0, 5).map((payout, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div>
                    <div className="font-medium text-gray-800">
                      {formatCurrency(payout.amount)}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {payout.payoutId || 'Processing'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      Completed
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(payout.processedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FaClock className="text-4xl text-gray-300 mx-auto mb-3" />
              <p>No payouts yet</p>
              <p className="text-sm">Complete consultations to start earning</p>
            </div>
          )}
        </div>
      </div>

      {/* Payout Information */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Payout Information</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Payouts are processed every Monday for the previous week's earnings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Platform retains 18% commission for services and transaction fees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>Bank details must be verified before first payout</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Minimum payout amount: ₹500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankingPanel;