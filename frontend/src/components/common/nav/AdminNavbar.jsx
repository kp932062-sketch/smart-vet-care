import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import ProfileMenu from './ProfileMenu';
import MobileNavDrawer from './MobileNavDrawer';

const AdminNavbar = ({ displayName, onLogout }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: '/admin-dashboard', label: 'Dashboard' },
    { to: '/admin/add-doctor', label: 'Add Doctor' }
  ];

  const mobileLinks = useMemo(
    () => links.map((link) => ({ ...link, active: location.pathname === link.to })),
    [location.pathname]
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-gradient-to-r from-indigo-800 via-slate-900 to-indigo-800 shadow-[0_10px_30px_-18px_rgba(79,70,229,0.75)] backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:pl-60">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/admin-dashboard" className="flex items-center gap-2.5 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/70 text-base font-black shadow-md">⚙</div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-bold tracking-wide">SmartVet</p>
              <p className="text-xs text-white/80">Admin Console</p>
            </div>
          </Link>
          <div className="ml-1 hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  location.pathname === link.to ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfileMenu name={displayName} roleLabel="Admin" onLogout={onLogout} />
        </div>
      </nav>
      <MobileNavDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} links={mobileLinks} title="Admin Navigation" />
    </header>
  );
};

export default AdminNavbar;