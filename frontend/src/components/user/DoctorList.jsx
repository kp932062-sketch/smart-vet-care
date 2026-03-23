
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorList = ({ doctors, loading, error }) => {
  const [filter, setFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const navigate = useNavigate();

  const filteredDoctors = filter === 'available' ? doctors.filter(doc => doc.isAvailable) : doctors;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 w-full max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="pt-20 sm:pt-28 pb-12 sm:pb-20 px-2 sm:px-4 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto bg-white/30 backdrop-blur-md border border-white/20 p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl">
          {/* Header with Back Button - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors bg-white/50 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 hover:bg-white/70 border border-white/30 text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800 drop-shadow-sm">Our Doctors</h2>
          </div>

          {/* Filter Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border text-sm sm:text-base ${
                filter === 'all' 
                  ? 'bg-blue-600/90 text-white border-blue-500/30 shadow-lg' 
                  : 'bg-white/40 text-gray-700 hover:bg-white/60 border-white/30 hover:shadow-md'
              }`}
            >
              All Doctors ({doctors?.length || 0})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 backdrop-blur-sm border text-sm sm:text-base ${
                filter === 'available' 
                  ? 'bg-green-600/90 text-white border-green-500/30 shadow-lg' 
                  : 'bg-white/40 text-gray-700 hover:bg-white/60 border-white/30 hover:shadow-md'
              }`}
            >
              Available Now ({doctors?.filter(d => d.isAvailable).length || 0})
            </button>
          </div>

          {/* Scrollable Doctors List - Responsive */}
          <div className="max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-blue-300/50 scrollbar-track-transparent">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="text-4xl sm:text-6xl text-gray-400/60 mb-3 sm:mb-4">👨‍⚕️</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 drop-shadow-sm">No Doctors Found</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {filter === 'available' 
                    ? 'No doctors are currently available. Please try again later.' 
                    : 'No doctors in our database yet.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div 
                    key={doctor._id} 
                    className="bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:bg-white/60 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Doctor Header - Improved Layout */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      {doctor.profileImage ? (
                        <img 
                          src={doctor.profileImage} 
                          alt={doctor.name} 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white/50 shadow-md flex-shrink-0" 
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100/80 backdrop-blur-sm flex items-center justify-center text-lg sm:text-xl border-2 border-white/50 shadow-md flex-shrink-0">
                          👨‍⚕️
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 drop-shadow-sm truncate">{doctor.name}</h3>
                        <p className="text-blue-700 font-medium text-sm sm:text-base mb-2">{doctor.specialization}</p>
                        
                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                            doctor.isAvailable 
                              ? 'bg-green-100/80 text-green-800 border-green-200/50' 
                              : 'bg-red-100/80 text-red-800 border-red-200/50'
                          }`}>
                            {doctor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                          </span>
                          <span className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                            doctor.isOnline 
                              ? 'bg-blue-100/80 text-blue-800 border-blue-200/50' 
                              : 'bg-gray-100/80 text-gray-800 border-gray-200/50'
                          }`}>
                            {doctor.isOnline ? '🟢 Online' : '⚪ Offline'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <button
                        onClick={() => setSelectedDoctor(doctor)}
                        className="bg-blue-600/90 backdrop-blur-sm text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700/90 transition-all duration-200 border border-blue-500/30 shadow-md hover:shadow-lg whitespace-nowrap flex-shrink-0"
                      >
                        View Details
                      </button>
                    </div>

                    {/* Doctor Information Grid - Better Organization */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Contact Information */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1">
                          <span>📞</span> Contact
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">📧</span>
                            <span className="ml-1 break-all">{doctor.email}</span>
                          </div>
                          {doctor.mobile && (
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">📱</span>
                              <span className="ml-1">{doctor.mobile}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Info */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1">
                          <span>🎓</span> Professional
                        </h4>
                        <div className="space-y-1">
                          {doctor.experience && (
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">Experience:</span>
                              <span className="ml-1">{doctor.experience} years</span>
                            </div>
                          )}
                          {doctor.education && (
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">Education:</span>
                              <span className="ml-1">{doctor.education}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Performance & Location */}
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/20 sm:col-span-2 lg:col-span-1">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1">
                          <span>⭐</span> Rating & Location
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Rating:</span>
                            <span className="ml-1">{doctor.rating || 'N/A'} ({doctor.totalReviews || 0} reviews)</span>
                          </div>
                          {doctor.clinicAddress && (
                            <div className="text-xs text-gray-700">
                              <span className="font-medium">🏥 Clinic:</span>
                              <span className="ml-1 break-words">{doctor.clinicAddress}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio Section - If Available */}
                    {doctor.bio && (
                      <div className="mt-4 p-3 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-2 flex items-center gap-1">
                          <span>💬</span> About
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{doctor.bio}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Doctor Details Modal - Responsive */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-sm sm:max-w-xl lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Responsive */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-6 rounded-t-lg sm:rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4">
                  {selectedDoctor.profileImage ? (
                    <img 
                      src={selectedDoctor.profileImage} 
                      alt={selectedDoctor.name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 sm:border-4 border-blue-100" 
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl sm:text-2xl">
                      👨‍⚕️
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{selectedDoctor.name}</h2>
                    <p className="text-blue-600 font-medium text-sm sm:text-lg">{selectedDoctor.specialization}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold p-1"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content - Responsive */}
            <div className="p-3 sm:p-6">
              {/* Status Badges - Responsive */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full ${
                  selectedDoctor.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedDoctor.isAvailable ? '✅ Available' : '❌ Unavailable'}
                </span>
                <span className={`px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold rounded-full ${
                  selectedDoctor.isOnline 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDoctor.isOnline ? '🟢 Online' : '⚪ Offline'}
                </span>
              </div>

              {/* Doctor Information - Responsive Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className="font-medium">📧 Email:</span>
                        <a href={`mailto:${selectedDoctor.email}`} className="text-blue-600 hover:underline break-all">
                          {selectedDoctor.email}
                        </a>
                      </div>
                      {selectedDoctor.mobile && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">📱 Mobile:</span>
                          <a href={`tel:${selectedDoctor.mobile}`} className="text-blue-600 hover:underline">
                            {selectedDoctor.mobile}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Professional Details</h4>
                    <div className="space-y-2">
                      {selectedDoctor.experience && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">🎓 Experience:</span>
                          <span>{selectedDoctor.experience} years</span>
                        </div>
                      )}
                      {selectedDoctor.education && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">🎓 Education:</span>
                          <span>{selectedDoctor.education}</span>
                        </div>
                      )}
                      {selectedDoctor.licenseNumber && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">📄 License:</span>
                          <span>{selectedDoctor.licenseNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <span className="font-medium">⭐ Rating:</span>
                        <span>{selectedDoctor.rating || 'N/A'} ({selectedDoctor.totalReviews || 0} reviews)</span>
                      </div>
                      {selectedDoctor.completedConsultations && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">👥 Consultations:</span>
                          <span>{selectedDoctor.completedConsultations}/{selectedDoctor.totalConsultations || selectedDoctor.completedConsultations}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Location & Services</h4>
                    <div className="space-y-2">
                      {selectedDoctor.clinicAddress && (
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">🏥 Clinic:</span>
                          <span>{selectedDoctor.clinicAddress}</span>
                        </div>
                      )}
                      {selectedDoctor.languages && selectedDoctor.languages.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                          <span className="font-medium">🗣️ Languages:</span>
                          <span>{selectedDoctor.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section - Responsive */}
              {selectedDoctor.bio && (
                <div className="mt-4 sm:mt-6">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">About</h4>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-gray-700">{selectedDoctor.bio}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <a 
                  href={`mailto:${selectedDoctor.email}`}
                  className="flex-1 bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  📧 Send Email
                </a>
                {selectedDoctor.mobile && (
                  <a 
                    href={`tel:${selectedDoctor.mobile}`}
                    className="flex-1 bg-green-600 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-center font-medium hover:bg-green-700 transition-colors text-sm sm:text-base"
                  >
                    📱 Call Now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorList;