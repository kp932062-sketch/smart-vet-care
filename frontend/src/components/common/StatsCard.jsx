import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, trend, trendLabel, color = 'blue', delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const colorMap = {
    blue:    { bg: 'from-blue-500 to-blue-600',    light: 'bg-blue-50',  text: 'text-blue-600',    shadow: 'shadow-blue-500/20' },
    green:   { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-500/20' },
    purple:  { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600',  shadow: 'shadow-purple-500/20' },
    orange:  { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-50', text: 'text-orange-600',  shadow: 'shadow-orange-500/20' },
    pink:    { bg: 'from-pink-500 to-pink-600',    light: 'bg-pink-50',  text: 'text-pink-600',    shadow: 'shadow-pink-500/20' },
    teal:    { bg: 'from-teal-500 to-teal-600',    light: 'bg-teal-50',  text: 'text-teal-600',    shadow: 'shadow-teal-500/20' },
    indigo:  { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600',  shadow: 'shadow-indigo-500/20' },
    yellow:  { bg: 'from-amber-500 to-amber-600',  light: 'bg-amber-50', text: 'text-amber-600',   shadow: 'shadow-amber-500/20' },
  };
  const c = colorMap[color] || colorMap.blue;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericValue) || numericValue === 0) { setDisplayValue(value); return; }

    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * numericValue);
      setDisplayValue(typeof value === 'number' ? start : start.toLocaleString());
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(typeof value === 'number' ? numericValue : value);
    };
    requestAnimationFrame(animate);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className={`glass-card rounded-2xl p-5 stats-glow hover:-translate-y-1 transition-all duration-300 animate-slide-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-lg ${c.shadow}`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">
        {displayValue}
      </p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      {trendLabel && <p className="text-[10px] text-slate-400 mt-1">{trendLabel}</p>}
    </div>
  );
};

export default StatsCard;
