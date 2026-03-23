import React from 'react';


const DoctorProfile = () => {
  const doctor = JSON.parse(sessionStorage.getItem('doctor'));
  if (!doctor) return null;
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-300 rounded-2xl shadow-2xl p-10 mt-10 max-w-2xl mx-auto flex flex-col items-center">
      {doctor.profileImage ? (
        <img src={doctor.profileImage} alt={doctor.name} className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-lg mb-4" />
      ) : (
        <div className="w-28 h-28 rounded-full bg-blue-200 flex items-center justify-center text-5xl border-4 border-blue-400 shadow-lg mb-4">👨‍⚕️</div>
      )}
      <h3 className="text-2xl font-extrabold mb-1 text-blue-800 tracking-tight">{doctor.name}</h3>
      <div className="text-sm text-gray-500 mb-2">{doctor.specialization}</div>
      {/* Availability Section */}
      <div className="w-full bg-blue-100 rounded-xl p-4 mb-4 shadow flex flex-col items-center">
        <div className="flex gap-4 items-center">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${doctor.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>{doctor.isOnline ? 'Online' : 'Offline'}</span>
          <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${doctor.isAvailable ? 'bg-green-600' : 'bg-red-500'}`}>{doctor.isAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700">Working Hours: {doctor.workingHours?.start || '09:00'} - {doctor.workingHours?.end || '18:00'}</div>
        {/* Mode Selection */}
        <div className="mt-2">
          <label className="font-semibold mr-2">Consultation Mode:</label>
          <select className="rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100" defaultValue={doctor.mode || 'online'}>
            <option value="online">Online</option>
            <option value="clinic">Clinic</option>
            <option value="home">Home Visit</option>
          </select>
        </div>
      </div>
      {/* Info Section */}
      <div className="w-full flex flex-col gap-2 mt-2">
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="mb-1"><span className="font-semibold">Email:</span> {doctor.email}</div>
          <div className="mb-1"><span className="font-semibold">Mobile:</span> {doctor.mobile}</div>
        </div>
        <div className="flex flex-col md:flex-row md:gap-4">
          {doctor.education && <div className="mb-1"><span className="font-semibold">Education:</span> {doctor.education}</div>}
          <div className="mb-1"><span className="font-semibold">Experience:</span> {doctor.experience} years</div>
        </div>
        {doctor.bio && <div className="mb-1"><span className="font-semibold">Bio:</span> {doctor.bio}</div>}
        {doctor.clinicAddress && <div className="mb-1"><span className="font-semibold">Clinic:</span> {doctor.clinicAddress}</div>}
        {doctor.languages && doctor.languages.length > 0 && <div className="mb-1"><span className="font-semibold">Languages:</span> {doctor.languages.join(', ')}</div>}
        <div className="flex flex-col md:flex-row md:gap-4">
          <div className="mb-1"><span className="font-semibold">Rating:</span> {doctor.rating} ⭐ ({doctor.totalReviews} reviews)</div>
          <div className="mb-1"><span className="font-semibold">Consultations:</span> {doctor.completedConsultations}/{doctor.totalConsultations}</div>
        </div>
        {doctor.licenseNumber && <div className="mb-1"><span className="font-semibold">License:</span> {doctor.licenseNumber}</div>}
        {doctor.subscriptionType && <div className="mb-1"><span className="font-semibold">Subscription:</span> {doctor.subscriptionType}</div>}
        <div className="mb-1"><span className="font-semibold">Commission Rate:</span> {doctor.commissionRate * 100}%</div>
        <div className="mb-1"><span className="font-semibold">Total Earnings:</span> ₹{doctor.totalEarnings}</div>
        <div className="mb-1"><span className="font-semibold">Status:</span> {doctor.isActive ? 'Active' : 'Inactive'}{doctor.approved ? ' (Approved)' : ' (Pending)'}</div>
        <div className="mb-1"><span className="font-semibold">Access Link:</span> <span className="break-all">{doctor.uniqueAccessLink}</span></div>
        <div className="mb-1"><span className="font-semibold">Created At:</span> {new Date(doctor.createdAt).toLocaleDateString()}</div>
        <div className="mb-1"><span className="font-semibold">Last Updated:</span> {new Date(doctor.updatedAt).toLocaleDateString()}</div>
      </div>
    </div>
  );
};

export default DoctorProfile;