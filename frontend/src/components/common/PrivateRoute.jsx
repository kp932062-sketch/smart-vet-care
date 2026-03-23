import React from 'react';
import { Navigate } from 'react-router-dom';
import { getActiveRole, getActiveToken, getActiveUser } from '../../utils/auth';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = getActiveToken();
  const user = getActiveUser() || {};
  const userRole = getActiveRole() || user.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (userRole === 'doctor') return <Navigate to={`/doctor-dashboard/${user.uniqueAccessLink || 'dashboard'}`} replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
