import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Stethoscope, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import Sidebar from '../common/Sidebar';
import StatsCard from '../common/StatsCard';
import Card from '../common/Card';

/* ── Sub-panel imports ── */
import DoctorList from './DoctorList';
import AppointmentsPanel from './AppointmentsPanel';
import ReportsPanel from './ReportsPanel';
import ProfilePanel from './ProfilePanel';
import ViewAppointments from './ViewAppointments';
import SupportChatPanel from './SupportChatPanel';

/* ── Overview Panel (simple stats, no charts) ── */
const OverviewPanel = ({ doctors, appointments, onNavigatePanel }) => (
  <div className="space-y-6 animate-fade-in">
    <Card interactive className="p-5 sm:p-6 bg-gradient-to-r from-white via-cyan-50/40 to-emerald-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to SmartVet Care Hub</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1">
            Book appointments, track visits, and access your medical reports in one place.
          </p>
        </div>
        <button
          onClick={() => onNavigatePanel('reports')}
          className="btn-solid gap-2"
        >
          Open Medical Reports
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Card>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard icon={Stethoscope}  label="Available Doctors" value={doctors.filter(d => d.isAvailable).length} color="blue" delay={0} />
      <StatsCard icon={CalendarDays} label="My Appointments" value={appointments.length} color="green" delay={50} />
      <StatsCard icon={FileText} label="Medical Reports" value={appointments.filter(a => a.status === 'completed').length} color="purple" delay={100} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card interactive className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Find Doctors</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">Browse verified vets</p>
          </div>
          <Stethoscope className="w-5 h-5 text-blue-600" />
        </div>
        <button onClick={() => onNavigatePanel('doctor')} className="mt-4 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
          Explore doctors
        </button>
      </Card>

      <Card interactive className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Appointments</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">Schedule care quickly</p>
          </div>
          <CalendarDays className="w-5 h-5 text-emerald-600" />
        </div>
        <button onClick={() => onNavigatePanel('appointments')} className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:underline">
          Book appointment
        </button>
      </Card>

      <Card interactive className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Medical Reports</p>
            <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-1">Download visit summaries</p>
          </div>
          <ShieldCheck className="w-5 h-5 text-violet-600" />
        </div>
        <button onClick={() => onNavigatePanel('reports')} className="mt-4 text-sm font-medium text-violet-700 dark:text-violet-300 hover:underline">
          View reports
        </button>
      </Card>
    </div>

    {appointments.length === 0 && (
      <Card className="p-6 text-center bg-white/80 dark:bg-slate-900/70">
        <div className="text-4xl mb-2">🐾</div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">No appointments yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your upcoming and completed visits will appear here.</p>
      </Card>
    )}
  </div>
);

/* ── Main Dashboard ── */
const Dashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePanel, setActivePanel] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    const fetchData = async () => {
      setError('');
      try {
        const [docRes, apptRes] = await Promise.all([
          api.get('/doctors'),
          user?.id ? api.get(`/appointments/user/${user.id}`) : Promise.resolve({ data: [] })
        ]);
        setDoctors(docRes.data || []);
        setAppointments(apptRes.data || []);
      } catch {
        setError('Failed to load data');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':         return <OverviewPanel doctors={doctors} appointments={appointments} onNavigatePanel={setActivePanel} />;
      case 'viewappointments': return <ViewAppointments />;
      case 'doctor':           return <DoctorList doctors={doctors} loading={loading} error={error} />;
      case 'appointments':     return <AppointmentsPanel doctors={doctors} />;
      case 'reports':          return <ReportsPanel />;
      case 'profile':          return <ProfilePanel />;
      case 'support':          return <SupportChatPanel />;
      default:                 return <OverviewPanel doctors={doctors} appointments={appointments} />;
    }
  };

  const panelTitles = {
    overview:        '🏠 Dashboard',
    viewappointments:'📅 My Appointments',
    doctor:          '👨‍⚕️ Find Doctors',
    appointments:    '📋 Book Appointment',
    reports:         '📄 Medical Reports',
    profile:         '⚙️ Profile',
    support:         '💬 Chat with Admin',
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        role="user"
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <main className={`transition-all duration-300 pb-8 pl-4 pr-4 pt-20 sm:px-6 lg:px-8 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
        <div className="dashboard-surface p-4 sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{panelTitles[activePanel] || 'Dashboard'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your pet healthcare with a cleaner, faster workflow.</p>
          </div>
        </div>

        <div className="transition-panel animate-fade-in" key={activePanel}>
          {renderPanel()}
        </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;