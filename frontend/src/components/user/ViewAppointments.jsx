import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = getActiveToken();
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const res = await api.get(`/appointments/user/${payload.id}`);
          setAppointments(res.data);
        }
      } catch (err) {
        setError('Failed to fetch appointments');
      }
      setLoading(false);
    };
    fetchAppointments();
  }, []);

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold text-blue-700 mb-6">Your Appointments</h3>
        
        {loading && <div className="text-blue-600">Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        
        {appointments.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500">No appointments found</p>
          </div>
        )}
        
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{appt.date} at {appt.time}</h4>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {appt.status || 'Pending'}
                </span>
              </div>
              <p><strong>Pet:</strong> {appt.petName}</p>
              <p><strong>Doctor:</strong> Dr. {appt.doctor?.name || appt.doctor}</p>
              <p><strong>Reason:</strong> {appt.reason}</p>
              
              <div className="mt-3 flex gap-2">
                {appt.status === 'confirmed' && (
                  <button
                    onClick={() => navigate(/video-call/)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                     Join Video Call
                  </button>
                )}
                {appt.status === 'report_ready' && (
                  <button
                    onClick={() => navigate(/consultation-payment/)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                     Complete Payment
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;
