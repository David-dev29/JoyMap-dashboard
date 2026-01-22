import { forwardRef } from 'react';
import Spinner from './Spinner';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/25',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-200',
  outline: 'border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800 dark:text-gray-200',
  ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-slate-700 dark:text-gray-200',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/25',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/25',
};

const sizes = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
  xl: 'px-6 py-3.5 text-base',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="mr-2" />
      ) : leftIcon ? (
        <span className="mr-2 -ml-0.5">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="ml-2 -mr-0.5">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
