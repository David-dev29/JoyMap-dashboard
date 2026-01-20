import React, { useState, useEffect } from "react";
import ServiceTypeTabs from "./ServiceTypeTabs";
import ActionButtons from "./ActionButtons";
import StatusTabs from "./StatusTabs";
import OrdersHeader from "./OrdersHeader";
import DeliveryCard from "./DeliveryCard";
import DeliverySidebarModal from "./DeliverySidebarModal";
import DeleteOrderModal from "./DeleteOrderModal";
import CancelOrderModal from "./CancelOrderModal";
import NoBusinessSelected from "../../Components/Dashboard/NoBusinessSelected";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import notificationSoundFile from "../../assets/notifications.mp3";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderToastContent from "./OrderToastContent";
import SearchSidebarModal from "./SearchSidebarModal";
import { ENDPOINTS, SOCKET_URL, SOCKET_CONFIG } from "../../config/api";
import { getMyOrders, getBusinessOrders } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useBusiness } from "../../context/BusinessContext";
import { ShoppingCart } from "lucide-react";


const OrdersDashboard = () => {
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();

  const [activeTab, setActiveTab] = useState("todo");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canPlaySound, setCanPlaySound] = useState(false);

  // Determinar si es admin
  const isAdmin = user?.role === 'admin';

  // Modal de eliminar
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Modal de rechazar
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);

  // Función para actualizar pedido
  const handleUpdate = (updatedOrder) => {
    if (!updatedOrder?._id) return;
  
    setOrders((prev) => {
      // ✨ LÓGICA MEJORADA
      // Si el pedido fue entregado o cancelado, lo eliminamos de la lista.
      if (updatedOrder.status === 'delivered' || updatedOrder.status === 'cancelled') {
        return prev.filter(o => o._id !== updatedOrder._id);
      } else {
        // Si no, simplemente actualizamos sus datos.
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      }
    });
  
    // Si el pedido que se está viendo en el sidebar es el que se actualizó, lo actualizamos también
    if (selectedOrder?._id === updatedOrder._id) {
      // Si se completó, cerramos el sidebar. Si no, solo actualizamos los datos.
      if (updatedOrder.status === 'delivered' || updatedOrder.status === 'cancelled') {
          setIsSidebarOpen(false);
          setSelectedOrder(null);
      } else {
          setSelectedOrder(updatedOrder);
      }
    }
  };

  // Abrir modal de eliminar desde DeliveryCard
  const handleOpenDeleteModal = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  // Abrir modal de rechazar desde DeliveryCard
  const handleOpenCancelModal = (order) => {
    setOrderToReject(order);
    setIsCancelModalOpen(true);
  };
  

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await fetch(ENDPOINTS.orders.byId(orderToDelete._id), {
        method: "DELETE",
      });
      setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
      toast.success("Pedido eliminado correctamente", {
        autoClose: 3000,
      });
    } catch (err) {
      toast.error("Error al eliminar pedido", {
        autoClose: 4000,
      });
    }
  };

  // ✨ CAMBIO: Lógica de actualización completa y consistente
  const handleConfirmCancel = async (reason) => {
    if (!orderToReject) return;
    try {
      // 1. Llama a la API para actualizar en la BD (esto no cambia)
      await fetch(ENDPOINTS.orders.cancel(orderToReject._id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
      });
  
      const updatedOrder = { ...orderToReject, status: "cancelled", cancelReason: reason };
  
      // 2. Actualiza el toast (esto no cambia)
      toast.update(orderToReject._id, {
        render: <OrderToastContent order={updatedOrder} onClick={() => handleToastClick(updatedOrder)} />,
        className: "bg-white rounded-lg shadow-md border-l-4 border-red-500 p-3 w-[448px]",
        autoClose: 5000,
      });
  
      // ✨ SOLUCIÓN: Usamos .filter() para quitar el pedido del estado local
      setOrders((prev) => prev.filter((order) => order._id !== orderToReject._id));
      
      // 3. Cierra el modal (esto no cambia)
      setIsCancelModalOpen(false);
      setOrderToReject(null);

    } catch (err) {
      toast.error("Error al rechazar pedido", { autoClose: 4000 });
    }
};
  
  useEffect(() => {
    if ("Notification" in window) Notification.requestPermission();
  }, []);

  useEffect(() => {
    const enableSound = () => setCanPlaySound(true);
    window.addEventListener("click", enableSound);
    window.addEventListener("keydown", enableSound);
    return () => {
      window.removeEventListener("click", enableSound);
      window.removeEventListener("keydown", enableSound);
    };
  }, []);

  // Traer pedidos y configurar socket
  useEffect(() => {
    const fetchOrders = async () => {
      // Si es admin y no hay negocio seleccionado, no cargar
      if (isAdmin && !selectedBusiness) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let data;

        if (isAdmin && selectedBusiness) {
          // Admin: cargar ordenes del negocio seleccionado
          data = await getBusinessOrders(selectedBusiness._id);
        } else {
          // Business owner: cargar sus ordenes
          data = await getMyOrders();
        }

        setOrders(data.orders || []);
      } catch (err) {
        // Error fetching orders
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (!businessLoading) {
      fetchOrders();
    }

    const socket = io(SOCKET_URL, SOCKET_CONFIG.options);

    const notificationSound = new Audio(notificationSoundFile);
    notificationSound.preload = "auto";
    notificationSound.volume = 0.5;

    socket.on("order:new", (newOrder) => {
      // Filtrar por negocio seleccionado
      if (selectedBusiness && newOrder.businessId !== selectedBusiness._id) {
        return;
      }
      setOrders((prev) => [newOrder, ...prev]);
      handleToast(newOrder);
      if (canPlaySound) playNotificationSound(notificationSound);
    });

    socket.on("order:update", (updatedOrder) => {
      // Filtrar por negocio seleccionado
      if (selectedBusiness && updatedOrder.businessId !== selectedBusiness._id) {
        return;
      }
      handleUpdate(updatedOrder);
    });

    return () => socket.disconnect();
  }, [canPlaySound, selectedBusiness, isAdmin, businessLoading]);

  // Sonido de notificación
  const playNotificationSound = (audio) => {
    let playCount = 0;
    const maxPlays = 5;
    const playAudio = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    audio.onended = () => {
      playCount++;
      if (playCount < maxPlays) playAudio();
    };
    playAudio();
  };


   // ✨ CAMBIO 1: Añadimos el cierre manual del toast aquí
   const handleToastClick = (order) => {
    setSelectedOrder(order);
    setIsSidebarOpen(true);
    // Le decimos que cierre este toast específico ahora que hemos terminado
    toast.dismiss(order._id); 
};

// 1. Crea la función que se ejecutará cuando se seleccione un resultado
const handleSearchSelect = (order) => {
  // Por ejemplo, abre el sidebar de detalles con el pedido encontrado
  setSelectedOrder(order);
  setIsSidebarOpen(true);
};


  // Toast de nuevo pedido
// ✨ CAMBIO: `handleToast` ahora pasa la prop `onClick` y define su propio `className`
const handleToast = (newOrder) => {
  if (Notification.permission === "granted") { /* ... */ }

  toast(
    <OrderToastContent order={newOrder} onClick={() => handleToastClick(newOrder)} />,
    {
      toastId: newOrder._id,
      autoClose: false,
      // ✨ Estilo definido aquí para asegurar consistencia en la creación
      className: "bg-white rounded-lg shadow-md border-l-4 border-orange-500 p-3 w-[448px]",
    }
  );
};





  // Tabs de estado
  const statusMap = {
    todo: () => true,
    pendiente: (order) => order.status === "pending",
    "en-curso": (order) => order.status === "preparing",
  };
  const filteredOrders = orders.filter(statusMap[activeTab] || (() => true));

  const tabs = [
    { id: "todo", label: "Todo", count: orders.length, active: activeTab === "todo" },
    {
      id: "pendiente",
      label: "Pendiente",
      count: orders.filter((o) => o.status === "pending").length,
      color: "bg-orange-500",
      active: activeTab === "pendiente",
    },
    {
      id: "en-curso",
      label: "En curso",
      count: orders.filter((o) => o.status === "preparing").length,
      color: "bg-green-500",
      active: activeTab === "en-curso",
    },
  ];

  const serviceTypes = [
    {
      id: "domicilio",
      label: "A domicilio",
      count: orders.filter((o) => (o.deliveryMethod || "domicilio") === "domicilio").length,
    },
  ];

  // Mostrar mensaje si admin no ha seleccionado negocio
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <NoBusinessSelected
          title="Selecciona un negocio"
          message="Para ver los pedidos, primero selecciona un negocio desde el selector en la barra superior."
          icon={ShoppingCart}
        />
      </div>
    );
  }

  // Mostrar loading mientras se cargan los datos
  if (loading || businessLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-500">Cargando pedidos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
       <ToastContainer
        position="top-right"
        autoClose={false}
        closeOnClick={false}
        pauseOnHover
        draggable
        bodyClassName="p-0 m-0"
      />

      {/* Header con nombre del negocio */}
      {selectedBusiness && (
        <div className="mx-4 mt-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-3 text-white shadow-lg">
            <h2 className="text-lg font-bold">{selectedBusiness.name}</h2>
            <p className="text-orange-100 text-sm">
              {orders.length} pedidos activos
            </p>
          </div>
        </div>
      )}

      <div className="mx-4 bg-gray-50 py-4 flex items-center justify-between">
        <ServiceTypeTabs serviceTypes={serviceTypes} />
        <ActionButtons onSearchClick={() => setIsSearchOpen(true)} />
      </div>

      <div className="mx-4 bg-gray-50 border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-1">
          <StatusTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <OrdersHeader />

        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <DeliveryCard
  key={order._id}
  order={order}
  onUpdate={handleUpdate} // <-- Pasa solo 'onUpdate'
  onClick={() => {
    setSelectedOrder(order);
    setIsSidebarOpen(true);
  }}
  onDeleteClick={() => handleOpenDeleteModal(order)}
  onRejectClick={(order) => handleOpenCancelModal(order)}
/>

          ))
        ) : (
          <div className="p-6 text-center text-gray-500">No hay pedidos disponibles</div>
        )}
      </div>

      {/* Modal de eliminar */}
      <DeleteOrderModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal de cancelar */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        order={orderToReject}
      />

      {isSidebarOpen && selectedOrder && (
        <DeliverySidebarModal
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          order={selectedOrder}
          onUpdate={handleUpdate}
        />
      )}

<SearchSidebarModal 
      isOpen={isSearchOpen}
      onClose={() => setIsSearchOpen(false)}
      orders={orders} // Le pasas la lista completa de pedidos
      onOrderSelect={handleSearchSelect} // Le pasas la función para manejar el clic
    />
  </div>

    
  );
};

export default OrdersDashboard;
