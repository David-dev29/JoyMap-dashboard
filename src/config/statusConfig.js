// Shared status configuration for consistent badge colors across the app
// Use these exact colors everywhere status badges are shown

export const orderStatusConfig = {
  pending: {
    label: 'Pendiente',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    dotClass: 'bg-amber-500',
  },
  confirmed: {
    label: 'Confirmado',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  preparing: {
    label: 'Preparando',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  ready: {
    label: 'Listo',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400',
    dotClass: 'bg-purple-500',
  },
  delivering: {
    label: 'En camino',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400',
    dotClass: 'bg-purple-500',
  },
  delivered: {
    label: 'Entregado',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  completed: {
    label: 'Completado',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelado',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-400',
    dotClass: 'bg-rose-500',
  },
};

export const businessStatusConfig = {
  active: {
    label: 'Activo',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  open: {
    label: 'Abierto',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  inactive: {
    label: 'Inactivo',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
    dotClass: 'bg-gray-400',
  },
  closed: {
    label: 'Cerrado',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
    dotClass: 'bg-gray-400',
  },
};

export const couponStatusConfig = {
  active: {
    label: 'Activo',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  inactive: {
    label: 'Inactivo',
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
  },
  expired: {
    label: 'Expirado',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

// Helper to get status badge classes
export const getStatusClasses = (status, config) => {
  const statusData = config[status] || config.pending || {
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
    label: status,
  };
  return `${statusData.bgClass} ${statusData.textClass}`;
};

// Status Badge Component helper
export const StatusBadge = ({ status, config, className = '' }) => {
  const statusData = config[status] || {
    bgClass: 'bg-gray-100 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
    label: status,
  };

  return `px-2 py-0.5 rounded-full text-xs font-medium ${statusData.bgClass} ${statusData.textClass} ${className}`;
};
