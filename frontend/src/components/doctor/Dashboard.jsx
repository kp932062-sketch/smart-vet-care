import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarDays, PawPrint, DollarSign } from 'lucide-react';
import Sidebar from '../common/Sidebar';
import StatsCard from '../common/StatsCard';

/* ── Sub-panel imports ── */
import AppointmentsPanel from './AppointmentsPanel';
import PatientDetailsPanel from './PatientDetailsPanel';
import ReportsPanel from './ReportsPanel';
import BankingPanel from './BankingPanel';
import DoctorProfileSection from './DoctorProfileSection';
import DoctorProfile from './DoctorProfile';
import useDoctorStats from '../../hooks/useDoctorStats';

/* ── Overview Panel (simple stats only, no charts) ── */
const OverviewPanel = ({ stats, loading, error }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard icon={CalendarDays} label="Today's Appointments" value={loading ? '...' : stats.todayAppointments} color="green"  delay={0}   />
      <StatsCard icon={PawPrint}     label="Animals Treated"      value={loading ? '...' : stats.totalPatients}     color="blue"   delay={50}  />
      <StatsCard icon={DollarSign}   label="Total Earnings"       value={loading ? '...' : `₹${(stats.totalEarnings || 0).toLocaleString()}`} color="orange" delay={100} />
    </div>

    {/* Profile */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div className="section-card p-5">
        <DoctorProfileSection />
      </div>
      <div className="section-card p-5">
        <DoctorProfile />
      </div>
    </div>

    {error && (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-700 text-sm">⚠️ {error}</p>
      </div>
    )}
  </div>
);

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { link } = useParams();
  const [activePanel, setActivePanel] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const { stats, loading, error } = useDoctorStats();

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':     return <OverviewPanel stats={stats} loading={loading} error={error} />;
      case 'appointments': return <AppointmentsPanel doctorLink={link} />;
      case 'patient':      return <PatientDetailsPanel />;
      case 'reports':      return <ReportsPanel doctorLink={link} />;
      case 'banking':      return <BankingPanel />;
      default:             return <OverviewPanel stats={stats} loading={loading} error={error} />;
    }
  };

  const panelTitles = {
    overview:     '🏥 Doctor Dashboard',
    appointments: '📅 Appointments',
    patient:      '🐾 Patient Details',
    reports:      '📄 Reports',
    banking:      '🏦 Earnings',
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        role="doctor"
        activePanel={activePanel}
        onPanelChange={setActivePanel}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <main className={`transition-all duration-300 pb-8 pl-4 pr-4 pt-20 sm:px-6 lg:px-8 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-60'}`}>
        <div className="dashboard-surface p-4 sm:p-6 lg:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{panelTitles[activePanel] || 'Dashboard'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your veterinary practice</p>
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
