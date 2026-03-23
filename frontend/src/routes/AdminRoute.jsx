import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActiveRole, getActiveToken } from '../utils/auth';
import Loader from '../components/common/Loader';

const AdminRoute = ({ children }) => {
  const { role, token, loading } = useAuth();
  const effectiveToken = token || getActiveToken();
  const effectiveRole = role || getActiveRole();

  if (loading) {
    return <Loader label="Checking admin session..." />;
  }

  if (!effectiveToken) return <Navigate to="/admin-login" replace />;

  if (effectiveRole !== 'admin') {
    if (effectiveRole === 'user') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
