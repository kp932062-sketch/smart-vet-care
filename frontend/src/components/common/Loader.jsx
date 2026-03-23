import React from 'react';

const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-600 dark:text-slate-300">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-brand-900" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand-600 border-r-brand-600 dark:border-t-brand-400 dark:border-r-brand-400" />
      </div>
      <span className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300">{label}</span>
    </div>
  );
};

export default Loader;
