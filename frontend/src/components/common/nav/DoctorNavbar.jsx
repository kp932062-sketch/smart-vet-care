import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import ProfileMenu from './ProfileMenu';
import MobileNavDrawer from './MobileNavDrawer';

const DoctorNavbar = ({ displayName, onLogout }) => {
  const location = useLocation();
  const isReportsRoute = location.pathname.includes('/reports');
  const [mobileOpen, setMobileOpen] = useState(false);
  const baseDoctorPath = location.pathname.split('/reports')[0];

  const links = useMemo(
    () => [
      { to: baseDoctorPath, label: 'Dashboard', active: !isReportsRoute },
      { to: `${baseDoctorPath}/reports`, label: 'Reports', active: isReportsRoute },
    ],
    [baseDoctorPath, isReportsRoute]
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 shadow-[0_10px_30px_-18px_rgba(6,182,212,0.7)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:pl-60">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to={baseDoctorPath} className="flex items-center gap-2.5 text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg">🩺</span>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold tracking-wide">SmartVet</p>
              <p className="text-xs text-white/80">Doctor Console</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <span className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              !isReportsRoute ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
            }`}>
              Dashboard
            </span>
            <span className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isReportsRoute ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
            }`}>
              Reports
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileMenu name={displayName} roleLabel="Doctor" onLogout={onLogout} />
        </div>
      </nav>
      <MobileNavDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} links={links} title="Doctor Navigation" />
    </header>
  );
};

export default DoctorNavbar;
