
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FormInput from '../common/FormInput';

const Register = () => {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Only send mobile if provided
    const result = await register(name, email, mobile || undefined, password);
    if (result?.success) {
      navigate(result.redirectTo || '/dashboard');
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      {/* SmartVet Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl text-white">
            🩺
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            <span className="text-blue-600">Smart</span><span className="text-emerald-600">Vet</span>
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg">Join thousands of pet owners</p>
      </div>

      {/* Register Form */}
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-300">Start your animal healthcare journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <FormInput
                type="text"
                id="name"
                label="Full Name"
                icon="👤"
                placeholder="Enter your full name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
                error={error && error.toLowerCase().includes('already exists') ? error : undefined}
              />
            </div>

            <div>
              <FormInput
                type="tel"
                id="mobile"
                label="Mobile Number (optional)"
                icon="📱"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>

            <div>
              <FormInput
                type="password"
                id="password"
                label="Password"
                icon="🔒"
                placeholder="Create a strong password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error && !error.toLowerCase().includes('already exists') ? error : undefined}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Already have an account? {' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-emerald-600 font-semibold hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
            </p>
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

      {/* Features Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
          <div className="text-2xl mb-2">🩺</div>
          <div className="text-sm font-semibold text-gray-800">Expert Vets</div>
          <div className="text-xs text-gray-600">500+ Certified Doctors</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
          <div className="text-2xl mb-2">⚡</div>
          <div className="text-sm font-semibold text-gray-800">Instant Care</div>
          <div className="text-xs text-gray-600">24/7 Emergency Support</div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-sm font-semibold text-gray-800">Trusted</div>
          <div className="text-xs text-gray-600">10K+ Happy Farmers</div>
        </div>
      </div>
    </section>
  );
};

export default Register;
