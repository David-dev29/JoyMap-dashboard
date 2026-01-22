import { TrendingUp, TrendingDown } from 'lucide-react';

const iconColors = {
  primary: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/20',
  },
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  warning: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/20',
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/20',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/20',
  },
};

const StatsCard = ({
  title,
  value,
  change,
  changeLabel,
  changeType = 'neutral', // positive, negative, neutral
  icon,
  iconVariant = 'primary',
  loading = false,
  className = '',
}) => {
  const colors = iconColors[iconVariant] || iconColors.primary;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="mt-4 h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-2 h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-6 transition-all hover:shadow-md ${className}`}>
      {/* Top row: Icon + Badge */}
      <div className="flex items-start justify-between">
        {/* Icon */}
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg}`}>
            <span className={colors.text}>{icon}</span>
          </div>
        )}

        {/* Change Badge */}
        {change !== undefined && (
          <div
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              ${changeType === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
              ${changeType === 'negative' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
              ${changeType === 'neutral' ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' : ''}
            `}
          >
            {changeType === 'positive' && <TrendingUp size={12} />}
            {changeType === 'negative' && <TrendingDown size={12} />}
            {change}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </h3>
      </div>

      {/* Title / Label */}
      <div className="mt-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {title}
          {changeLabel && (
            <span className="text-gray-400 dark:text-gray-500"> {changeLabel}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;
