import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveRole, getActiveToken } from '../utils/auth';
import Loader from '../components/common/Loader';

const UserRoute = ({ children }) => {
  const { role, token, loading } = useAuth();
  const effectiveToken = token || getActiveToken();
  const effectiveRole = role || getActiveRole();

  if (loading) return <Loader label="Checking session..." />;
  if (!effectiveToken) return <Navigate to="/login" replace />;

  if (effectiveRole === 'admin') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (effectiveRole !== 'user') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default UserRoute;
