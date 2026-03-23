import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import VideoCallPanel from '../video/VideoCallPanel';

const ConsultationPanel = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      // Get today's confirmed appointments for the doctor
      const response = await api.get('/appointments/doctor/today');
      setAppointments(response.data || []);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const startConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setShowVideoCall(true);
  };

  const endConsultation = () => {
    setShowVideoCall(false);
    setSelectedAppointment(null);
    // Refresh appointments
    fetchTodayAppointments();
  };

  if (showVideoCall && selectedAppointment) {
    return (
      <div className="h-full">
        <VideoCallPanel
          appointmentId={selectedAppointment._id}
          onCallEnd={endConsultation}
          userType="doctor"
        />
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💬</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Consultation Tools</h3>
            <p className="text-gray-600">Start video consultations with your patients</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600">Loading appointments...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span>⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      {!loading && !error && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Today's Appointments</h4>
          
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <div key={appointment._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">🐾</span>
                        <div>
                          <h5 className="font-semibold text-gray-900">{appointment.petName}</h5>
                          <p className="text-sm text-gray-600">Owner: {appointment.user?.name || 'Unknown'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="ml-1 font-medium">{appointment.time}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Reason:</span>
                        <p className="text-sm text-gray-700 mt-1">{appointment.reason}</p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => startConsultation(appointment)}
                        disabled={appointment.status !== 'confirmed'}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          appointment.status === 'confirmed'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {appointment.status === 'confirmed' ? '📹 Start Consultation' : 'Not Ready'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📋</span>
              <div>
                <h5 className="font-medium text-blue-900">Prescription Pad</h5>
                <p className="text-sm text-blue-700">Write prescriptions</p>
              </div>
            </div>
          </button>
          
          <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h5 className="font-medium text-green-900">Medical Records</h5>
                <p className="text-sm text-green-700">View patient history</p>
              </div>
            </div>
          </button>
          
          <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 text-left transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📝</span>
              <div>
                <h5 className="font-medium text-orange-900">Notes</h5>
                <p className="text-sm text-orange-700">Take consultation notes</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPanel;
