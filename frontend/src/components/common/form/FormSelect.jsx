import React from 'react';

const FormSelect = ({
  label,
  error,
  helperText,
  children,
  className = '',
  required = false,
  ...props
}) => {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-200 ${className}`}>
      <span className="font-medium">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <select
        {...props}
        className={`w-full rounded-xl px-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : ''
        }`}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-rose-600 dark:text-rose-300">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
      ) : null}
    </label>
  );
};

export default FormSelect;
