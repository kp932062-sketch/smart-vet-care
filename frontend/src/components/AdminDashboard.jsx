import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import api from '../utils/api';
import Card from './common/Card';
import EmptyState from './common/EmptyState';
import Loader from './common/Loader';
import StatusBadge from './common/StatusBadge';
import Modal from './common/Modal';
import Button from './common/Button';
import DataTable from './common/DataTable';
import AdminChatPanel from './admin/AdminChatPanel';
import SuggestionManagementPanel from './admin/SuggestionManagementPanel';
import UserTable from './admin/UserTable';
import UserModal from './admin/UserModal';
import ConfirmDialog from './admin/ConfirmDialog';
import FormInput from './common/FormInput';
import FormTextarea from './common/form/FormTextarea';
import { useToast } from './common/Toast';

const TAB_KEYS = {
  overview: 'overview',
  pending: 'pending',
  doctors: 'doctors',
  appointments: 'appointments',
  reports: 'reports',
  users: 'users',
  suggestions: 'suggestions',
  chat: 'chat'
};

const appointmentTransitions = {
  pending: ['confirmed', 'cancelled', 'rejected'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  rejected: []
};

const chartPalette = ['#0284c7', '#10b981', '#f59e0b', '#7c3aed', '#ef4444'];

const emptyReportForm = {
  id: null,
  appointment_uid: '',
  diagnosis: '',
  treatment: '',
  prescription: '',
  notes: '',
  report_date: ''
};

function normalizeDoctor(doctor) {
  return {
    id: Number(doctor?.id || doctor?._id || 0),
    name: doctor?.name || 'Unknown',
    email: doctor?.email || 'N/A',
    phone: doctor?.phone || doctor?.mobile || 'N/A',
    specialization: doctor?.specialization || 'General',
    experience: Number(doctor?.experience || 0),
    status: String(doctor?.status || (doctor?.approved ? 'active' : 'pending')).toLowerCase(),
    approved: Boolean(doctor?.approved),
    createdAt: doctor?.createdAt || doctor?.created_at || null,
    documents: doctor?.documents || {}
  };
}

function normalizeAppointment(appointment) {
  const dateValue = appointment?.date || appointment?.appointmentDate || null;
  const parsedDate = dateValue ? new Date(dateValue) : null;
  const fallbackTime = parsedDate
    ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'N/A';

  return {
    id: Number(appointment?.id || appointment?._id || 0),
    appointmentUid: appointment?.appointment_uid || appointment?.appointmentUid || '',
    petName: appointment?.pet_name || appointment?.petName || 'Unknown',
    ownerName: appointment?.owner_name || appointment?.user?.name || 'Unknown',
    doctorName: appointment?.doctor_name || appointment?.doctor?.name || 'Unassigned',
    specialization: appointment?.specialization || appointment?.doctor?.specialization || 'N/A',
    date: dateValue,
    time: appointment?.time || fallbackTime,
    reason: appointment?.reason || 'N/A',
    status: String(appointment?.status || 'pending').toLowerCase()
  };
}

function normalizeUser(user) {
  return {
    id: Number(user?.id || user?._id || 0),
    name: user?.name || 'Unknown',
    email: user?.email || 'N/A',
    role: String(user?.role || 'user').toLowerCase(),
    status: String(user?.status || (user?.isActive ? 'active' : 'inactive')).toLowerCase(),
    phone: user?.phone || user?.mobile || '',
    createdAt: user?.createdAt || user?.created_at || null
  };
}

const AdminDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(TAB_KEYS.overview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [statistics, setStatistics] = useState({});
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [overviewUsers, setOverviewUsers] = useState([]);
  const [overviewReports, setOverviewReports] = useState([]);

  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorActionLoading, setDoctorActionLoading] = useState({});

  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState({});

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitLoading, setReportSubmitLoading] = useState(false);
  const [reportForm, setReportForm] = useState(emptyReportForm);
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportPagination, setReportPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === TAB_KEYS.pending || activeTab === TAB_KEYS.doctors) {
      loadDoctors();
    }
    if (activeTab === TAB_KEYS.appointments) {
      loadAppointments();
    }
    if (activeTab === TAB_KEYS.reports) {
      loadReports(reportSearchQuery, 1, reportPagination.limit);
    }
    if (activeTab === TAB_KEYS.users) {
      loadUsers();
    }
  }, [activeTab]);

  const allDoctorsCount = useMemo(() => allDoctors.length, [allDoctors]);
  const overviewSeries = useMemo(() => {
    const series = [
      { key: 'users', label: 'Users', value: Number(statistics.totalUsers || 0), tone: 'bg-blue-500' },
      { key: 'activeDoctors', label: 'Active Doctors', value: Number(statistics.activeDoctors || 0), tone: 'bg-green-500' },
      { key: 'pendingDoctors', label: 'Pending Doctors', value: Number(pendingDoctors.length || 0), tone: 'bg-amber-500' },
      { key: 'appointments', label: 'Appointments', value: Number(statistics.totalAppointments || 0), tone: 'bg-violet-500' }
    ];

    const maxValue = Math.max(...series.map((item) => item.value), 1);
    return series.map((item) => ({
      ...item,
      percent: Math.max(8, Math.round((item.value / maxValue) * 100))
    }));
  }, [statistics, pendingDoctors.length]);

  const showToast = (type, message) => {
    if (type === 'success') {
      toast.success(message);
      return;
    }
    if (type === 'warning') {
      toast.warning(message);
      return;
    }
    toast.error(message);
  };

  const appointmentStatusData = useMemo(() => {
    const source = appointments.length ? appointments : recentAppointments;
    const statusCounts = source.reduce((acc, item) => {
      const status = String(item.status || 'pending').toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [appointments, recentAppointments]);

  const userGrowthData = useMemo(() => {
    const source = overviewUsers;
    if (!source.length) return [];

    const grouped = source.reduce((acc, user) => {
      const date = new Date(user.createdAt || user.created_at || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, value]) => ({
        month,
        users: value
      }));
  }, [overviewUsers]);

  const reportsSummaryData = useMemo(() => {
    if (!overviewReports.length) return [];

    const grouped = overviewReports.reduce((acc, report) => {
      const date = new Date(report.report_date || report.createdAt || Date.now());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, reports]) => ({ month, reports }));
  }, [overviewReports]);

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, notificationsRes, approvedRes, pendingRes, usersRes, reportsRes] = await Promise.allSettled([
        api.get('/admin/dashboard'),
        api.get('/auth/admin-notifications'),
        api.get('/doctors'),
        api.get('/doctors/pending'),
        api.get('/admin/users'),
        api.get('/admin/reports', { params: { page: 1, limit: 200 } })
      ]);

      const dashboardPayload = dashboardRes.status === 'fulfilled' ? dashboardRes.value?.data || {} : {};
      const notificationsPayload =
        notificationsRes.status === 'fulfilled' ? notificationsRes.value?.data || {} : {};

      const approvedDoctors =
        approvedRes.status === 'fulfilled' && Array.isArray(approvedRes.value?.data)
          ? approvedRes.value.data.map(normalizeDoctor)
          : [];
      const pendingDoctorsPayload =
        pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value?.data)
          ? pendingRes.value.data.map(normalizeDoctor)
          : [];

      const mergedRecent = Array.isArray(notificationsPayload.recentAppointments)
        ? notificationsPayload.recentAppointments.map(normalizeAppointment)
        : [];

      const mergedAllDoctors = [...approvedDoctors, ...pendingDoctorsPayload].reduce((acc, doc) => {
        if (!acc.find((row) => row.id === doc.id)) {
          acc.push(doc);
        }
        return acc;
      }, []);

      setStatistics({
        totalUsers: Number(dashboardPayload?.statistics?.totalUsers || 0),
        activeDoctors: Number(dashboardPayload?.statistics?.activeDoctors || approvedDoctors.length),
        pendingDoctors: pendingDoctorsPayload.length,
        totalAppointments: Number(dashboardPayload?.statistics?.totalAppointments || 0)
      });

      setRecentAppointments(mergedRecent);
      setPendingDoctors(pendingDoctorsPayload);
      setAllDoctors(mergedAllDoctors);
      const usersPayload =
        usersRes.status === 'fulfilled'
          ? Array.isArray(usersRes.value?.data?.data)
            ? usersRes.value.data.data
            : Array.isArray(usersRes.value?.data)
              ? usersRes.value.data
              : []
          : [];

      const reportsPayload =
        reportsRes.status === 'fulfilled'
          ? Array.isArray(reportsRes.value?.data?.data)
            ? reportsRes.value.data.data
            : []
          : [];

      setOverviewUsers(usersPayload);
      setOverviewReports(reportsPayload);
    } catch (err) {
      setError('Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const [approvedRes, pendingRes] = await Promise.allSettled([
        api.get('/doctors'),
        api.get('/doctors/pending')
      ]);

      const approvedDoctors =
        approvedRes.status === 'fulfilled' && Array.isArray(approvedRes.value?.data)
          ? approvedRes.value.data.map(normalizeDoctor)
          : [];

      const pendingDoctorsPayload =
        pendingRes.status === 'fulfilled' && Array.isArray(pendingRes.value?.data)
          ? pendingRes.value.data.map(normalizeDoctor)
          : [];

      const merged = [...approvedDoctors, ...pendingDoctorsPayload].reduce((acc, doc) => {
        if (!acc.find((row) => row.id === doc.id)) {
          acc.push(doc);
        }
        return acc;
      }, []);

      setPendingDoctors(pendingDoctorsPayload);
      setAllDoctors(merged);
    } catch (_err) {
      showToast('error', 'Failed to load doctors.');
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const res = await api.get('/admin/appointments');
      const items = Array.isArray(res.data?.appointments) ? res.data.appointments : [];
      setAppointments(items.map(normalizeAppointment));
    } catch (_err) {
      showToast('error', 'Failed to load appointments.');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const loadReports = async (
    query = reportSearchQuery,
    page = reportPagination.page,
    limit = reportPagination.limit
  ) => {
    setReportsLoading(true);
    try {
      const params = { page, limit };
      if (String(query || '').trim()) {
        params.appointment_uid = String(query).trim().toUpperCase();
      }

      const res = await api.get('/admin/reports', { params });
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      setReports(items);
      setReportPagination((prev) => ({
        ...prev,
        page: Number(res.data?.pagination?.page || page),
        limit: Number(res.data?.pagination?.limit || limit),
        total: Number(res.data?.pagination?.total || items.length),
        totalPages: Number(res.data?.pagination?.totalPages || 1)
      }));
    } catch (_err) {
      showToast('error', 'Failed to load medical reports.');
    } finally {
      setReportsLoading(false);
    }
  };

  const exportReportsCsv = async () => {
    try {
      const params = {};
      if (String(reportSearchQuery || '').trim()) {
        params.appointment_uid = String(reportSearchQuery).trim().toUpperCase();
      }

      const response = await api.get('/admin/reports/export/csv', {
        params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin-medical-reports-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      showToast('error', 'Failed to export reports CSV.');
    }
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get('/admin/users');
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setUsers(items.map(normalizeUser));
    } catch (_err) {
      showToast('error', 'Failed to load users.');
    } finally {
      setUsersLoading(false);
    }
  };

  const withUserLoading = async (userId, work) => {
    setUserActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await work();
    } finally {
      setUserActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserModalOpen(true);
  };

  const submitEditUser = async (payload) => {
    if (!editingUser?.id) return;

    await withUserLoading(editingUser.id, async () => {
      try {
        await api.put(`/admin/users/${editingUser.id}`, payload);
        showToast('success', 'User updated successfully.');
        setUserModalOpen(false);
        setEditingUser(null);
        await loadUsers();
      } catch (error) {
        showToast('error', error?.response?.data?.message || 'Failed to update user.');
      }
    });
  };

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';

    await withUserLoading(user.id, async () => {
      try {
        await api.put(`/admin/users/${user.id}/status`, { status: nextStatus });
        showToast('success', `User ${nextStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully.`);
        await loadUsers();
      } catch (error) {
        showToast('error', error?.response?.data?.message || 'Failed to update status.');
      }
    });
  };

  const handleDeleteUser = async (user) => {
    setConfirmDeleteUser(user);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteUser?.id) return;

    await withUserLoading(confirmDeleteUser.id, async () => {
      try {
        await api.delete(`/admin/users/${confirmDeleteUser.id}`);
        showToast('success', 'User deleted successfully.');
        setConfirmDeleteUser(null);
        await loadUsers();
      } catch (error) {
        showToast('error', error?.response?.data?.message || 'Failed to delete user.');
      }
    });
  };

  const handleDoctorAction = async (doctorId, action) => {
    if (!doctorId || !action) return;

    setDoctorActionLoading((prev) => ({ ...prev, [doctorId]: true }));
    try {
      if (action === 'approve') {
        await api.post(`/admin/doctors/${doctorId}/approve`);
        showToast('success', 'Doctor approved successfully.');
      }

      if (action === 'reject') {
        const reason = window.prompt('Enter rejection reason:') || '';
        if (!reason.trim()) {
          setDoctorActionLoading((prev) => ({ ...prev, [doctorId]: false }));
          return;
        }
        await api.post(`/admin/doctors/${doctorId}/reject`, { reason: reason.trim() });
        showToast('success', 'Doctor rejected successfully.');
      }

      if (action === 'remove') {
        const confirmed = window.confirm('Remove this doctor permanently?');
        if (!confirmed) {
          setDoctorActionLoading((prev) => ({ ...prev, [doctorId]: false }));
          return;
        }
        await api.delete(`/admin/doctors/${doctorId}/remove`);
        showToast('success', 'Doctor removed successfully.');
      }

      await loadDoctors();
      await loadOverview();
    } catch (_err) {
      showToast('error', 'Doctor action failed.');
    } finally {
      setDoctorActionLoading((prev) => ({ ...prev, [doctorId]: false }));
    }
  };

  const canTransition = (current, next) => {
    return (appointmentTransitions[current] || []).includes(next);
  };

  const handleAppointmentStatusUpdate = async (appointmentId, nextStatus) => {
    setAppointmentActionLoading((prev) => ({ ...prev, [appointmentId]: true }));
    try {
      const res = await api.put(`/admin/appointments/${appointmentId}/status`, { status: nextStatus });
      const updated = res.data?.appointment ? normalizeAppointment(res.data.appointment) : null;

      if (updated) {
        setAppointments((prev) => prev.map((row) => (row.id === appointmentId ? updated : row)));
      }

      showToast('success', `Appointment marked as ${nextStatus}.`);
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setAppointmentActionLoading((prev) => ({ ...prev, [appointmentId]: false }));
    }
  };

  const openCreateReportModal = () => {
    setReportForm(emptyReportForm);
    setReportModalOpen(true);
  };

  const openEditReportModal = (report) => {
    setReportForm({
      id: report.id,
      appointment_uid: String(report.appointment_uid || ''),
      diagnosis: report.diagnosis || '',
      treatment: report.treatment || '',
      prescription: report.prescription || '',
      notes: report.notes || '',
      report_date: report.report_date ? String(report.report_date).slice(0, 10) : ''
    });
    setReportModalOpen(true);
  };

  const handleReportSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      appointment_uid: String(reportForm.appointment_uid || '').trim().toUpperCase(),
      diagnosis: reportForm.diagnosis.trim(),
      treatment: reportForm.treatment.trim(),
      prescription: reportForm.prescription.trim(),
      notes: reportForm.notes.trim(),
      report_date: reportForm.report_date
    };

    if (!payload.appointment_uid || !payload.diagnosis || !payload.treatment || !payload.report_date) {
      showToast('error', 'Appointment UID, diagnosis, treatment, and report date are required.');
      return;
    }

    setReportSubmitLoading(true);
    try {
      if (reportForm.id) {
        await api.put(`/admin/reports/${reportForm.id}`, payload);
        showToast('success', 'Medical report updated.');
      } else {
        await api.post('/admin/reports', payload);
        showToast('success', 'Medical report created.');
      }

      setReportModalOpen(false);
      setReportForm(emptyReportForm);
      await loadReports();
    } catch (err) {
      showToast('error', err?.response?.data?.message || 'Failed to save medical report.');
    } finally {
      setReportSubmitLoading(false);
    }
  };

  const downloadReportPdf = async (appointmentUid) => {
    try {
      const response = await api.get(`/reports/${appointmentUid}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SmartVet_${appointmentUid}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast('error', 'Failed to download PDF report.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loader label="Loading admin dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 pt-24 md:p-8">
      <div className="dashboard-surface mx-auto max-w-7xl p-5 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage operations, doctors, appointments, reports, and users.</p>
          </div>
          <Link to="/admin/add-doctor" className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-colors font-semibold interactive-press">
            Add Doctor
          </Link>
        </div>

        {error && (
          <Card className="p-4 mb-6 border-red-200 bg-red-50/80 dark:bg-red-900/20">
            <div className="flex items-center justify-between gap-3 text-red-700 dark:text-red-300">
              <span>{error}</span>
              <button className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 dark:bg-red-800/60 interactive-press" onClick={loadOverview}>Retry</button>
            </div>
          </Card>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card interactive className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{statistics.totalUsers || 0}</p>
          </Card>
          <Card interactive className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Doctors</p>
            <p className="text-2xl font-bold text-green-600">{statistics.activeDoctors || 0}</p>
          </Card>
          <Card interactive className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending Doctors</p>
            <p className="text-2xl font-bold text-amber-600">{pendingDoctors.length}</p>
          </Card>
          <Card interactive className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">Appointments</p>
            <p className="text-2xl font-bold text-violet-600">{statistics.totalAppointments || 0}</p>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: TAB_KEYS.overview, label: 'Overview' },
            { key: TAB_KEYS.pending, label: 'Pending Doctors' },
            { key: TAB_KEYS.doctors, label: 'All Doctors' },
            { key: TAB_KEYS.appointments, label: 'Appointments' },
            { key: TAB_KEYS.reports, label: 'Medical Reports' },
            { key: TAB_KEYS.users, label: 'Users' },
            { key: TAB_KEYS.suggestions, label: 'Suggestions' },
            { key: TAB_KEYS.chat, label: 'Chat' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all interactive-press ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                  : 'bg-white/85 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="p-5 md:p-6">
          {activeTab === TAB_KEYS.overview && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Overview</h2>
                <Button variant="ghost" size="sm" onClick={loadOverview}>Refresh</Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <Card className="p-4 animate-slide-up">
                  <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Appointments Overview</p>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={appointmentStatusData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {appointmentStatusData.map((entry, index) => (
                            <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 animate-slide-up">
                  <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">User Growth</p>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="grid lg:grid-cols-2 gap-4 mb-4">
                <Card className="p-4 animate-slide-up">
                  <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Reports Summary</p>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip />
                        <Pie
                          data={reportsSummaryData}
                          dataKey="reports"
                          nameKey="month"
                          outerRadius={95}
                          innerRadius={55}
                          paddingAngle={2}
                        >
                          {reportsSummaryData.map((entry, index) => (
                            <Cell key={entry.month} fill={chartPalette[index % chartPalette.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-r from-emerald-50/70 to-cyan-50/70 dark:from-slate-800 dark:to-slate-800/70 animate-slide-up">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Admin Quick Snapshot</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 p-3 border border-white/40 dark:border-slate-700/70">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Doctors</p>
                      <p className="text-xl font-bold text-emerald-600">{allDoctorsCount}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 p-3 border border-white/40 dark:border-slate-700/70">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
                      <p className="text-xl font-bold text-amber-600">{pendingDoctors.length}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 p-3 border border-white/40 dark:border-slate-700/70">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Users</p>
                      <p className="text-xl font-bold text-blue-600">{statistics.totalUsers || 0}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 dark:bg-slate-900/60 p-3 border border-white/40 dark:border-slate-700/70">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Appointments</p>
                      <p className="text-xl font-bold text-violet-600">{statistics.totalAppointments || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {recentAppointments.length === 0 && (
                <EmptyState
                  icon="📅"
                  title="No recent appointments"
                  description="Recent activity will appear here."
                  action={<Button onClick={() => setActiveTab(TAB_KEYS.appointments)}>Open Appointments</Button>}
                />
              )}

              {recentAppointments.length > 0 && (
                <div className="space-y-3">
                  {recentAppointments.slice(0, 8).map((appointment) => (
                    <div key={appointment.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {appointment.ownerName} with Dr. {appointment.doctorName}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {appointment.petName} • {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'} • {appointment.time}
                        </p>
                      </div>
                      <StatusBadge status={appointment.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === TAB_KEYS.pending && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pending Doctors</h2>
                <button onClick={loadDoctors} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium">Refresh</button>
              </div>

              {doctorsLoading && <Loader label="Loading pending doctors..." />}
              {!doctorsLoading && pendingDoctors.length === 0 && (
                <EmptyState icon="✅" title="No pending approvals" description="All doctor applications are processed." />
              )}

              {!doctorsLoading && pendingDoctors.length > 0 && (
                <div className="space-y-3">
                  {pendingDoctors.map((doctor) => {
                    const rowBusy = Boolean(doctorActionLoading[doctor.id]);
                    return (
                      <div key={doctor.id} className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-900/10 dark:border-amber-700/40 p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{doctor.name}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{doctor.email} • {doctor.specialization}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Experience: {doctor.experience} years</p>
                          </div>
                          <div className="flex gap-2">
                            <button disabled={rowBusy} onClick={() => handleDoctorAction(doctor.id, 'approve')} className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 text-sm">Approve</button>
                            <button disabled={rowBusy} onClick={() => handleDoctorAction(doctor.id, 'reject')} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm">Reject</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === TAB_KEYS.doctors && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Doctors</h2>
                <Button variant="ghost" size="sm" onClick={loadDoctors}>Refresh</Button>
              </div>

              <DataTable
                data={allDoctors}
                loading={doctorsLoading}
                rowKey="id"
                emptyTitle="No doctors found"
                emptyMessage="No doctors available in the platform yet."
                searchPlaceholder="Search doctors by name, email, specialization"
                columns={[
                  {
                    header: 'Doctor',
                    accessor: 'name',
                    sortable: true,
                    render: (row) => (
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
                      </div>
                    )
                  },
                  { header: 'Specialization', accessor: 'specialization', sortable: true },
                  { header: 'Experience', accessor: 'experience', sortable: true, render: (row) => `${row.experience} yrs` },
                  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
                  {
                    header: 'Actions',
                    accessor: 'id',
                    render: (row) => {
                      const rowBusy = Boolean(doctorActionLoading[row.id]);
                      return (
                        <div className="flex flex-wrap justify-end gap-2">
                          {row.status === 'pending' ? (
                            <>
                              <Button size="sm" onClick={() => handleDoctorAction(row.id, 'approve')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Approve</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDoctorAction(row.id, 'reject')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Reject</Button>
                            </>
                          ) : (
                            <Button size="sm" variant="danger" onClick={() => handleDoctorAction(row.id, 'remove')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Remove</Button>
                          )}
                        </div>
                      );
                    }
                  }
                ]}
                mobileCardRender={(row) => {
                  const rowBusy = Boolean(doctorActionLoading[row.id]);
                  return (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{row.specialization}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{row.email}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.status === 'pending' ? (
                          <>
                            <Button size="sm" onClick={() => handleDoctorAction(row.id, 'approve')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => handleDoctorAction(row.id, 'reject')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Reject</Button>
                          </>
                        ) : (
                          <Button size="sm" variant="danger" onClick={() => handleDoctorAction(row.id, 'remove')} disabled={rowBusy} className="h-8 px-2.5 text-xs">Remove</Button>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}

          {activeTab === TAB_KEYS.appointments && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Appointments</h2>
                <Button variant="ghost" size="sm" onClick={loadAppointments}>Refresh</Button>
              </div>

              <DataTable
                data={appointments}
                loading={appointmentsLoading}
                rowKey="id"
                emptyTitle="No appointments found"
                emptyMessage="No appointment records are available right now."
                searchPlaceholder="Search by pet, owner, doctor, or reason"
                columns={[
                  { header: 'Appointment ID', accessor: 'appointmentUid', sortable: true },
                  {
                    header: 'Pet & Owner',
                    accessor: 'petName',
                    sortable: true,
                    render: (row) => (
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">{row.petName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{row.ownerName}</p>
                      </div>
                    )
                  },
                  { header: 'Doctor', accessor: 'doctorName', sortable: true },
                  { header: 'Specialization', accessor: 'specialization', sortable: true },
                  {
                    header: 'Date',
                    accessor: (row) => row.date || '',
                    sortKey: (row) => new Date(row.date || 0).getTime(),
                    sortable: true,
                    render: (row) => row.date ? new Date(row.date).toLocaleDateString() : 'N/A'
                  },
                  { header: 'Status', accessor: 'status', sortable: true, render: (row) => <StatusBadge status={row.status} /> },
                  {
                    header: 'Actions',
                    accessor: 'id',
                    render: (row) => {
                      const rowLoading = Boolean(appointmentActionLoading[row.id]);
                      return (
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button size="sm" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'confirmed')} onClick={() => handleAppointmentStatusUpdate(row.id, 'confirmed')}>Confirm</Button>
                          <Button size="sm" variant="secondary" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'completed')} onClick={() => handleAppointmentStatusUpdate(row.id, 'completed')}>Complete</Button>
                          <Button size="sm" variant="danger" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'cancelled')} onClick={() => handleAppointmentStatusUpdate(row.id, 'cancelled')}>Cancel</Button>
                        </div>
                      );
                    }
                  }
                ]}
                mobileCardRender={(row) => {
                  const rowLoading = Boolean(appointmentActionLoading[row.id]);
                  return (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100">{row.petName} • {row.ownerName}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">Dr. {row.doctorName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'} • {row.time}</p>
                        </div>
                        <StatusBadge status={row.status} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'confirmed')} onClick={() => handleAppointmentStatusUpdate(row.id, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="secondary" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'completed')} onClick={() => handleAppointmentStatusUpdate(row.id, 'completed')}>Complete</Button>
                        <Button size="sm" variant="danger" className="h-8 px-2.5 text-xs" disabled={rowLoading || !canTransition(row.status, 'cancelled')} onClick={() => handleAppointmentStatusUpdate(row.id, 'cancelled')}>Cancel</Button>
                      </div>
                    </div>
                  );
                }}
              />
            </div>
          )}

          {activeTab === TAB_KEYS.reports && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Medical Reports</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={reportSearchQuery}
                    onChange={(event) => setReportSearchQuery(event.target.value.toUpperCase())}
                    placeholder="Search Appointment ID"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <Button onClick={() => loadReports(reportSearchQuery, 1, reportPagination.limit)} variant="secondary" size="sm">Search</Button>
                  <Button onClick={() => { setReportSearchQuery(''); loadReports('', 1, reportPagination.limit); }} variant="ghost" size="sm">Refresh</Button>
                  <Button onClick={exportReportsCsv} variant="ghost" size="sm">Export CSV</Button>
                  <Button onClick={openCreateReportModal} size="sm">Create Report</Button>
                </div>
              </div>

              {reportsLoading && <Loader label="Loading medical reports..." />}
              {!reportsLoading && reports.length === 0 && (
                <EmptyState icon="🧾" title="No medical reports" description="Create a report to get started." />
              )}

              {!reportsLoading && reports.length > 0 && (
                <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">Appointment ID</th>
                        <th className="text-left p-3">Pet</th>
                        <th className="text-left p-3">Owner</th>
                        <th className="text-left p-3">Doctor</th>
                        <th className="text-left p-3">Date</th>
                        <th className="text-right p-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-t border-slate-200 dark:border-slate-700">
                          <td className="p-3">#{report.id}</td>
                          <td className="p-3 font-semibold text-blue-700">{report.appointment_uid || 'N/A'}</td>
                          <td className="p-3">{report.pet_name}</td>
                          <td className="p-3">{report.owner_name}</td>
                          <td className="p-3">{report.doctor_name}</td>
                          <td className="p-3">{report.report_date ? new Date(report.report_date).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button onClick={() => downloadReportPdf(report.appointment_uid)} variant="ghost" size="sm" className="h-8 px-2.5 text-xs">PDF</Button>
                              <Button onClick={() => openEditReportModal(report)} variant="secondary" size="sm" className="h-8 px-2.5 text-xs">Edit</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Showing page {reportPagination.page} of {reportPagination.totalPages} ({reportPagination.total} total reports)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadReports(reportSearchQuery, Math.max(1, reportPagination.page - 1), reportPagination.limit)}
                      disabled={reportPagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadReports(reportSearchQuery, Math.min(reportPagination.totalPages, reportPagination.page + 1), reportPagination.limit)}
                      disabled={reportPagination.page >= reportPagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                </>
              )}
            </div>
          )}

          {activeTab === TAB_KEYS.users && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h2>
                <button onClick={loadUsers} className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm font-medium">Refresh</button>
              </div>

              <UserTable
                users={users}
                loading={usersLoading}
                actionLoadingMap={userActionLoading}
                onEdit={openEditUserModal}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
              />
            </div>
          )}

          {activeTab === TAB_KEYS.suggestions && <SuggestionManagementPanel />}

          {activeTab === TAB_KEYS.chat && <AdminChatPanel />}
        </Card>
      </div>

      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={reportForm.id ? 'Edit Medical Report' : 'Create Medical Report'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleReportSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <FormInput
                  label="Appointment UID"
                  value={reportForm.appointment_uid}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, appointment_uid: e.target.value.toUpperCase() }))}
                  placeholder="APT-YYYYMMDD-1234"
                  required
                />
                <FormInput
                  label="Report Date"
                  type="date"
                  value={reportForm.report_date}
                  onChange={(e) => setReportForm((prev) => ({ ...prev, report_date: e.target.value }))}
                  required
                />
              </div>

              <FormTextarea
                label="Diagnosis"
                value={reportForm.diagnosis}
                onChange={(e) => setReportForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                required
                rows={3}
              />

              <FormTextarea
                label="Treatment"
                value={reportForm.treatment}
                onChange={(e) => setReportForm((prev) => ({ ...prev, treatment: e.target.value }))}
                required
                rows={3}
              />

              <FormTextarea
                label="Prescription"
                value={reportForm.prescription}
                onChange={(e) => setReportForm((prev) => ({ ...prev, prescription: e.target.value }))}
                rows={3}
              />

              <FormTextarea
                label="Notes"
                value={reportForm.notes}
                onChange={(e) => setReportForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" onClick={() => setReportModalOpen(false)} variant="ghost">Cancel</Button>
                <Button type="submit" loading={reportSubmitLoading}>
                  {reportSubmitLoading ? 'Saving...' : reportForm.id ? 'Update Report' : 'Create Report'}
                </Button>
              </div>
            </form>
      </Modal>

      <UserModal
        isOpen={userModalOpen}
        user={editingUser}
        loading={Boolean(editingUser?.id && userActionLoading[editingUser.id])}
        onClose={() => {
          setUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={submitEditUser}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDeleteUser)}
        title="Delete User"
        message={
          confirmDeleteUser
            ? `Are you sure you want to delete ${confirmDeleteUser.name}? This will soft-delete the user account.`
            : ''
        }
        confirmText="Delete"
        loading={Boolean(confirmDeleteUser?.id && userActionLoading[confirmDeleteUser.id])}
        onCancel={() => setConfirmDeleteUser(null)}
        onConfirm={confirmDelete}
      />

    </div>
  );
};

export default AdminDashboard;
