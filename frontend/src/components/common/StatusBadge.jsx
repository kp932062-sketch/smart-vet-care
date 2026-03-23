import React from 'react';

const toneByStatus = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-200',
  confirmed: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-700/60 dark:bg-sky-900/30 dark:text-sky-200',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200',
  cancelled: 'border-red-200 bg-red-50 text-red-800 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-200',
  rejected: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200',
  inactive: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200',
  blocked: 'border-red-200 bg-red-50 text-red-800 dark:border-red-700/60 dark:bg-red-900/30 dark:text-red-200',
  deleted: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200'
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || 'unknown').toLowerCase();
  const tone = toneByStatus[normalized] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${tone}`}>
      {normalized}
    </span>
  );
};

export default StatusBadge;
