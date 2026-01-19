import React from 'react';
import { Filter, Check, MapPin } from 'lucide-react';

const StatusTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex items-center justify-between">
      {/* Contenedor Tabs */}
      <div className="flex items-center space-x-3">
        {/* Botón filtro */}
        <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Filter className="w-4 h-4" />
        </button>

        {/* Tabs */}
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium transition-colors relative
                ${
                  activeTab === tab.id
                    ? tab.label === "Pendiente"
                      ? "bg-orange-100 border-orange-300 text-orange-600"
                      : tab.label === "En curso"
                      ? "bg-green-100 border-green-300 text-green-600"
                      : "bg-blue-100 border-blue-300 text-blue-600"
                    : "bg-white border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
            >
              {/* Palomita a la izquierda si está activo */}
              {activeTab === tab.id &&
                (tab.label === "Todo" ||
                  tab.label === "Pendiente" ||
                  tab.label === "En curso") && (
                  <Check
                    className={`w-4 h-4 ${
                      tab.label === "Pendiente"
                        ? "text-orange-600"
                        : tab.label === "En curso"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  />
                )}

              <span>{tab.label}</span>

              {tab.count !== null && (
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 text-xs text-white rounded-full ${
                    tab.color || "bg-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>

            {/* Línea divisoria SOLO entre Todo, Pendiente y En curso */}
            {tab.label === "Todo" && <div className="w-px h-6 bg-gray-300 mx-1"></div>}
            {tab.label === "En curso" && (
              <>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                
                {/* Botón azul Mapa de entregas */}
                <button className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[14px] font-semibold">Mapa de entregas</span>
                </button>
              </>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Total */}
      <div className="text-sm text-gray-600">
        Total: <span className="font-semibold">MXN 0.00</span>
      </div>
    </div>
  );
};

export default StatusTabs;
