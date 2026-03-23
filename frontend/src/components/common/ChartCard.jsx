import React from 'react';

const ChartCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`glass-card rounded-2xl p-5 animate-fade-in ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="w-full" style={{ minHeight: 220 }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
