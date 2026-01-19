import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function TemplateEditor({ activeConfig, activeTemplate, activeTemplateData, updateMessage }) {
  return (
    <div className="bg-white border-b border-gray-200 flex-1">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-lg">{activeConfig.icon}</span>
          <h2 className="text-lg font-semibold text-blue-600">{activeConfig.title}</h2>
        </div>
        <p className="text-sm text-gray-600">
          Envía automáticamente un mensaje a tus clientes cuando abandonen su carrito de compra sin completar la transacción
        </p>
      </div>

      <div className="p-6">
        <textarea
          value={activeTemplateData.message}
          onChange={(e) => updateMessage(activeTemplate, e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder="Escribe tu mensaje aquí..."
        />
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{activeTemplateData.message.length}/500</span>
          <div className="flex space-x-2">
            <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50">😊</button>
            <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 font-bold text-xs">B</button>
            <button className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 italic text-xs">I</button>
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          <div className="flex-1">
            <button className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-blue-600">
              (Nombre de cliente)
            </button>
          </div>
          <div className="flex-1">
            <button className="w-full px-3 py-2 text-left text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-blue-600">
              (Lista de productos)
            </button>
          </div>
        </div>

        <div className="flex space-x-4 mt-3">
          <div className="flex-1">
            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Códigos de descuento</option>
            </select>
          </div>
          <div className="flex-1">
            <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Otros</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer mensaje por defecto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
