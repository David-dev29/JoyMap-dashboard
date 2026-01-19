import React, { useState } from 'react';
import { Calendar, ChevronDown, Filter, Plus, Settings, Info } from 'lucide-react';

const FinancialRecords = () => {
  const [dateRange, setDateRange] = useState('Hoy');
  const [filterType, setFilterType] = useState('Solo efectivo');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Registros financieros</h1>
            <Info className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo registro
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Date Filter */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select 
                  className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option>Hoy</option>
                  <option>Ayer</option>
                  <option>Esta semana</option>
                  <option>Este mes</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Date Range */}
              <div className="text-sm text-gray-500">
                20 ago 2025 - 20 ago 2025
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <select 
                  className="bg-transparent border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-w-[140px]"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option>Solo efectivo</option>
                  <option>Todos</option>
                  <option>Tarjeta</option>
                  <option>Transferencia</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>

              {/* Filter Button */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Movement Date</div>
              <div className="col-span-2">Caja</div>
              <div className="col-span-2">Usuario</div>
              <div className="col-span-1">Tipo</div>
              <div className="col-span-2">Categoría</div>
              <div className="col-span-2">Método de Pago</div>
              <div className="col-span-1 text-right">Monto</div>
            </div>
          </div>

          {/* Empty State */}
          <div className="p-12 text-center">
            <div className="text-gray-400 text-sm">
              No se han registrado otros movimientos
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialRecords;