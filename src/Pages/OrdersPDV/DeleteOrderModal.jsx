import React from "react";
import { X } from "lucide-react";

export default function DeleteOrderModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-20"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Contenido */}
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 pr-8">
            Eliminar pedido
          </h2>

          <div className="mb-6 space-y-3">
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Todos los pagos de este pedido serán cancelados. Esta acción no se puede deshacer y solo es posible porque tienes un rol de Administrador.
            </p>
            <p className="text-gray-900 font-medium text-sm sm:text-base">
              ¿Estás seguro de que deseas eliminar permanentemente el Pedido?
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:w-auto px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              Eliminar permanentemente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
