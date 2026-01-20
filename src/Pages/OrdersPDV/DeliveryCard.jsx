import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Check, DollarSign, X, MoreVertical,
  ChevronRight, Clock12, Calendar, Trash2, Slash
} from "lucide-react";

import WhatsAppDropdown from "./WhatsAppDropdown";
import StatusDropdown from "./StatusDropdown";
import PaymentSidebar from "./PaymentSidebar";
import { ENDPOINTS } from "../../config/api";


// ✨ Lógica de estados centralizada para un código más limpio y robusto
const statusConfig = {
  pending: {
    displayName: 'Pendiente',
    border: 'bg-orange-500',
    text: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-800'
  },
  accepted: { // Añadido para robustez
    displayName: 'Aceptado',
    border: 'bg-blue-500',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-800'
  },
  preparing: {
    displayName: 'En preparación',
    border: 'bg-green-500',
    text: 'text-green-600',
    badge: 'bg-green-100 text-green-800'
  },
  // Por defecto, para cualquier otro estado no definido
  default: {
    displayName: 'Desconocido',
    border: 'bg-gray-400',
    text: 'text-gray-600',
    badge: 'bg-gray-100 text-gray-800'
  }
};

const DeliveryCard = ({ order, onUpdate, onDeleteClick, onClick, onRejectClick }) => {
  const [currentOrder, setCurrentOrder] = useState(order)
  const [loading, setLoading] = useState(false);
  const [timerDisplay, setTimerDisplay] = useState("00 sec");
  const [timerColorClass, setTimerColorClass] = useState("text-orange-500");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef(null);

// ✨ PASO 2: Sincroniza el estado si el prop 'order' cambia desde el padre
useEffect(() => {
  setCurrentOrder(order);
}, [order]);


  // Efecto para la animación de la badge
  useEffect(() => {
    if (currentOrder.status === "pending") {
      const orderTimestamp = new Date(currentOrder.createdAt).getTime();
      const ageInMs = Date.now() - orderTimestamp;
      if (ageInMs < 60000) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 60000 - ageInMs);
        return () => clearTimeout(timer);
      }
    }
  }, [currentOrder.createdAt, currentOrder.status]);

  // Efecto para el temporizador
  useEffect(() => {
    if (currentOrder.status !== "pending" && currentOrder.status !== "preparing") {
      setTimerDisplay("00 sec");
      return;
    }
    const startTime = new Date(currentOrder.status === "pending" ? currentOrder.createdAt : currentOrder.updatedAt).getTime();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const baseColor = currentOrder.status === "pending" ? "text-orange-500" : "text-green-500";
      setTimerColorClass(elapsedSeconds >= 300 ? "text-red-500" : baseColor);

      if (elapsedSeconds < 60) {
        setTimerDisplay(`${String(elapsedSeconds).padStart(2, "0")} sec`);
      } else {
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        if (minutes >= 60) {
          clearInterval(interval);
          setTimerDisplay("60:00 min");
        } else {
          setTimerDisplay(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} min`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentOrder.status, currentOrder.createdAt, currentOrder.updatedAt]);
  
  // Efecto para cerrar menú al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

   // ✨ 2. Esta es AHORA la única función de actualización.
 const handlePaymentUpdate = (updatedOrder) => {
  setCurrentOrder(updatedOrder);
  onUpdate?.(updatedOrder); // Usa la prop 'onUpdate'
};

const handleAccept = async (e) => {
  e.stopPropagation();
  setLoading(true);
  try {
    const res = await fetch(ENDPOINTS.orders.update(currentOrder._id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "preparing" }),
    });
    const data = await res.json();
    // ✨ SOLUCIÓN: Pasa la respuesta de la API al padre
    onUpdate?.(data.response);
  } catch (err) {
    // Error accepting order
  } finally {
    setLoading(false);
  }
};
 
const handleStatusChange = async (newStatus) => {
  try {
    const res = await fetch(ENDPOINTS.orders.update(currentOrder._id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    // ✨ SOLUCIÓN: Pasa la respuesta de la API al padre
    onUpdate?.(data.response);
  } catch (err) {
    // Error changing status
  }
};

  // ✨ CORRECCIÓN CRÍTICA: El botón "Cancelar" del menú ahora delega al padre
  const handleCancelFromMenu = () => {
    setIsMenuOpen(false);
    onRejectClick?.(currentOrder); // Reutiliza la misma lógica que el botón "Rechazar"
  };

// ✨ NUEVA LÓGICA PARA EL BOTÓN "FINALIZAR"
const handleFinalizeClick = (e) => {
  e.stopPropagation(); // Previene que se abra el sidebar de detalles

  const isOrderPaid = currentOrder.paymentStatus === 'paid';

  // Si la orden YA ESTÁ PAGADA, la finaliza directamente.
  if (isOrderPaid) {
    handleStatusChange('delivered');
    return; // Termina la ejecución aquí.
  }

  // Si la orden NO ESTÁ PAGADA, simplemente abre el panel de pagos.
  // El panel se encargará del resto.
  setIsPaymentOpen(true);
};




  const togglePaymentSidebar = (e) => {
    e.stopPropagation();
    setIsPaymentOpen((prev) => !prev);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };


  



  // --- Variables de Renderizado ---
  const currentStyle = statusConfig[currentOrder.status] || statusConfig.default;
  const deliveryMethodText = currentOrder.deliveryMethod === "domicilio" ? "A domicilio" : "Mostrador";
  const customerName = currentOrder.customerId?.name || `Cliente ${currentOrder.customerId?._id?.slice(-4)}`;
  const customerPhone = currentOrder.customerId?.phone || "N/A";
  const isPaid = currentOrder.paymentStatus === "paid";

  return (
    <>
      <div
        className="bg-white border-b border-gray-300 px-4 py-2 flex items-center justify-between w-full text-sm min-h-[100px] relative cursor-pointer"
        onClick={onClick}
      >
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-20 w-[2.5px] ${currentStyle.border}`} />

        <div className="flex gap-x-6 flex-1">
          {/* Sección 1: Info Pedido */}
          <div className="flex flex-col gap-3 w-[140px]">
            <div className="flex items-center gap-1 flex-wrap">
              <span className={`font-semibold text-[16px] ${currentStyle.text}`}>#{currentOrder.orderNumber}</span>
              <span>{currentOrder.deliveryMethod === "domicilio" ? "🏠" : "🛵"}</span>
              <span className={`font-semibold text-[15px] ${currentStyle.text}`}>{deliveryMethodText}</span>
            </div>
            <span className={`flex items-center gap-1 font-semibold text-sm ${timerColorClass}`}>
              <Clock12 className="w-4 h-4" /> {timerDisplay}
            </span>
            <span className="flex items-center gap-1 text-gray-800 font-sans text-[12px]">
              <Calendar className="w-4 h-4 text-gray-800" /> {new Date(currentOrder.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Sección 2: Estado */}
          <div className="flex flex-col gap-2 w-[140px]">
            <motion.span
              className={`px-3 text-[13px] font-semibold rounded-full ${currentStyle.badge} flex-shrink-0 w-max`}
              animate={isAnimating ? { x: [0, -1.5, 1.5, -1.5, 1.5, 0] } : {}}
              transition={isAnimating ? { duration: 0.8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" } : {}}
            >
              {/* ✨ CORRECCIÓN: El texto ahora es dinámico y correcto para todos los estados */}
              {currentStyle.displayName}
            </motion.span>
            <div className="flex items-center gap-1 text-[11px] font-medium overflow-hidden">
              <span className="inline-flex px-2 py-0.5 text-gray-900 bg-white border border-gray-300 rounded-full">WEB</span>
              <span className="truncate text-gray-600 max-w-[50px]">{currentOrder._id}</span>
            </div>
          </div>

          {/* Sección 3: Pago */}
          <div className="flex flex-col gap-2 w-[150px]">
            <span className="text-base font-bold text-gray-900">
              MXN {currentOrder.subtotal}
            </span>
            <span className={`w-max px-3 py-0.5 text-[12px] rounded-full font-medium ${isPaid ? "bg-green-500 text-white" : "bg-orange-400 text-white"}`}>
              {isPaid ? "Pagado" : "No pagado"}
            </span>
            <span className="w-max px-3 py-1 font-semibold text-gray-900 text-[14px] rounded-full border border-dashed border-gray-400">
              💵 {currentOrder.paymentMethod === "cash" ? "Efectivo" : "Tarjeta"} {currentOrder.total}...
            </span>
          </div>

          {/* Sección 4: Cliente */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-2 text-[14px] flex-wrap">
              <span className="text-gray-900 font-semibold truncate">{customerName}</span>
              <WhatsAppDropdown customerPhone={customerPhone} />
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-orange-500" />
              <div className="text-gray-800 text-[13px] truncate">
                {currentOrder.deliveryAddress?.street}
                {currentOrder.deliveryAddress?.reference && ` - ${currentOrder.deliveryAddress.reference}`}
              </div>
            </div>
            <div className="inline-flex items-center font-semibold justify-between w-max px-1 py-0.5 mt-1 border border-blue-500 text-blue-600 text-[13px] rounded-lg cursor-pointer hover:bg-blue-50">
              <span>🛵 Elige un repartidor</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex h-full items-center gap-2 flex-shrink-0 relative">
          {currentOrder.status === "pending" ? (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onRejectClick?.(currentOrder); }}
                className="flex flex-col items-center px-4 py-1.5 border border-red-600 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50"
              >
                <X className="w-5 h-5" /> Rechazar
              </button>
              <button
                onClick={togglePaymentSidebar}
                className="flex flex-col items-center px-6 py-1.5 border border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-50"
              >
                <DollarSign className="w-5 h-5" /> Pago
              </button>
              <button
                onClick={handleAccept}
                disabled={loading}
                className={`flex flex-col items-center px-4 py-1.5 rounded-lg text-sm font-bold ${loading ? "bg-gray-400 cursor-not-allowed text-white" : "bg-green-500 text-white hover:bg-green-600"}`}
              >
                <Check className="w-5 h-5" /> {loading ? "..." : "Aceptar"}
              </button>
            </>
          ) : (
            <>
              <StatusDropdown currentStatus={currentOrder.status} onChange={handleStatusChange} />
              <button
                onClick={togglePaymentSidebar}
                className="flex flex-col items-center px-6 py-1.5 border border-orange-600 text-orange-600 rounded-lg text-sm font-bold hover:bg-blue-50"
              >
                 <DollarSign className="w-5 h-5" /> Pago
              </button>
             {/* ✨ MODIFICACIÓN DEL BOTÓN FINALIZAR */}
             <button
                onClick={handleFinalizeClick} // <-- Usa el nuevo handler
                className="flex flex-col items-center px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
              >
                <Check className="w-5 h-5" /> Finalizar
              </button>
              {/* Dropdown de Opciones */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={toggleMenu}
                  className="p-2 px-0.5 py-3.5 hover:bg-gray-100 rounded-lg border border-gray-400"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    <button
                      onClick={handleCancelFromMenu}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 w-full hover:bg-gray-100 rounded-md"
                    >
                      <Slash className="w-4 h-4" /> Cancelar
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDeleteClick?.(currentOrder); }}
                      className="flex items-center gap-2 px-3 py-2 text-red-600 w-full hover:bg-gray-100 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
     
      
{isPaymentOpen && (
  <PaymentSidebar 
    isOpen={isPaymentOpen} 
    onClose={() => setIsPaymentOpen(false)} 
    order={currentOrder} // <-- Usa el estado local
    onUpdate={handlePaymentUpdate} // <-- Pasa la nueva función
  />
)}
    </>
  );
};

export default DeliveryCard;