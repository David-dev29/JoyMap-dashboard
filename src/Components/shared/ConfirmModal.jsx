import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

const icons = {
  danger: { icon: Trash2, bg: 'bg-red-100 dark:bg-red-900', color: 'text-red-600 dark:text-red-400' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-100 dark:bg-yellow-900', color: 'text-yellow-600 dark:text-yellow-400' },
  info: { icon: Info, bg: 'bg-blue-100 dark:bg-blue-900', color: 'text-blue-600 dark:text-blue-400' },
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar accion',
  message = '¿Estas seguro de que deseas continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // danger, warning, info
  loading = false,
}) => {
  const { icon: Icon, bg, color } = icons[type] || icons.danger;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${bg} mb-4`}>
          <Icon size={24} className={color} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </p>

        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={type === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
