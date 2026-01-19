import React, { useState, useEffect, useMemo, useRef } from "react";
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
  DollarSign,
  MoreVertical,
  CheckCircle,
  Slash,
} from "lucide-react";

//==============================================================================
// INICIO: Componentes del Sidebar de Pagos (Integrados)
//==============================================================================

const DivideIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="6" r="1" />
    <line x1="5" x2="19" y1="12" y2="12" />
    <circle cx="12" cy="18" r="1" />
  </svg>
);
const PercentIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const PaymentFormView = ({ order, registeredPayments, onRegisterPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [amount, setAmount] = useState("0.00");
  const [tip, setTip] = useState("0.00");
  const [cashReceived, setCashReceived] = useState("0.00");
  const [tipMode, setTipMode] = useState("amount");
  const [isDivideOpen, setIsDivideOpen] = useState(false);
  const divideMenuRef = useRef(null);

  const totalToPay = parseFloat(order?.subtotal) || 0;
  const totalPaid = registeredPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalToPay - totalPaid;

  const currentPaymentAmount = parseFloat(amount) || 0;
  const currentTipAmount =
    tipMode === "percent"
      ? remainingAmount * (parseFloat(tip || 0) / 100)
      : parseFloat(tip || 0);
  const change =
    (parseFloat(cashReceived) || 0) - (currentPaymentAmount + currentTipAmount);

  useEffect(() => {
    if (remainingAmount > 0) {
      setAmount(remainingAmount.toFixed(2));
      setCashReceived(remainingAmount.toFixed(2));
    } else {
      setAmount("0.00");
      setCashReceived("0.00");
    }
  }, [remainingAmount]);

  const handleSubmit = (finalize = false) => {
    onRegisterPayment(
      {
        amount: currentPaymentAmount,
        tip: currentTipAmount,
        method: paymentMethod,
        cashReceived: parseFloat(cashReceived) || 0,
      },
      finalize
    );
  };

  const handleDivide = (divisor) => {
    const amountToSet = (remainingAmount / divisor).toFixed(2);
    setAmount(amountToSet);
    setCashReceived(amountToSet);
    setIsDivideOpen(false);
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-3">
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium tracking-wider mb-0.5">
                TOTAL
              </p>
              <p className="text-xl font-semibold text-gray-900">
                MXN {totalToPay.toFixed(2)}
              </p>
            </div>
            <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold">
              Pendiente
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 border-t pt-3">
            <div>
              <p className="text-xs text-blue-500 font-medium">PAGADO</p>
              <p className="font-semibold text-gray-900">
                MXN {totalPaid.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-orange-500 font-medium">
                QUEDA A PAGAR
              </p>
              <p className="font-semibold text-gray-900">
                MXN {remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 text-sm">
          <div>
            <label className="block text-gray-500 mb-1 text-xs">
              Método de pago
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none text-gray-800 font-medium text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-500 mb-1 text-xs">Pago</label>
              <div className="flex items-center gap-2">
                <div className="relative" ref={divideMenuRef}>
                  <button
                    onClick={() => setIsDivideOpen((p) => !p)}
                    className="bg-gray-100 border border-gray-300 rounded-lg p-2.5 flex items-center justify-center h-full gap-1"
                  >
                    <DivideIcon className="text-gray-500" />
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>
                  {isDivideOpen && (
                    <div className="absolute bottom-full mb-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                        <button
                          key={num}
                          onClick={() => handleDivide(num)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Dividir entre {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 font-medium text-lg text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-500 mb-1 text-xs">
                Propina
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setTipMode((p) => (p === "amount" ? "percent" : "amount"))
                  }
                  className="bg-gray-100 border border-gray-300 rounded-lg p-2.5 flex items-center justify-center h-full gap-1"
                >
                  {tipMode === "amount" ? (
                    <DollarSign size={16} className="text-gray-500" />
                  ) : (
                    <PercentIcon className="text-gray-500" />
                  )}
                  <ChevronDown size={12} className="text-gray-500" />
                </button>
                <div className="relative w-full">
                  <input
                    type="number"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium text-lg text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {tipMode === "percent" && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-gray-500 mb-1 text-xs">
              Monto entregado
            </label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium text-base text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-center text-xs text-gray-500 mt-1">
              Vuelto {change >= 0 ? change.toFixed(2) : "0.00"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 space-y-3">
        <button
          onClick={() => handleSubmit(false)}
          disabled={
            currentPaymentAmount <= 0 ||
            currentPaymentAmount > remainingAmount + 0.001
          }
          className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-base disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          Registrar pago
        </button>
        <button
          onClick={() => handleSubmit(true)}
          disabled={
            currentPaymentAmount <= 0 ||
            currentPaymentAmount > remainingAmount + 0.001
          }
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Registrar y finalizar
        </button>
      </div>
    </>
  );
};

const PaymentSummaryView = ({
  order,
  registeredPayments,
  onFinalizeOrder,
  onAddAnotherPayment,
}) => {
  const totalToPay = parseFloat(order?.subtotal) || 0;
  const isFullyPaid = order.paymentStatus === "paid";
  const totalPaidForDisplay = registeredPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  const remainingAmount = totalToPay - totalPaidForDisplay;

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-3">
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-500 font-medium tracking-wider mb-0.5">
                TOTAL DEL PEDIDO
              </p>
              <p className="text-xl font-semibold text-gray-900">
                MXN {totalToPay.toFixed(2)}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isFullyPaid
                  ? "bg-blue-100 text-blue-600"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {isFullyPaid ? "Pagado" : "Parcial"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 border-t pt-3">
            <div>
              <p className="text-xs text-blue-500 font-medium">TOTAL PAGADO</p>
              <p className="font-semibold text-gray-900">
                MXN {totalPaidForDisplay.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-orange-500 font-medium">
                QUEDA A PAGAR
              </p>
              <p className="font-semibold text-gray-900">
                MXN {remainingAmount > 0 ? remainingAmount.toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 font-medium px-1">
            PAGOS REALIZADOS
          </p>
          {registeredPayments.map((p, index) => (
            <div
              key={index}
              className="bg-white p-3 rounded-lg shadow-sm text-sm relative border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{p.method}</p>
                  <p className="text-blue-600 font-bold flex items-center gap-1.5">
                    MXN {(p.amount || 0).toFixed(2)} <CheckCircle size={14} />
                  </p>
                  {p.changeGiven > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Vuelto {p.changeGiven.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(p.timestamp).toLocaleDateString("es-MX")}{" "}
                    {new Date(p.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 space-y-3">
        {!isFullyPaid && (
          <button
            onClick={onAddAnotherPayment}
            className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Añadir otro pago
          </button>
        )}
        <button
          onClick={() => onFinalizeOrder(order)}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Finalizar pedido
        </button>
      </div>
    </>
  );
};

const PaymentSidebar = ({ isOpen, onClose, order, onUpdate }) => {
  const [view, setView] = useState("form");
  const registeredPayments = useMemo(() => {
    return (
      order?.payments?.map((p) => ({
        ...p,
        timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
      })) || []
    );
  }, [order?.payments]);

  useEffect(() => {
    if (isOpen && order) {
      if (order.paymentStatus !== "paid" && registeredPayments.length === 0) {
        setView("form");
      } else {
        setView("summary");
      }
    }
  }, [isOpen, order]);

  const handleRegisterPayment = async (paymentData, finalize = false) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/${order._id}/register-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );
      if (!response.ok) throw new Error("Error al registrar pago");
      const updatedOrderData = await response.json();
      onUpdate(updatedOrderData.response);
      if (finalize) {
        await handleFinalizeOrder(updatedOrderData.response);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleFinalizeOrder = async (currentOrder = order) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/orders/update/${currentOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "delivered" }),
        }
      );
      if (!response.ok) throw new Error("Error al finalizar");
      const finalOrderData = await response.json();
      onUpdate(finalOrderData.response);
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[20] top-12 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-gray-100 w-1/4 h-full flex flex-col shadow-2xl animate-slide-in-right">
        <style jsx>{`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          .animate-slide-in-right {
            animation: slideInRight 0.3s ease-out;
          }
        `}</style>
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-lg font-medium">Registrar pago</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        {view === "form" ? (
          <PaymentFormView
            order={order}
            registeredPayments={registeredPayments}
            onRegisterPayment={handleRegisterPayment}
          />
        ) : (
          <PaymentSummaryView
            order={order}
            registeredPayments={registeredPayments}
            onFinalizeOrder={handleFinalizeOrder}
            onAddAnotherPayment={() => setView("form")}
          />
        )}
      </div>
    </div>
  );
};

//==============================================================================
// FIN: Componentes del Sidebar de Pagos
//==============================================================================


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
        `http://localhost:3000/api/orders/update/${currentOrder._id}`,
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
      console.error("Error al actualizar la orden:", error);
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
