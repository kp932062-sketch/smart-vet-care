import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveRole, getActiveToken } from '../utils/auth';
import Loader from '../components/common/Loader';

const DoctorRoute = ({ children }) => {
  const { role, token, loading } = useAuth();
  const effectiveToken = token || getActiveToken();
  const effectiveRole = role || getActiveRole();

  if (loading) return <Loader label="Checking doctor session..." />;
  if (!effectiveToken || effectiveRole !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default DoctorRoute;
