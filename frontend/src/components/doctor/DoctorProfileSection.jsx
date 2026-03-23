import React, { useState } from 'react';
import api from '../../utils/api';

const DoctorProfileSection = () => {
  const doctor = JSON.parse(sessionStorage.getItem('doctor'));
  const [isAvailable, setIsAvailable] = useState(doctor?.isAvailable || false);
  const [mode, setMode] = useState(doctor?.mode || 'online');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!doctor) return null;

  const handleAvailabilityChange = async (e) => {
    const value = e.target.checked;
    setIsAvailable(value);
    setLoading(true);
    try {
      const res = await api.put(`/doctors/${doctor._id}`, { isAvailable: value });
      sessionStorage.setItem('doctor', JSON.stringify({ ...doctor, isAvailable: value }));
      setMessage('Availability updated!');
    } catch (err) {
      setMessage('Error updating availability');
    }
    setLoading(false);
  };

  const handleModeChange = async (e) => {
    const value = e.target.value;
    setMode(value);
    setLoading(true);
    try {
      const res = await api.put(`/doctors/${doctor._id}`, { mode: value });
      sessionStorage.setItem('doctor', JSON.stringify({ ...doctor, mode: value }));
      setMessage('Mode updated!');
    } catch (err) {
      setMessage('Error updating mode');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white border border-blue-200 rounded-xl shadow p-6 mb-6 max-w-xl mx-auto">
      <h2 className="text-lg font-bold mb-4 text-blue-700">Doctor Profile Settings</h2>
      <div className="flex items-center mb-4">
        <label className="font-semibold mr-2">Available for Consultation:</label>
        <input type="checkbox" checked={isAvailable} onChange={handleAvailabilityChange} disabled={loading} />
        <span className={`ml-3 px-2 py-1 rounded text-xs font-bold ${isAvailable ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span>
      </div>
      <div className="mb-4">
        <label className="font-semibold mr-2">Consultation Mode:</label>
        <select value={mode} onChange={handleModeChange} className="rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" disabled={loading}>
          <option value="online">Online</option>
          <option value="clinic">Clinic</option>
          <option value="home">Home Visit</option>
        </select>
      </div>
      {message && <div className="text-sm text-blue-600 mt-2">{message}</div>}
    </div>
  );
};

export default DoctorProfileSection;
