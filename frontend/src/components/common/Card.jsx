import React from 'react';

const Card = ({ children, className = '', interactive = false }) => {
  return (
    <div
      className={`rounded-2xl border border-white/70 bg-white/90 shadow-[0_12px_32px_-20px_rgba(17,24,39,0.45)] backdrop-blur-md transition-all duration-300 dark:border-slate-700/80 dark:bg-slate-900/75 dark:shadow-[0_16px_36px_-24px_rgba(15,23,42,0.85)] ${
        interactive ? 'hover:-translate-y-1 hover:shadow-[0_20px_40px_-26px_rgba(29,78,216,0.45)] dark:hover:shadow-[0_20px_40px_-24px_rgba(14,116,144,0.45)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
