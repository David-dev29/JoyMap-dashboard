import React, { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import KitchenTabs from './KitchenTabs';
import KitchenActions from './KitchenActions';
import KitchenSubtitle from './KitchenSubtitle';
import KitchenGrid from './KitchenGrid';
import KitchenConfigModal from './KitchenConfigModal';
import ConfirmModal from './ConfirmModal';
import { ENDPOINTS, SOCKET_URL } from '../../config/api';

const socket = io(SOCKET_URL);

const KitchenMain = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [kitchens, setKitchens] = useState([]);
  const [orders, setOrders] = useState([]);

  const handleOrderComplete = async (orderId) => {
    // Remover de la lista local
    setOrders(prev => (prev || []).filter(o => o._id !== orderId));
  };
  // ------------------- SOCKET: Actualizaciones en tiempo real -------------------
  useEffect(() => {
    const handleOrderUpdate = (updatedOrder) => {
      setOrders(prev => {
        const index = prev.findIndex(o => o._id === updatedOrder._id);
        if (index !== -1) {
          const newOrders = [...prev];
          newOrders[index] = updatedOrder;
          return newOrders;
        } else {
          return [...prev, updatedOrder];
        }
      });
    };
    socket.on("order:update", handleOrderUpdate);
    return () => socket.off("order:update", handleOrderUpdate);
  }, []);

  // ------------------- FETCH: Cocinas -------------------
  useEffect(() => {
    const storeId = "68bf9b9665affa1a7e26510f";
    fetch(ENDPOINTS.kitchens.byStore(storeId))
      .then(res => res.json())
      .then(data => {
        setKitchens(data);
        if (data.length > 0 && !activeTab) setActiveTab(data[0]._id);
      })
      .catch(() => {});
  }, []);

  // ------------------- FETCH: Pedidos activos -------------------
  useEffect(() => {
    fetch(ENDPOINTS.orders.active)
      .then(res => res.json())
      .then(data => {
        // Handle different response formats and ensure we always have an array
        const ordersList = data.orders || data.data || data || [];
        setOrders(Array.isArray(ordersList) ? ordersList : []);
      })
      .catch(() => setOrders([]));
  }, []);

  // ------------------- FUNC: Marcar item como preparado -------------------
  const handleItemPrepared = async (orderId, itemId) => {
    try {
      await fetch(`${ENDPOINTS.orders.byId(orderId)}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "prepared" })
      });
      // Backend emite 'order:update', no actualizar local
    } catch (err) {
      // Error marking item as prepared
    }
  };

  
 // ------------------- Filtrar órdenes para la cocina activa -------------------
 const kitchenColors = [
  'linear-gradient(90deg, #EF4444, #B91C1C)', // rojo fuerte, degradado de arriba a abajo
  'linear-gradient(90deg, #F97316, #C2410C)', // azul profesional
  'linear-gradient(90deg, #3B82F6, #1E40AF)', // azul profesional
  'linear-gradient(90deg, #FBBF24, #B45309)', // amarillo dorado
  'linear-gradient(90deg, #8B5CF6, #5B21B6)', // morado premium
];


const kitchenOrders = (orders || [])
  .filter(order => order && order.status === "preparing")
  .map(order => {
    const items = order.items || [];
    const kitchenItems = items.filter(
      it => it.productId?.kitchenId?._id === activeTab && it.status !== "prepared"
    );

    if (kitchenItems.length === 0) return null;

    const kitchenId = kitchenItems[0].productId?.kitchenId?._id;

    // Buscar la posición de la cocina en el array kitchens
    const kitchenIndex = kitchens.findIndex(k => k._id === kitchenId);
    const kitchenColor = kitchenColors[kitchenIndex % kitchenColors.length];

    return { ...order, items: kitchenItems, kitchenId, kitchenColor };
  })
  .filter(Boolean);




  // ------------------- FUNC: Marcar todos los items de la cocina actual -------------------
  const handleMarkAll = () => setShowConfirmModal(true);
  const confirmMarkAll = () => {
    socket.emit("markKitchenPrepared", { kitchenId: activeTab });
    setShowConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex justify-between p-4">
        <KitchenTabs
          tabs={kitchens.map(k => ({
            id: k._id,
            label: k.name,
            count: (orders || [])
              .filter(o => o && o.status === "preparing")
              .reduce(
                (acc, o) =>
                  acc + (o.items || []).filter(
                    it => it.productId?.kitchenId?._id === k._id && it.status !== "prepared"
                  ).length,
                0
              ),
          }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <KitchenActions
          onOpenConfig={() => setShowConfigModal(true)}
          onMarkAll={handleMarkAll}
        />
      </div>

      {/* Subtitulo */}
      <KitchenSubtitle text='Aquí es donde los productos "En preparación" entran a la cocina.' />

      {/* Grid de items por cocina */}
      <div className="p-6">
      <KitchenGrid
  items={kitchenOrders.map(order => ({
    ...order,
    kitchenColor: order.kitchenColor,
    kitchenId: order.kitchenId,
  }))}
  onItemPrepared={handleItemPrepared}
  onOrderComplete={handleOrderComplete}
/>

      </div>

      {/* Modales */}
      {showConfigModal && (
        <KitchenConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      )}
      {showConfirmModal && (
        <ConfirmModal
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmMarkAll}
        />
      )}
    </div>
  );
};

export default KitchenMain;
