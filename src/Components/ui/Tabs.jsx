import { useState, createContext, useContext } from 'react';

const TabsContext = createContext(null);

const Tabs = ({
  children,
  defaultValue,
  value,
  onChange,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = '' }) => (
  <div
    className={`
      flex gap-1 p-1
      bg-gray-100 dark:bg-gray-800
      rounded-lg
      ${className}
    `}
  >
    {children}
  </div>
);

const TabsTrigger = ({ value, children, className = '', disabled = false }) => {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      onClick={() => !disabled && context?.onChange(value)}
      disabled={disabled}
      className={`
        flex-1 px-4 py-2
        text-sm font-medium
        rounded-md
        transition-all
        ${isActive
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);

  if (context?.value !== value) return null;

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
