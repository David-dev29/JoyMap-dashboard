import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  icon,
  iconBg = 'bg-red-100 dark:bg-red-900',
  iconColor = 'text-red-500',
  subtitle,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="mt-4 h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-2 h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        {icon && (
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>

        {(change !== undefined || subtitle) && (
          <div className="flex items-center mt-2 gap-2">
            {change !== undefined && (
              <span
                className={`
                  inline-flex items-center text-sm font-medium
                  ${changeType === 'positive' ? 'text-green-600 dark:text-green-400' : ''}
                  ${changeType === 'negative' ? 'text-red-600 dark:text-red-400' : ''}
                  ${changeType === 'neutral' ? 'text-gray-500 dark:text-gray-400' : ''}
                `}
              >
                {changeType === 'positive' && <TrendingUp size={16} className="mr-1" />}
                {changeType === 'negative' && <TrendingDown size={16} className="mr-1" />}
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
