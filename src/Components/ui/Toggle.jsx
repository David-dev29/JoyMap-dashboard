const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
}) => {
  const sizes = {
    sm: {
      toggle: 'w-8 h-5',
      dot: 'w-3 h-3',
      translate: 'translate-x-3.5',
    },
    md: {
      toggle: 'w-11 h-6',
      dot: 'w-4 h-4',
      translate: 'translate-x-5',
    },
    lg: {
      toggle: 'w-14 h-7',
      dot: 'w-5 h-5',
      translate: 'translate-x-7',
    },
  };

  const currentSize = sizes[size];

  const handleChange = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-start ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleChange}
        disabled={disabled}
        className={`
          relative inline-flex shrink-0
          ${currentSize.toggle}
          ${checked ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          border-2 border-transparent
          rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        `}
      >
        <span
          className={`
            ${currentSize.dot}
            ${checked ? currentSize.translate : 'translate-x-0.5'}
            inline-block
            bg-white
            rounded-full
            shadow
            transform
            transition-transform duration-200 ease-in-out
            mt-0.5
          `}
        />
      </button>

      {(label || description) && (
        <div className="ml-3">
          {label && (
            <span
              onClick={handleChange}
              className={`
                text-sm font-medium
                ${disabled ? 'text-gray-400' : 'text-gray-900 dark:text-white cursor-pointer'}
              `}
            >
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Toggle;
