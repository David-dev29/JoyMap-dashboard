const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-white dark:bg-slate-800
        rounded-2xl
        transition-all duration-200
        ${hover ? 'hover:shadow-lg cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', action }) => (
  <div className={`flex items-start justify-between mb-6 ${className}`}>
    <div>{children}</div>
    {action && <div>{action}</div>}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
