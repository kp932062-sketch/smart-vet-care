import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { clearAllSessions, getActiveRole, getActiveUser } from '../../utils/auth';
import AdminNavbar from './nav/AdminNavbar';
import UserNavbar from './nav/UserNavbar';
import DoctorNavbar from './nav/DoctorNavbar';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authData, setAuthData] = useState({
    user: null,
    doctor: null,
    userRole: null,
    isLoading: true,
  });
  const [routeDoctor, setRouteDoctor] = useState(null);

  /* ── Load auth ── */
  useEffect(() => {
    try {
      const userData = sessionStorage.getItem('user');
      const doctorData = sessionStorage.getItem('doctor');
      const userRole = getActiveRole();
      const activeRoleUser = getActiveUser();
      setAuthData({
        user: activeRoleUser || (userData ? JSON.parse(userData) : null),
        doctor: doctorData ? JSON.parse(doctorData) : null,
        userRole,
        isLoading: false,
      });
    } catch {
      setAuthData({ user: null, doctor: null, userRole: null, isLoading: false });
    }
  }, []);

  /* ── Load doctor from route ── */
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/doctor-dashboard/')) {
      const doctorLink = currentPath.split('/doctor-dashboard/')[1]?.split('/')[0];
      if (doctorLink && doctorLink !== 'dashboard') {
        const storedDoctorData = sessionStorage.getItem('doctor');
        if (storedDoctorData) {
          try {
            const parsed = JSON.parse(storedDoctorData);
            if (parsed.uniqueAccessLink && parsed.uniqueAccessLink.includes(doctorLink)) {
              setRouteDoctor(parsed);
              return;
            }
          } catch {}
        }
        fetchDoctorByLink(doctorLink);
      }
    } else {
      setRouteDoctor(null);
    }
  }, [location.pathname]);

  const fetchDoctorByLink = async (doctorLink) => {
    try {
      const response = await api.get(`/doctor/verify-access/${doctorLink}`);
      if (response.data.valid && response.data.doctor) {
        const d = {
          _id: response.data.doctor.id,
          name: response.data.doctor.name,
          email: response.data.doctor.email,
          specialization: response.data.doctor.specialization,
          uniqueAccessLink: doctorLink,
          approved: response.data.doctor.approved,
          status: response.data.doctor.status,
        };
        setRouteDoctor(d);
        sessionStorage.setItem('doctor', JSON.stringify(d));
      }
    } catch {}
  };

  const { user, doctor, userRole } = authData;

  const handleLogout = () => {
    clearAllSessions();
    setAuthData({ user: null, doctor: null, userRole: null, isLoading: false });
    navigate('/');
  };

  /* ── Role detection ── */
  const roleInfo = useMemo(() => {
    const currentPath = location.pathname;
    const isOnAdminRoute = currentPath.startsWith('/admin-dashboard');
    const isOnDoctorRoute = currentPath.startsWith('/doctor-dashboard');
    const isOnUserRoute = currentPath.startsWith('/dashboard') || currentPath.startsWith('/consultation') || currentPath.startsWith('/video-call');

    const effectiveDoctor = routeDoctor || doctor;

    const isAdmin = Boolean(isOnAdminRoute || userRole === 'admin' || (user && user.role === 'admin'));
    const isDoctor = Boolean(isOnDoctorRoute || userRole === 'doctor' || (user && user.role === 'doctor') || (effectiveDoctor && effectiveDoctor._id && !isOnUserRoute));
    const isUser = Boolean(isOnUserRoute || (user && user._id && (user.role === 'user' || user.role === 'farmer') && !isOnAdminRoute && !isOnDoctorRoute));

    let displayName = 'Guest';
    if (isAdmin) displayName = (user && user.name) || 'Admin';
    else if (isDoctor) displayName = (routeDoctor?.name || effectiveDoctor?.name || (user && user.name) || 'Doctor');
    else if (isUser) displayName = (user && user.name) || 'User';

    return { isAdmin, isDoctor, isUser, displayName, effectiveDoctor };
  }, [user, doctor, userRole, location.pathname, routeDoctor]);

  const { isAdmin, isDoctor, isUser, displayName } = roleInfo;

  if (authData.isLoading) return null;

  const display = isDoctor ? `Dr. ${displayName}` : displayName;

  if (isAdmin) {
    return <AdminNavbar displayName={display} onLogout={handleLogout} />;
  }

  if (isDoctor || isUser) {
    if (isDoctor) {
      return <DoctorNavbar displayName={display} onLogout={handleLogout} />;
    }
    return <UserNavbar displayName={display} onLogout={handleLogout} />;
  }

  return null;
}

export default Navbar;
