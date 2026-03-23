
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import DoctorDashboardPage from '../pages/DoctorDashboardPage';
import ReportVerificationPage from '../pages/ReportVerificationPage';

import NotFoundPage from '../pages/NotFoundPage';
import Login from '../components/auth/Login';
import AdminLogin from '../components/auth/AdminLogin';
import ForgotPassword from '../components/auth/ForgotPassword';
import Register from '../components/auth/Register';
import AdminDashboard from '../components/AdminDashboard';

import DoctorLinkLogin from '../components/auth/DoctorLinkLogin';
import CareerPortal from '../pages/CareerPortal';
import Layout from '../components/common/Layout';
import UserReportsPage from '../pages/UserReportsPage';
import DoctorReportsPage from '../pages/DoctorReportsPage';
import AddDoctor from '../pages/Admin/AddDoctor';
import AdminRoute from '../routes/AdminRoute';
import UserRoute from '../routes/UserRoute';
import DoctorRoute from '../routes/DoctorRoute';
import { getActiveUser } from '../utils/auth';

const DoctorEntryRedirect = () => {
  const activeUser = getActiveUser() || JSON.parse(sessionStorage.getItem('doctor') || 'null');
  const doctorLink = activeUser?.uniqueAccessLink || activeUser?.link;

  if (!doctorLink) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/doctor-dashboard/${doctorLink}`} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/register" element={<Register />} />

    <Route path="/doctor-login/:link" element={<DoctorLinkLogin />} />
    <Route path="/career-portal" element={<CareerPortal />} />
    <Route path="/report-verify/:appointmentUid" element={<ReportVerificationPage />} />
    <Route element={<Layout />}>
      <Route path="/dashboard" element={
        <UserRoute>
          <UserDashboardPage />
        </UserRoute>
      } />
      <Route path="/dashboard/reports" element={
        <UserRoute>
          <UserReportsPage />
        </UserRoute>
      } />
      <Route path="/admin-dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      <Route path="/admin/add-doctor" element={
        <AdminRoute>
          <AddDoctor />
        </AdminRoute>
      } />
      <Route path="/doctor" element={
        <DoctorRoute>
          <DoctorEntryRedirect />
        </DoctorRoute>
      } />
      {/* Doctor dashboard accessed via unique access link */}
      <Route path="/doctor-dashboard/:link" element={
        <DoctorRoute>
          <DoctorDashboardPage />
        </DoctorRoute>
      } />
      <Route path="/doctor-dashboard/:link/reports" element={
        <DoctorRoute>
          <DoctorReportsPage />
        </DoctorRoute>
      } />

    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
