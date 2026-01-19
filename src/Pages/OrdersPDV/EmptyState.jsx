import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-blue-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Crea pedidos para cada tipo de servicio
        </h3>
        <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          <span>Nuevo pedido</span>
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
