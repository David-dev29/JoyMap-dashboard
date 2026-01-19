import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, Settings, Info } from 'lucide-react';

const CashCount = () => {
  const [dateRange, setDateRange] = useState('Últimos 30 días');
  const [cajasFilter, setCajasFilter] = useState('Todas las cajas');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Arqueo de caja</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo arqueo de caja
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-6 flex-wrap">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option>Últimos 30 días</option>
                  <option>Últimos 7 días</option>
                  <option>Hoy</option>
                  <option>Este mes</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Date Range Display */}
              <div className="text-sm text-gray-500">
                21 jul 2025 - 20 ago 2025
              </div>

              {/* Cajas Filter */}
              <div className="flex items-center gap-2">
                <select 
                  className="bg-transparent border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[160px]"
                  value={cajasFilter}
                  onChange={(e) => setCajasFilter(e.target.value)}
                >
                  <option>Todas las cajas</option>
                  <option>Caja 1</option>
                  <option>Caja 2</option>
                  <option>Caja Principal</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-2 flex items-center gap-1">
                Fecha de Apertura
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Fecha de Cierre
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-1 flex items-center gap-1">
                Caja
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Información del Sistema
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Información del Usuario
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-1 flex items-center gap-1">
                Diferencia
                <Info className="w-3 h-3 text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                Estado
                <Info className="w-3 h-3 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="p-12 text-center">
            <div className="text-gray-400 text-sm">
              No se han registrado otros movimientos
            </div>
          </div>
        </div>

        {/* Bottom Info Icon */}
        <div className="flex justify-start">
          <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
            <Info className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CashCount;