import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CancelOrderModal({ isOpen, order, onClose, onConfirm }) {
  const [selectedReason, setSelectedReason] = useState("Pedido rechazado");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const reasons = [
    "Pedido rechazado",
    "Cliente no responde",
    "Producto agotado",
    "Error en el pedido",
    "Solicitud del cliente",
    "Problemas de pago",
  ];

  if (!isOpen) return null; // 🔹 No renderiza si el modal está cerrado

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose} // 🔹 Clic en el fondo cierra el modal
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()} // 🔹 Evita que clic en contenido cierre modal
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            Cancelar pedido #{order?.orderNumber || "0000"}
          </h2>

          {/* Motivo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona motivo de anulación
            </label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-3 py-3 text-left bg-white border border-gray-300 rounded-lg flex items-center justify-between"
              >
                <span>{selectedReason}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {reasons.map((reason, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedReason(reason);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-3 py-3 text-left hover:bg-gray-50"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg"
            >
              Atrás
            </button>
            <button
              onClick={() => {
                onConfirm(selectedReason);
                onClose(); // 🔹 Cierra modal después de confirmar
              }}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Cancelar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
