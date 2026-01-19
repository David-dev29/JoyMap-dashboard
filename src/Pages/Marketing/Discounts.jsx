import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

const DiscountCodesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Códigos de descuento</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Search and Create Button */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar un descuento"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Create Discount Button */}
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Crear descuento</span>
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>CÓDIGO DE DESCUENTO</div>
              <div>PUBLICAR EN EL MENÚ</div>
              <div>DESCUENTO</div>
              <div>USADO/LÍMITE</div>
              <div>FECHA DE INICIO/FIN</div>
              <div>ESTADO</div>
            </div>
          </div>

          {/* Empty State */}
          <div className="py-20">
            <div className="text-center">
              <div className="text-gray-500 text-sm">
                No data available
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountCodesPage;