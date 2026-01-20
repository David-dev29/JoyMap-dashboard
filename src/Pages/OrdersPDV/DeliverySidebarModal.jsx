import React, { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  MapPin,
  User,
  Clock,
  Edit3,
  Package,
  Printer,
  ChevronDown,
  Phone,
  ChevronRight,
  Plus,
} from "lucide-react";
import { ENDPOINTS } from "../../config/api";
import PaymentSidebar from "./PaymentSidebar";

// --- Sub-componente: SidebarHeader ---
const SidebarHeader = ({ order, currentStatus, onClose }) => {
    const deliveryMethod = order.deliveryMethod || "a domicilio";
    return (
      <div className={`text-white px-4 py-2 flex items-center justify-between flex-shrink-0 ${currentStatus.bg}`}>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold text-base gap-1">#{order.orderNumber}
  {deliveryMethod === "domicilio" ? "🛵" : "🛵"}
  </span>
          {/* ✨ CAMBIO: Etiqueta con borde y sin fondo */}
          <span className="border border-white/50 rounded-full px-2 py-0.5 text-xs font-medium flex items-center gap-1">
            {deliveryMethod === "domicilio" ? "A domicilio" : "A domicilio"}
          </span>
          {/* ✨ CAMBIO: Línea divisoria vertical */}
          <span className="h-6 w-px bg-white/50"></span>
          <span className="bg-white/25 rounded px-2 py-0.5 text-xs font-medium">{currentStatus.displayName}</span>
        </div>
        <div className="flex items-center gap-2"><button className="p-1 hover:bg-white/20 rounded-full"><Edit3 className="w-4 h-4" /></button><button className="p-1 hover:bg-white/20 rounded-full" onClick={onClose}><X className="w-5 h-5" /></button></div>
      </div>
    );
  };
  

// --- Sub-componente: MetaInfoBar ---
const MetaInfoBar = ({ order, timerDisplay }) => {
  const [timerColorClass, setTimerColorClass] = useState("text-gray-500");
  useEffect(() => {
    const startTime = new Date(order.createdAt).getTime();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const baseColor =
        order.status === "pending" ? "text-orange-500" : "text-green-500";
      setTimerColorClass(elapsedSeconds >= 600 ? "text-red-500" : baseColor);
    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt, order.status]);
  return (
    <div className="px-4 py-2 bg-gray-50 border-b text-xs text-gray-600 flex justify-between items-center flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="inline-flex px-2 py-0.5 font-semibold text-gray-700 bg-white border border-gray-300 rounded-full">
          WEB
        </span>
        <span>
          📅{" "}
          {new Date(order.createdAt).toLocaleDateString([], {
            day: "2-digit",
            month: "2-digit",
          })}{" "}
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div
        className={`flex items-center gap-1 font-semibold ${timerColorClass}`}
      >
        <Clock size={14} />
        <span>{timerDisplay}</span>
      </div>
    </div>
  );
};

// --- Sub-componente: CustomerInfo ---
const CustomerInfo = ({ order }) => {
  const customerName = order.customerId?.name || `Cliente`;
  const customerPhone = order.customerId?.phone || "N/A";
  return (
    <div className="p-4 space-y-2 bg-white">
      <div className="flex justify-between items-start">
        <input
          type="text"
          placeholder="Añadir título"
          className="text-gray-800 font-medium border-none p-0 focus:ring-0 w-2/3"
        />
        <span className="text-xs text-gray-400">MX-{order._id.slice(-10)}</span>
      </div>
      <div className="flex justify-between items-center text-sm p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-400" />
          <span className="text-gray-600">.</span>
        </div>
        <button>
          <X size={16} className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
      <div className="flex justify-between items-center text-sm p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <User size={18} className="text-gray-400" />
          <div>
            <p className="font-semibold text-gray-900">{customerName}</p>
            <p className="text-gray-500">{customerPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <X size={16} className="text-gray-400 hover:text-red-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <Phone size={16} className="text-green-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronDown size={16} className="text-gray-500" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm p-2 border rounded-lg">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-gray-400" />
          <p className="text-gray-800 truncate">
            {order.deliveryAddress?.street}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronDown size={16} className="text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <MapPin size={16} className="text-green-500" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm p-2 border rounded-lg">
        <button className="flex items-center gap-2 text-blue-600 font-semibold">
          <Package size={18} />
          <span>Elige un repartidor</span>
          <ChevronRight size={16} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <Phone size={16} className="text-green-500" />
        </button>
      </div>
    </div>
  );
};

// --- Sub-componente: ProductList ---
const ProductList = ({ items }) => {
  const [activeTab, setActiveTab] = useState("productos");
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <>
      <div className="flex">
        <button
          onClick={() => setActiveTab("productos")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "productos"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <Plus size={16} /> Productos
        </button>
        <button
          onClick={() => setActiveTab("cocina")}
          className={`flex-1 px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === "cocina"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <Printer size={16} /> Cocina
        </button>
      </div>
      <div className="bg-white p-4 space-y-3">
        <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
          <span>{totalItems}</span>
          <Clock size={14} />
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="border-b pb-3 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-sm">{item.quantity}</span>
                <div className="text-sm">
                  <p className="font-bold text-gray-800 flex items-center">
                    {item.name}{" "}
                    <ChevronDown size={14} className="ml-1 text-gray-400" />
                  </p>
                  <p className="text-gray-500 text-xs">{item.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">
                    {(item.price || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(item.price || 0).toFixed(2)}
                  </p>
                </div>
                <button>
                  <X size={16} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            </div>
            <div className="pl-7 text-xs text-gray-500">1 Jitomate</div>
          </div>
        ))}
      </div>
    </>
  );
};

// --- Sub-componente: TotalsSection ---
const TotalsSection = ({ order }) => {
  const isPaid = order.paymentStatus === "paid";
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const lastPayment =
    order.payments && order.payments.length > 0
      ? order.payments[order.payments.length - 1]
      : null;

  return (
    <div className="bg-white border-t p-4 space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="flex items-center gap-1 text-gray-600">
          Subtotal Productos ({totalItems}) <ChevronDown size={14} />
        </span>
        <span className="text-gray-800">
          {(order.subtotal || 0).toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">Entrega</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-800">
            {(order.deliveryFee || 0).toFixed(2)}
          </span>
          <button>
            <Edit3 size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex gap-2 text-sm pt-2">
        <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-semibold">
          % Descuento
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-semibold">
          + Servicio
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md font-semibold">
          + Embalaje
        </button>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span
          className={`px-3 py-1 rounded-md text-sm font-bold ${
            isPaid
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {isPaid ? "Pagado" : "No pagado"}
        </span>
        <span className="text-2xl font-bold text-gray-900">
          Total MXN {(order.total || 0).toFixed(2)}
        </span>
      </div>

      {lastPayment && (
        <div className="text-xs text-gray-500 border rounded-lg p-2 text-center truncate">
          <span>
            {lastPayment.method}{" "}
            {((lastPayment.amount || 0) + (lastPayment.tip || 0)).toFixed(2)} (
            {(lastPayment.amount || 0).toFixed(2)} + Propina{" "}
            {(lastPayment.tip || 0).toFixed(2)})
            {lastPayment.changeGiven > 0 &&
              ` | Vuelto ${lastPayment.changeGiven.toFixed(2)}`}
          </span>
        </div>
      )}
    </div>
  );
};

// --- Sub-componente: FooterActions ---
const FooterActions = ({
  order,
  onReject,
  onPayment,
  onAccept,
  onFinalize,
}) => (
  <div className="border-t bg-gray-50 p-3 sticky bottom-0 flex-shrink-0">
    <div className="flex gap-2">
      {order.status === "pending" ? (
        <>
          <button
            onClick={onReject}
            className="flex-1 border border-red-500 text-red-500 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            ✕ Rechazar
          </button>
          <button
            onClick={onPayment}
            className="flex-1 border border-blue-600 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            $ Pago
          </button>
          <button
            onClick={onAccept}
            className="flex-1 bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            Aceptar
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onReject}
            className="flex-1 border border-red-500 text-red-500 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            ✕ Cancelar
          </button>
          <button
            onClick={onPayment}
            className="flex-1 border border-blue-600 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            $ Pago
          </button>
          <button
            onClick={onFinalize}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Finalizar
          </button>
        </>
      )}
    </div>
  </div>
);

// --- Componente Principal ---
const DeliverySidebarModal = ({
  isOpen,
  onClose,
  order,
  onUpdate,
  onRejectClick,
}) => {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [timerDisplay, setTimerDisplay] = useState("00:00 min");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  useEffect(() => {
    if (!isOpen || !currentOrder) return;
    const startTime = new Date(currentOrder.createdAt).getTime();
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      setTimerDisplay(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )} min`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentOrder]);

  if (!isOpen || !currentOrder) return null;

  const statusInfo = {
    pending: { displayName: "Pendiente", bg: "bg-orange-500" },
    preparing: { displayName: "En preparación", bg: "bg-green-500" },
    delivered: { displayName: "Entregado", bg: "bg-gray-500" },
    cancelled: { displayName: "Cancelado", bg: "bg-red-500" },
    default: { displayName: currentOrder.status, bg: "bg-gray-400" },
  };
  const currentStatus = statusInfo[currentOrder.status] || statusInfo.default;

  const handleUpdateAndNotify = async (updateBody) => {
    try {
      const res = await fetch(
        ENDPOINTS.orders.update(currentOrder._id),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateBody),
        }
      );
      const data = await res.json();
      if (res.ok) {
        onUpdate(data.response);
      }
    } catch (error) {
      // Error updating order
    }
  };

  const handleAccept = () => handleUpdateAndNotify({ status: "preparing" });
  const handleReject = () => onRejectClick(currentOrder);
  const handlePayment = () => setIsPaymentOpen(true);

  const handlePaymentUpdate = (updatedOrder) => {
    setCurrentOrder(updatedOrder);
    onUpdate(updatedOrder);
  };

  const handleFinalize = () => {
    if (currentOrder.paymentStatus !== "paid") {
      setIsPaymentOpen(true);
    } else {
      handleUpdateAndNotify({ status: "delivered" });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-20 top-12 flex justify-end">
        <div
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={onClose}
        />
        <div className="relative bg-white shadow-2xl flex flex-col w-full max-w-md h-full">
          <SidebarHeader
            order={currentOrder}
            currentStatus={currentStatus}
            onClose={onClose}
          />
          <MetaInfoBar order={currentOrder} timerDisplay={timerDisplay} />
          <div className="flex-1 overflow-y-auto bg-gray-100">
            <CustomerInfo order={currentOrder} />
            <ProductList items={currentOrder.items || []} />
            <TotalsSection order={currentOrder} />
          </div>
          <FooterActions
            order={currentOrder}
            onReject={handleReject}
            onPayment={handlePayment}
            onAccept={handleAccept}
            onFinalize={handleFinalize}
          />
        </div>
      </div>
      {isPaymentOpen && (
        <PaymentSidebar
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          order={currentOrder}
          onUpdate={handlePaymentUpdate}
        />
      )}
    </>
  );
};

export default DeliverySidebarModal;
