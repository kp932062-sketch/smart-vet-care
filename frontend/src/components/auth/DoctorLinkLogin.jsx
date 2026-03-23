import React, { useState } from 'react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { saveRoleSession } from '../../utils/auth';
import FormInput from '../common/FormInput';

const DoctorLinkLogin = () => {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/doctor-link-login', { link });
      if (res.data && res.data.user) {
        const token = res.data?.token || res.data?.user?.token;
        const role = res.data?.role || 'doctor';

        sessionStorage.setItem('doctor', JSON.stringify(res.data.user));
        if (token) {
          sessionStorage.setItem('token', token);
        }
        sessionStorage.setItem('role', role);

        saveRoleSession({ role, token, user: res.data.user });
        navigate(`/doctor-dashboard/${link}`);
      } else {
        setError('Invalid link or doctor not found');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h2 className="text-3xl font-bold mb-4">Doctor Secure Link Login</h2>
      <form className="w-full max-w-sm p-6 bg-gray-100 rounded-lg shadow" onSubmit={handleSubmit}>
        <div className="mb-4">
          <FormInput
            type="text"
            id="accessLink"
            label="Access Link"
            required
            placeholder="Paste your secure link here"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={loading}
          />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </section>
  );
};

export default DoctorLinkLogin;
