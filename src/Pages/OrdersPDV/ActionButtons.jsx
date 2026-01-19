import React from 'react';
import { Plus, Pause, RefreshCw, Search, Grid3X3 } from 'lucide-react';

// 1. Recibe la función 'onSearchClick' desde el componente padre
const ActionButtons = ({ onSearchClick }) => {
  // Separa los íconos para darles funciones específicas si es necesario en el futuro
  const otherIcons = [Grid3X3, RefreshCw, Pause];

  return (
    <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl">
      {/* Botones de iconos genéricos */}
      {otherIcons.map((Icon, idx) => (
        <button
          key={idx}
          className="flex items-center justify-center p-3 bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 shadow-md transition-all duration-200"
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}

      {/* Botón de búsqueda con su propia función */}
      <button
        onClick={onSearchClick} // 2. El botón de búsqueda ahora tiene su evento onClick
        className="flex items-center justify-center p-3 bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 shadow-md transition-all duration-200"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Botón principal */}
      <button className="flex items-center space-x-3 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-semibold shadow-md">
        <Plus className="w-6 h-6" />
        <span>Nuevo pedido</span>
      </button>
    </div>
  );
};

export default ActionButtons;
