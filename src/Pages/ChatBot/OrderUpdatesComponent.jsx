import React from "react";

export default function OrderUpdatesComponent({
  orderStatuses,
  activeTemplate,
  setActiveTemplate,
  toggleOrderStatus,
}) {
  return (
    <div className="p-4 border-b border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Envía actualizaciones automáticas del pedido
      </h2>
      <div className="space-y-1">
        {Object.entries(orderStatuses).map(([statusId, status]) => (
          <div
            key={statusId}
            className={`p-3 cursor-pointer rounded-lg transition-all duration-200 ${
              activeTemplate === statusId
                ? "bg-blue-50 border-l-4 border-l-blue-500"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setActiveTemplate(statusId)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <span className="text-lg">{status.icon}</span>
                <div className="flex-1">
                  <h3
                    className={`font-medium text-sm ${
                      activeTemplate === statusId ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {status.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {status.message}
                  </p>
                </div>
              </div>
              {/* Toggle */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrderStatus(statusId);
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer ${
                  status.enabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${
                    status.enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
