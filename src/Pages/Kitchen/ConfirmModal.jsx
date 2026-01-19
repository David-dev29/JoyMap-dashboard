// ConfirmModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const ConfirmModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 pr-8">
            Marcar todo como preparado
          </h2>

          <div className="space-y-4 text-gray-700">
            <p className="text-base leading-relaxed">
              Estás a punto de marcar todos los pedidos de todas las cocinas como preparados. Esta acción no se puede deshacer.
            </p>
            <p className="text-base font-medium">
              ¿Estás seguro de que deseas continuar?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
