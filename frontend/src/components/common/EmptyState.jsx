import React from 'react';

const EmptyState = ({ icon = '📭', title, description, action = null }) => {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-slate-300/80 bg-slate-50/80 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-3xl shadow-sm dark:bg-slate-800">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
