import React from 'react';

const FormTextarea = ({
  label,
  error,
  helperText,
  className = '',
  required = false,
  rows = 4,
  ...props
}) => {
  return (
    <label className={`flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-200 ${className}`}>
      <span className="font-medium">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      <textarea
        {...props}
        rows={rows}
        className={`w-full rounded-xl px-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : ''
        }`}
      />
      {error ? (
        <span className="text-xs text-rose-600 dark:text-rose-300">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">{helperText}</span>
      ) : null}
    </label>
  );
};

export default FormTextarea;
