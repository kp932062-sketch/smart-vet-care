import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import FormInput from '../common/FormInput';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/forgot-password', { email });
  setMessage('A reset code has been sent to your email. If you do not see it in your inbox, please check your spam folder.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      setMessage('Password reset successful! You can now log in.');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 rounded-3xl shadow-2xl p-8 border border-white/30 mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Forgot Password</h2>
      {step === 1 && (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div>
            <FormInput
              type="email"
              id="email"
              label="Registered Email"
              placeholder="Enter your registered email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              state={email ? 'success' : undefined}
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700">{message}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
          <button type="button" className="w-full mt-2 text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/login')}>← Back to Login</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div>
            <FormInput
              type="text"
              id="code"
              label="Reset Code"
              placeholder="Enter the code sent to your email"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              state={code ? 'success' : undefined}
            />
          </div>
          <div>
            <FormInput
              type="password"
              id="newPassword"
              label="New Password"
              placeholder="Enter your new password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              state={newPassword ? 'success' : undefined}
            />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{error}</div>}
          {message && <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700">{message}</div>}
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
          <button type="button" className="w-full mt-2 text-gray-600 hover:text-gray-900 font-medium" onClick={() => navigate('/login')}>← Back to Login</button>
        </form>
      )}
      {step === 3 && (
        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 mb-4">{message}</div>
          <button type="button" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-all" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
