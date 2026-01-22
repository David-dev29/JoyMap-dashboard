import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props
}, ref) => {
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            block w-full rounded-lg border transition-colors
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
