import React from 'react';

const FormInput = ({
  label,
  error,
  helperText,
  icon,
  state,
  className = '',
  inputClassName = '',
  labelClassName = '',
  required = false,
  ...props
}) => {
  const validationState = error ? 'error' : state;

  return (
    <label className={`flex flex-col gap-1.5 text-sm text-gray-700 dark:text-gray-300 ${className}`}>
      {label ? (
        <span className={`font-medium ${labelClassName}`}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      ) : null}

      <span className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </span>
        ) : null}
        <input
          {...props}
          className={`w-full rounded-xl px-4 py-3 text-sm border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 ${
            icon ? 'pl-10' : ''
          } ${
            validationState === 'error'
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : validationState === 'success'
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                : ''
          } ${inputClassName}`}
        />
      </span>

      {error ? (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>
      ) : null}
    </label>
  );
};

export default FormInput;