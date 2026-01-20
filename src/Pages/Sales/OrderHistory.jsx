import React, { useState } from 'react';
import { Calendar, RefreshCw, Search, Download, ChevronDown, Filter, Info, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const SalesPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('hoy');
  const [selectedCreation, setSelectedCreation] = useState('dia-entero');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
              <Calendar className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 bg-white">
              <Download className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Date Period */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
                <span>Hoy</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">20 ago 2025 - 20 ago 2025</span>
            </div>

            {/* Creation Filter */}
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <span>Día entero</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Creation Time Filter */}
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <span>Creación</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Filter Button */}
            <button className="p-1.5 text-gray-400 hover:text-gray-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Key Indicators */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <span className="text-sm font-medium">Indicadores clave</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Eye className="w-4 h-4" />
              <span>Pedidos: <span className="font-semibold">0</span></span>
              <span className="ml-4">Total: <span className="font-semibold">MXN 0.00</span></span>
              <Eye className="w-4 h-4 ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div>ESTADO</div>
          <div>ORIGEN</div>
          <div>FECHA CREACIÓN/CIERRE</div>
          <div>MESA</div>
          <div>CLIENTE</div>
          <div className="flex items-center space-x-1">
            <span>ESTADO DE PAGO</span>
            <Info className="w-3 h-3" />
          </div>
          <div className="flex items-center space-x-1">
            <span>TOTAL</span>
            <Info className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white flex-1">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg viewBox="0 0 64 64" fill="currentColor" className="w-full h-full">
                <path d="M8 8h48v6H8V8zm0 10h48v6H8v-6zm0 10h48v6H8v-6zm0 10h48v6H8v-6zm0 10h48v6H8v-6z" opacity="0.3"/>
                <path d="M4 4v56h56V4H4zm4 4h48v48H8V8z"/>
                <path d="M12 12h40v4H12v-4zm0 8h40v4H12v-4zm0 8h40v4H12v-4zm0 8h40v4H12v-4zm0 8h40v4H12v-4z"/>
              </svg>
            </div>
            <p className="text-gray-600 text-sm">
              Aquí encuentras todos tus pedidos (abiertos y/o finalizados).
            </p>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Elementos por página:</span>
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            0-0 of 0
          </div>

          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;