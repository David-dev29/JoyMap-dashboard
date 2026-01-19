import React, { useState } from 'react';
import { Search, Plus, Download, Filter, MoreVertical, Info, ChevronDown, ChevronUp } from 'lucide-react';

const ClientsPage = () => {
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const clients = [
    {
      id: 1,
      name: 'Cristian',
      phone: '+52 0823698800',
      registrationChannel: 'Menú digital',
      loyaltyPoints: 0,
      totalOrders: 1,
      segment: 'Comprador',
      status: 'Durmiendo',
      statusColor: 'yellow'
    },
    {
      id: 2,
      name: 'Crixz',
      phone: '+52 2222334455',
      registrationChannel: 'Menú digital',
      loyaltyPoints: 0,
      totalOrders: 0,
      segment: 'Sin pedidos',
      status: 'Inactivo',
      statusColor: 'purple'
    },
    {
      id: 3,
      name: 'David',
      phone: '+52 2227583065',
      registrationChannel: 'Menú digital',
      loyaltyPoints: 0,
      totalOrders: 2,
      segment: 'Comprador Repetitivo',
      status: 'Activo',
      statusColor: 'green'
    },
    {
      id: 4,
      name: 'Manuel',
      phone: '+52 9988776655',
      registrationChannel: 'Menú digital',
      loyaltyPoints: 0,
      totalOrders: 1,
      segment: 'Comprador',
      status: 'Activo',
      statusColor: 'green'
    }
  ];

  const filters = [
    { id: 'todos', label: 'Todos', active: true },
    { id: 'comprador-elite', label: 'Comprador Élite', active: false },
    { id: 'comprador-top', label: 'Comprador Top', active: false },
    { id: 'comprador-frecuente', label: 'Comprador Frecuente', active: false }
  ];

  const getStatusDot = (color) => {
    const colors = {
      yellow: 'bg-yellow-400',
      purple: 'bg-purple-400', 
      green: 'bg-green-400'
    };
    return colors[color] || 'bg-gray-400';
  };

  const getSegmentStyle = (segment) => {
    if (segment === 'Comprador Repetitivo') {
      return 'text-teal-600 bg-teal-50 border-teal-200';
    }
    if (segment === 'Comprador') {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>

            {/* Import/Export */}
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 text-green-600" />
              <span className="text-sm">Importar/ Exportar</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* New Client */}
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Nuevo cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filtro</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {filters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                        activeFilter === filter.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                Total de clientes: <span className="font-semibold">4</span>
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <span>CLIENTE</span>
                <ChevronUp className="w-3 h-3" />
              </div>
              <div>CANAL DE REGISTRO</div>
              <div className="flex items-center space-x-1">
                <span>PUNTOS DE FIDELIDAD</span>
                <ChevronDown className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>TOTAL DE PEDIDOS</span>
                <ChevronUp className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>SEGMENTO DE CLIENTE</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>ESTADO DE CLIENTE</span>
                <Info className="w-3 h-3" />
              </div>
              <div></div>
            </div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-200">
            {clients.map((client) => (
              <div key={client.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-7 gap-4 items-center">
                  {/* Client */}
                  <div>
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.phone}</div>
                  </div>

                  {/* Registration Channel */}
                  <div className="text-sm text-gray-900">
                    {client.registrationChannel}
                  </div>

                  {/* Loyalty Points */}
                  <div className="text-sm text-gray-900">
                    {client.loyaltyPoints}
                  </div>

                  {/* Total Orders */}
                  <div className="text-sm text-gray-900">
                    {client.totalOrders}
                  </div>

                  {/* Segment */}
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded border ${getSegmentStyle(client.segment)}`}>
                      {client.segment}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(client.statusColor)}`}></div>
                    <span className="text-sm text-gray-900">{client.status}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;