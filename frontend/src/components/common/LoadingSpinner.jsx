import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} animate-spin rounded-full border-4 border-blue-200 border-t-blue-600`}></div>
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600 animate-pulse">{message}</p>
  </div>
);

export const ButtonLoader = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
    <span>Loading...</span>
  </div>
);

export default LoadingSpinner;
