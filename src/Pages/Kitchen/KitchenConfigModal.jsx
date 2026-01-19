import React, { useState, useEffect } from 'react';
import { X, Edit3, Plus, MoreVertical, Info } from 'lucide-react';

const KitchenConfigModal = ({ isOpen, onClose }) => {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [keepProducts, setKeepProducts] = useState(false);
  const [kitchens, setKitchens] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKitchenName, setNewKitchenName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);


  // 🔹 Obtener cocinas desde la API
  useEffect(() => {
    if (isOpen) {
      const storeId = "68bf9b9665affa1a7e26510f"; // mismo ID que usas para crear
      fetch(`http://localhost:3000/api/kitchens?storeId=${storeId}`)
        .then(res => res.json())
        .then(data => setKitchens(data))
        .catch(err => console.error("Error cargando cocinas:", err));
    }
  }, [isOpen]);
  

  // 🔹 Crear nueva cocina
  const handleSaveKitchen = async () => {
    if (!newKitchenName.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/api/kitchens/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKitchenName, storeId: "68bf9b9665affa1a7e26510f" }),
      });

      if (!res.ok) {
        console.error("Error al crear cocina");
        return;
      }

      const newKitchen = await res.json();
      setKitchens(prev => [...prev, newKitchen]); // agregar al estado
      setNewKitchenName("");
      setIsAdding(false);
    } catch (error) {
      console.error("Error de red al crear cocina:", error);
    }
  };

  // Eliminar cocina
const handleDeleteKitchen = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/kitchens/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error eliminando cocina");

    setKitchens(prev => prev.filter(k => k._id !== id));
  } catch (err) {
    console.error(err);
  }
};

// Editar cocina
const handleEditKitchen = async (id, newName) => {
  try {
    const res = await fetch(`http://localhost:3000/api/kitchens/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });

    if (!res.ok) throw new Error("Error editando cocina");

    const updated = await res.json();
    setKitchens(prev => prev.map(k => k._id === id ? updated : k));
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className={`fixed inset-0 z-40 top-12 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? 'bg-opacity-30' : 'bg-opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`absolute right-0 top-0 h-full w-1/3 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium text-gray-900">Configurar cocinas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Auto Update Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Actualización automática
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  {autoUpdate ? 'Activado' : 'Desactivado'}
                </span>
                <button
                  onClick={() => setAutoUpdate(!autoUpdate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoUpdate ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoUpdate ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Nueva Cocina */}
          {isAdding ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <label className="text-sm font-medium text-gray-900">
                Nombre de cocina:
              </label>
              <input
                type="text"
                value={newKitchenName}
                onChange={(e) => setNewKitchenName(e.target.value)}
                placeholder="Ej. Parrilla"
                className="w-full border rounded px-2 py-1 text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-gray-500 text-sm hover:text-gray-700"
                >
                  Atrás
                </button>
                <button
                  onClick={handleSaveKitchen}
                  className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-blue-500 text-sm font-medium hover:text-blue-600"
            >
              <Plus className="w-4 h-4" />
              Nueva cocina
            </button>
          )}

          {/* Kitchen List */}
          <div className="space-y-4">
          { kitchens.map(kitchen => (
  <div key={kitchen._id} className="bg-gray-50 rounded-lg p-3 relative">
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-gray-900">Nombre de cocina:</span>
        <span className="text-sm text-gray-700 ml-1">{kitchen.name}</span>
      </div>
      <div className="relative">
        <button
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setMenuOpenId(menuOpenId === kitchen._id ? null : kitchen._id)}
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpenId === kitchen._id && (
          <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
            <button
              className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100"
              onClick={() => {
                const newName = prompt("Nuevo nombre de la cocina:", kitchen.name);
                if (newName) handleEditKitchen(kitchen._id, newName);
                setMenuOpenId(null);
              }}
            >
              Editar
            </button>
            <button
              className="w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
              onClick={() => handleDeleteKitchen(kitchen._id)}
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
))}

            {kitchens.length === 0 && (
              <p className="text-xs text-gray-500">No tienes cocinas registradas.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-700">
              Mantén los productos en la cocina incluso después de completar el pedido
            </span>
            <button
              onClick={() => setKeepProducts(!keepProducts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                keepProducts ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  keepProducts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenConfigModal;
