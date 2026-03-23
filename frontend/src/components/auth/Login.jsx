
import React, { useState } from 'react';
import ReactivationModal from './ReactivationModal';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../common/FormInput';

const Login = ({ mode = 'user' }) => {
  const isAdmin = mode === 'admin';

  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showReactivation, setShowReactivation] = useState(false);
  const [reactivationReason, setReactivationReason] = useState('');
  const [reactivationLoading, setReactivationLoading] = useState(false);
  const [reactivationMsg, setReactivationMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const result = await login(email, password);
    // If login fails due to deactivation, show reactivation modal
    if (result?.error && result.error.toLowerCase().includes('deactivated')) {
      setShowReactivation(true);
    }
    if (result?.error) {
      setFormError(result.error);
    }
    if (result?.success) {
      navigate(result.redirectTo || '/dashboard');
    }
  };

  const handleReactivationSubmit = async () => {
    if (!email || !reactivationReason || reactivationReason.trim().length < 3) return;
    setReactivationLoading(true);
    setReactivationMsg('');
    try {
      await api.post('/auth/request-reactivation', { email, reason: reactivationReason });
      setReactivationMsg('Your reactivation request has been submitted. The admin will review it soon.');
      setShowReactivation(false);
      setReactivationReason('');
    } catch (err) {
      setReactivationMsg('Failed to submit reactivation request. Please try again later.');
    } finally {
      setReactivationLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      {/* SmartVet Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white">
            🩺
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            <span className="text-blue-600">Smart</span><span className="text-emerald-600">Vet</span>
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          {isAdmin ? 'Admin access to platform operations' : 'Welcome back to your veterinary platform'}
        </p>
      </div>

      {/* Reactivation Modal */}
      <ReactivationModal
        isOpen={showReactivation}
        onClose={() => setShowReactivation(false)}
        onSubmit={handleReactivationSubmit}
        reason={reactivationReason}
        setReason={setReactivationReason}
        loading={reactivationLoading}
      />

      {/* Login Form */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{isAdmin ? 'Admin Sign In' : 'Sign In'}</h2>
            <p className="text-gray-600 dark:text-gray-300">{isAdmin ? 'Access SmartVet administration dashboard' : 'Access your animal healthcare dashboard'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <FormInput
                type="email"
                id="email"
                label="Email Address"
                icon="📧"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formError ? formError : undefined}
              />
            </div>

            <div>
              <FormInput
                type="password"
                id="password"
                label="Password"
                icon="🔒"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formError ? formError : undefined}
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-blue-600 hover:text-emerald-600 text-sm font-semibold focus:outline-none"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && error.toLowerCase().includes('deactivated') && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
                <button
                  type="button"
                  className="mt-2 text-blue-600 underline text-sm"
                  onClick={() => setShowReactivation(true)}
                >
                  Request Reactivation
                </button>
              </div>
            )}

            {reactivationMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-2 text-emerald-700 text-sm font-medium">
                {reactivationMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {!isAdmin && (
              <p className="text-gray-600 dark:text-gray-300">
                Don't have an account? {' '}
                <button 
                  onClick={() => navigate('/register')}
                  className="text-blue-600 font-semibold hover:text-emerald-600 transition-colors"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={() => navigate('/')}
              className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 flex flex-wrap gap-6 justify-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">🔒</span>
          <span>Secure Login</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">🩺</span>
          <span>Trusted by 10K+ Farmers</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600">⚡</span>
          <span>24/7 Support</span>
        </div>
      </div>
    </section>
  );
};

export default Login;
