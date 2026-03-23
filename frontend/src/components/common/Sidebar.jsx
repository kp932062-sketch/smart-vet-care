import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAllSessions } from '../../utils/auth';
import {
  LayoutDashboard, Users, CalendarDays, Stethoscope, FileText,
  Settings, ClipboardList, ShieldCheck, MessageSquare,
  ChevronLeft, ChevronRight, Menu, X, LogOut,
  PawPrint, Wallet, Heart
} from 'lucide-react';

/* ── Menu configs per role ── */
const userMenu = [
  { key: 'overview',         label: 'Overview',        icon: LayoutDashboard },
  { key: 'viewappointments', label: 'My Appointments', icon: CalendarDays },
  { key: 'doctor',           label: 'Find Doctors',    icon: Stethoscope },
  { key: 'appointments',     label: 'Book Appointment',icon: ClipboardList },
  { key: 'reports',          label: 'Medical Reports', icon: FileText },
  { key: 'profile',          label: 'Profile',         icon: Settings },
  { key: 'support',          label: 'Support Chat',    icon: MessageSquare },
];

const doctorMenu = [
  { key: 'overview',     label: 'Overview',        icon: LayoutDashboard },
  { key: 'appointments', label: 'Appointments',    icon: CalendarDays },
  { key: 'patient',      label: 'Patient Details', icon: PawPrint },
  { key: 'reports',      label: 'Reports',         icon: FileText },
  { key: 'banking',      label: 'Earnings',        icon: Wallet },
];


const Sidebar = ({ role = 'user', activePanel, onPanelChange, collapsed, onToggleCollapse }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const menu = useMemo(() => {
    if (role === 'doctor') return doctorMenu;
    return userMenu;
  }, [role]);

  const roleColors = {
    doctor: { gradient: 'from-emerald-600 to-teal-700',  accent: 'bg-emerald-500', text: 'SmartVet Doctor' },
    user:   { gradient: 'from-blue-600 to-cyan-700',     accent: 'bg-blue-500',    text: 'SmartVet' },
  };
  const rc = roleColors[role] || roleColors.user;

  const handleLogout = () => {
    clearAllSessions();
    navigate('/');
  };

  const handleItemClick = (key) => {
    onPanelChange(key);
    setMobileOpen(false);
  };

  /* ── Sidebar content (shared between mobile & desktop) ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <Heart className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-white tracking-tight truncate">{rc.text}</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {menu.map((item) => {
          const isActive = activePanel === item.key;
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              title={collapsed ? item.label : undefined}
              className={`relative w-full flex items-center gap-3 rounded-xl transition-all duration-200 group
                ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}
                ${isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }
              `}
            >
              {isActive && <div className="sidebar-active-indicator" />}
              <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-all
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-[13px] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-sidebar-bg shadow-lg flex items-center justify-center text-white hover:bg-sidebar-hover transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-64 h-full bg-sidebar-bg animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar-bg z-40 transition-all duration-300 border-r border-white/5
        ${collapsed ? 'w-[68px]' : 'w-60'}
      `}>
        <SidebarContent />

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-bg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors shadow-md"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
