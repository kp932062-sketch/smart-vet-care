import React from 'react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-12 h-12', text: 'text-3xl' },
    xl: { icon: 'w-16 h-16', text: 'text-4xl' },
  };

  const { icon, text } = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${icon} bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg`}>
        <span className="text-white text-lg">🩺</span>
      </div>
      {showText && (
        <h1 className={`${text} font-extrabold`}>
          <span className="text-blue-600">Smart</span>
          <span className="text-emerald-600">Vet</span>
        </h1>
      )}
    </div>
  );
};

export default Logo;
