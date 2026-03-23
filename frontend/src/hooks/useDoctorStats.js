import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useDoctorStats = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    rating: 0,
    status: 'offline'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctorStats = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        setError('Doctor not authenticated');
        return;
      }

      // Fetch today's appointments for this doctor
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await api.get(`/appointments/doctor/${user._id}?date=${today}`);
      const todayAppointments = appointmentsResponse.data.filter(appt => {
        const appointmentDate = new Date(appt.date).toISOString().split('T')[0];
        return appointmentDate === today;
      });

      // Fetch all appointments for total patients count
      const allAppointmentsResponse = await api.get(`/appointments/doctor/${user._id}`);
      const uniquePatients = new Set(allAppointmentsResponse.data.map(appt => appt.user?._id || appt.userId)).size;

      setStats({
        todayAppointments: todayAppointments.length,
        totalPatients: uniquePatients,
        rating: 4.9, // This could be fetched from a reviews endpoint
        status: 'online' // This could be based on doctor's availability
      });
    } catch (err) {
      console.error('Error fetching doctor stats:', err);
      setError('Failed to load doctor statistics');
      setStats({
        todayAppointments: 0,
        totalPatients: 0,
        rating: 0,
        status: 'offline'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorStats();
  }, [fetchDoctorStats]);

  const refreshStats = () => {
    fetchDoctorStats();
  };

  return { stats, loading, error, refreshStats };
};

export default useDoctorStats;