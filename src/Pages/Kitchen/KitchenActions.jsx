// KitchenActions.jsx
import React from 'react';
import { Check, RefreshCw, Maximize2, Settings } from 'lucide-react';

const KitchenActions = ({ onOpenConfig, onMarkAll }) => {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onMarkAll} // ✅ Abrir modal de confirmación
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Check className="w-5 h-5" />
        <span>Marcar todas</span>
      </button>
      {/* otros botones */}
      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
        <RefreshCw className="w-5 h-5" />
      </button>
      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
        <Maximize2 className="w-5 h-5" />
      </button>
      <button
        onClick={onOpenConfig}
        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white font-medium"
      >
        <Settings className="w-5 h-5" />
        <span>Cocinas</span>
      </button>
    </div>
  );
};

export default KitchenActions;
