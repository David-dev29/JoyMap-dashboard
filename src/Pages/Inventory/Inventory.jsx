import React, { useState } from 'react';
import { Download, Filter, Search, Info, ChevronDown } from 'lucide-react';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const products = [
    {
      id: 1,
      name: 'Hamburguesa clásica',
      category: 'HAMBURGUESAS & HOCROS',
      categoryIcon: '🍔🥖',
      stockControl: true,
      availability: 'Disponible',
      inventory: '',
      minStock: ''
    },
    {
      id: 2,
      name: 'Hamburguesa Norteña',
      category: 'HAMBURGUESAS & HOCROS',
      categoryIcon: '🍔🥖',
      stockControl: true,
      availability: 'Disponible',
      inventory: '',
      minStock: ''
    },
    {
      id: 3,
      name: 'Cemita Milanesa de pollo',
      category: 'TORTAS & CEMITAS',
      categoryIcon: '🥪🍞',
      stockControl: true,
      availability: 'Disponible',
      inventory: '',
      minStock: ''
    }
  ];

  const categories = [
    { name: 'HAMBURGUESAS & HOCROS', icon: '🍔🥖' },
    { name: 'TORTAS & CEMITAS', icon: '🥪🍞' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 text-green-600" />
            <span className="text-sm">Descargar Excel</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              {/* Filter Button and Status */}
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600">
                  <Filter className="w-4 h-4" />
                </button>
                
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center space-x-1">
                    <span className="text-green-600 font-medium">3 Disponible</span>
                    <span className="text-orange-500">(0 Alerta)</span>
                  </span>
                  <span className="text-red-500 font-medium">0 Agotado</span>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar un producto"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div>PRODUCTOS</div>
              <div className="flex items-center space-x-1">
                <span>CONTROL DE STOCK</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>DISPONIBILIDAD</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>INVENTARIO</span>
                <Info className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-1">
                <span>STOCK MÍN.</span>
                <Info className="w-3 h-3" />
              </div>
              <div></div>
            </div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.name}>
                {/* Category Header */}
                <div className="px-6 py-3 bg-gray-50">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <span>{category.name}</span>
                    <span className="text-lg">{category.icon}</span>
                  </div>
                </div>

                {/* Category Products */}
                {products
                  .filter(product => product.category === category.name)
                  .map((product) => (
                    <div key={product.id} className="px-6 py-4">
                      <div className="grid grid-cols-6 gap-4 items-center">
                        {/* Product Name */}
                        <div className="text-sm text-gray-900 font-medium">
                          {product.name}
                        </div>

                        {/* Stock Control Toggle */}
                        <div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={product.stockControl}
                              className="sr-only peer"
                              readOnly
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Availability Dropdown */}
                        <div>
                          <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-md">
                            <span>{product.availability}</span>
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Inventory */}
                        <div className="text-sm text-gray-900">
                          {product.inventory}
                        </div>

                        {/* Min Stock */}
                        <div className="text-sm text-gray-900">
                          {product.minStock}
                        </div>

                        {/* Actions */}
                        <div>
                          {/* Empty for now */}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-2 py-4">
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            ‹
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded text-sm font-medium">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;