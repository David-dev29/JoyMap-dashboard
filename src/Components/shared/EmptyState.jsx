import { Inbox } from 'lucide-react';
import Button from '../ui/Button';

const EmptyState = ({
  icon,
  title = 'No hay datos',
  description = 'No se encontraron resultados.',
  action,
  actionLabel,
  onAction,
  className = '',
}) => {
  const Icon = icon || Inbox;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon size={32} className="text-gray-400 dark:text-gray-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>

      {(action || (actionLabel && onAction)) && (
        action || (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
};

export default EmptyState;
