import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';
import {
  clearAllSessions,
  dashboardPathForRole,
  getActiveRole,
  getActiveToken,
  getActiveUser,
  saveRoleSession
} from '../utils/auth';

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return 'user';
  return role === 'farmer' ? 'user' : role;
}

function normalizeLoginError(err) {
  const status = err?.response?.status;
  const backendMsg = String(
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.response?.data?.error ||
    ''
  ).toLowerCase();

  if (status === 400 || status === 401) {
    return 'Invalid email or password';
  }

  if (backendMsg.includes('invalid credentials') || backendMsg.includes('invalid admin password')) {
    return 'Invalid email or password';
  }

  return 'Something went wrong';
}

function normalizeRegisterError(err) {
  const backendMsg = String(
    err?.response?.data?.message ||
    err?.response?.data?.msg ||
    err?.response?.data?.error ||
    ''
  ).toLowerCase();

  if (
    backendMsg.includes('already exists') ||
    backendMsg.includes('already registered') ||
    backendMsg.includes('duplicate')
  ) {
    return 'User already exists';
  }

  return 'Something went wrong';
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));
  const [role, setRole] = useState(() => getActiveRole() || sessionStorage.getItem('role'));
  const [user, setUser] = useState(() => getActiveUser() || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionToken = getActiveToken() || sessionStorage.getItem('token');
    const sessionRole = getActiveRole() || sessionStorage.getItem('role');
    const sessionUser = getActiveUser() || null;

    if (sessionToken && sessionRole) {
      setToken(sessionToken);
      setRole(normalizeRole(sessionRole));
      setUser(sessionUser);
    }

    // Debug check requested for auth storage visibility
    console.log('Token:', sessionStorage.getItem('token'));
    console.log('Role:', sessionStorage.getItem('role'));

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      const nextUser = res.data?.user || null;
      const nextToken = res.data?.token || null;
      const nextRole = normalizeRole(res.data?.role || nextUser?.role);

      saveRoleSession({ role: nextRole, token: nextToken, user: nextUser });

      // Keep explicit keys for all guards/routes that read sessionStorage directly.
      if (nextToken && nextRole) {
        sessionStorage.setItem('token', nextToken);
        sessionStorage.setItem('role', nextRole);
      }

      setToken(nextToken);
      setRole(nextRole);
      setUser(nextUser);
      setLoading(false);

      let redirectTo = dashboardPathForRole(nextRole);
      if (nextRole === 'doctor') {
        const doctorLink =
          nextUser?.uniqueAccessLink ||
          nextUser?.link ||
          getActiveUser()?.uniqueAccessLink ||
          JSON.parse(sessionStorage.getItem('doctor') || 'null')?.uniqueAccessLink;

        if (doctorLink) {
          redirectTo = `/doctor-dashboard/${doctorLink}`;
        }
      }

      return { success: true, role: nextRole, redirectTo };
    } catch (err) {
      const message = normalizeLoginError(err);

      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, mobile, password) => {
    setLoading(true);
    setError('');
    try {
      const payload = { name, email, password };
      if (mobile) payload.mobile = mobile;

      const res = await api.post('/auth/register', payload);
      const nextUser = res.data?.user || null;
      const nextToken = res.data?.token || null;
      const nextRole = normalizeRole(res.data?.role || nextUser?.role || 'user');

      saveRoleSession({ role: nextRole, token: nextToken, user: nextUser });

      if (nextToken && nextRole) {
        sessionStorage.setItem('token', nextToken);
        sessionStorage.setItem('role', nextRole);
      }

      setToken(nextToken);
      setRole(nextRole);
      setUser(nextUser);
      setLoading(false);

      return { success: true, role: nextRole, redirectTo: dashboardPathForRole(nextRole) };
    } catch (err) {
      const message = normalizeRegisterError(err);

      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    clearAllSessions();
    setToken(null);
    setRole(null);
    setUser(null);
    setError('');
    setLoading(false);
  };

  const value = useMemo(() => ({
    user,
    role,
    token,
    loading,
    error,
    isAuthenticated: Boolean(token && role),
    login,
    register,
    logout,
    clearError: () => setError('')
  }), [user, role, token, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
