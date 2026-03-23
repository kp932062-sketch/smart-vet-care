import React from 'react';
import DoctorForm from '../../components/DoctorForm';

const AddDoctor = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10" style={{ marginTop: '100px' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin - Add Doctor</h1>
        <p className="text-gray-600 mb-6">Create a new active doctor account from the admin panel.</p>
        <DoctorForm />
      </div>
    </div>
  );
};

export default AddDoctor;
