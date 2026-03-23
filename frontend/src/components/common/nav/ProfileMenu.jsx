import React, { useEffect, useRef, useState } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';
import Button from '../Button';

const ProfileMenu = ({ name, roleLabel, onLogout }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = String(name || 'U').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 transition-all hover:bg-white/20"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white">
          {initial}
        </div>
        <div className="hidden sm:block text-left">
          <p className="max-w-[120px] truncate text-sm font-semibold leading-tight text-white">{name}</p>
          <p className="text-[11px] leading-tight text-white/70">{roleLabel}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-white/80" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 animate-fade-in">
          <Button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-900/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;