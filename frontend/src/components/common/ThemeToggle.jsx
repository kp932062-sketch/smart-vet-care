import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getStoredTheme, toggleTheme } from '../../utils/theme';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    const onStorage = () => setTheme(getStoredTheme());
    const onThemeChanged = (event) => {
      const changedTheme = event?.detail?.theme;
      setTheme(changedTheme === 'dark' ? 'dark' : 'light');
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('smartvet-theme-changed', onThemeChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('smartvet-theme-changed', onThemeChanged);
    };
  }, []);

  const handleToggle = () => {
    setTheme(toggleTheme());
  };

  return (
    <button
      onClick={handleToggle}
      className="relative inline-flex h-10 w-20 items-center rounded-full border border-white/20 bg-white/10 px-1.5 transition-all duration-300 hover:bg-white/20 dark:border-white/15"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute h-7 w-7 rounded-full bg-white text-slate-800 shadow-md transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-[38px]' : 'translate-x-0'
        }`}
      />
      <span className="relative z-10 flex w-full items-center justify-between px-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
        <Moon className="h-3.5 w-3.5" />
        <Sun className="h-3.5 w-3.5" />
      </span>
    </button>
  );
};

export default ThemeToggle;
