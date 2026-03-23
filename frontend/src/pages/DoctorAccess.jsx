import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const DoctorAccess = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyAccess();
    }
  }, [token]);

  const verifyAccess = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get(`/doctor-access/${token}`);
      
      if (response.data.success) {
        // Store user data in sessionStorage
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSuccess(true);
        
        // Redirect to doctor dashboard after a short delay
        setTimeout(() => {
          navigate('/doctor-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Access verification failed:', err);
      setError(err.response?.data?.error || 'Invalid or expired access link');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/30">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Verifying Access</h2>
          <p className="text-gray-600">Please wait while we verify your access link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/30">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to SmartVet!</h2>
          <p className="text-gray-600 mb-6">Access granted successfully. Redirecting to your dashboard...</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">🚀 Redirecting to doctor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/30">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">What happened?</h3>
            <ul className="text-red-700 text-sm text-left space-y-1">
              <li>• Your access link may have expired</li>
              <li>• The link may be invalid or corrupted</li>
              <li>• Your account may not be approved yet</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/career-portal')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              📋 Apply Again
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              📞 Contact Support
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-all"
            >
              🏠 Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DoctorAccess;