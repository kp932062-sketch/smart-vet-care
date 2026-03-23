import React, { useMemo, useState } from 'react';
import api from '../utils/api';
import FormInput from './common/FormInput';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  experience: '',
  consultation_fee: '',
  availability: ''
};

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

const DoctorForm = () => {
  const [form, setForm] = useState(initialForm);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validation = useMemo(() => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!isValidEmail(form.email)) errors.email = 'Invalid email format.';
    if (!form.password) errors.password = 'Password is required.';
    else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (form.experience && Number(form.experience) < 0) errors.experience = 'Experience cannot be negative.';
    if (form.consultation_fee && Number(form.consultation_fee) < 0) errors.consultation_fee = 'Fee cannot be negative.';
    return errors;
  }, [form]);

  const hasValidationErrors = Object.keys(validation).length > 0;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setProfileImage(file);
  };

  const resetForm = () => {
    setForm(initialForm);
    setProfileImage(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (hasValidationErrors) {
      setError('Please fix validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (profileImage) {
        const fd = new FormData();
        Object.entries(form).forEach(([key, value]) => fd.append(key, value));
        fd.append('profileImage', profileImage);
        response = await api.post('/admin/doctors', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/admin/doctors', {
          ...form,
          experience: form.experience === '' ? null : Number(form.experience),
          consultation_fee: form.consultation_fee === '' ? null : Number(form.consultation_fee)
        });
      }

      setSuccess(response?.data?.message || 'Doctor added successfully');
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <FormInput label="Name" name="name" value={form.name} onChange={onChange} required />
          {validation.name && <p className="text-xs text-red-600 mt-1">{validation.name}</p>}
        </div>

        <div>
          <FormInput label="Email" type="email" name="email" value={form.email} onChange={onChange} required />
          {validation.email && <p className="text-xs text-red-600 mt-1">{validation.email}</p>}
        </div>

        <div>
          <FormInput label="Phone" name="phone" value={form.phone} onChange={onChange} />
        </div>

        <div>
          <FormInput label="Password" type="password" name="password" value={form.password} onChange={onChange} required />
          {validation.password && <p className="text-xs text-red-600 mt-1">{validation.password}</p>}
        </div>

        <div>
          <FormInput label="Specialization" name="specialization" value={form.specialization} onChange={onChange} />
        </div>

        <div>
          <FormInput label="Experience (years)" type="number" min="0" name="experience" value={form.experience} onChange={onChange} />
          {validation.experience && <p className="text-xs text-red-600 mt-1">{validation.experience}</p>}
        </div>

        <div>
          <FormInput label="Consultation Fee" type="number" min="0" step="0.01" name="consultation_fee" value={form.consultation_fee} onChange={onChange} />
          {validation.consultation_fee && <p className="text-xs text-red-600 mt-1">{validation.consultation_fee}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
        <textarea
          name="availability"
          value={form.availability}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
          placeholder="e.g. Mon-Fri: 10:00-16:00"
        />
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded-lg">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-2 rounded-lg">{success}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg disabled:opacity-60"
      >
        {loading ? 'Adding Doctor...' : 'Add Doctor'}
      </button>
    </form>
  );
};

export default DoctorForm;
