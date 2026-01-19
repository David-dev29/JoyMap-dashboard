// OrderToastContent.js
import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

// ✨ CAMBIO: Aceptamos la prop 'onClick'
const OrderToastContent = ({ order, onClick }) => {
  const orderNumber = order._id?.slice(-4) || "0000";
  const customerName = order.customerId?.name || "Cliente";
  const orderDate = new Date(order.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCancelled = order.status === 'cancelled';

  return (
    // ✨ CAMBIO: Asignamos el evento onClick y la clase cursor-pointer
    <div className="flex flex-col w-full cursor-pointer" onClick={onClick}>
      <div className="flex items-center gap-2 mb-1">
        <Star className="w-5 h-5 text-orange-500" />
        <span className="font-semibold text-gray-800 text-sm">
          Nuevo pedido - #{orderNumber}
        </span>
      </div>

      <div className="flex justify-between items-center mb-2 w-full">
        <span className="text-gray-700 font-medium text-sm">{customerName}</span>
        <span className="text-xs text-gray-400">
          {`${new Date(order.createdAt).toLocaleDateString([], {
            weekday: "short", day: "numeric", month: "short",
          })} ${orderDate}`}
        </span>
      </div>

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          {isCancelled ? (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
              Anulado
            </span>
          ) : (
            <motion.span
              className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium"
              animate={{ x: [0, -1.5, 1.5, -1.5, 1.5, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            >
              Pendiente
            </motion.span>
          )}

          <span className="text-xs bg-orange-400 text-white px-2 py-0.5 rounded-full font-medium">
            No pagado
          </span>
        </div>
        <span className="text-xs bg-white border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full font-medium">
          WEB
        </span>
      </div>
    </div>
  );
};

export default OrderToastContent;