import React from 'react';
import { Plus, CheckCircle, MoreVertical } from 'lucide-react';

const PaymentSummaryView = ({
  order,
  registeredPayments,
  onFinalizeOrder,
  onAddAnotherPayment,
}) => {

 // --- LÓGICA FINAL Y ÚNICA ---
 const totalToPay = parseFloat(order?.subtotal) || 0;
 // Confiamos 100% en el estado que nos envía el backend.
 const isFullyPaid = order.paymentStatus === 'paid'; 
 
 // (Opcional) Calculamos el total pagado solo para mostrarlo, no para la lógica.
 const totalPaidForDisplay = registeredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-3">
        {/* Resumen de Pago */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm">
          <div className="flex justify-between items-center mb-2">
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
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              {isFullyPaid ? 'Pagado' : 'Parcial'}
            </span>
          </div>
          {/* ✨ SECCIÓN AÑADIDA: Mostramos el desglose completo */}
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
                MXN {(totalToPay - totalPaidForDisplay).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Pagos */}
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
                    MXN {(p.amount || 0).toFixed(2)}{' '}
                    <CheckCircle size={14} />
                  </p>
                  {p.changeGiven > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Vuelto {p.changeGiven.toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(p.timestamp).toLocaleDateString('es-MX')}{' '}
                    {new Date(p.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
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

      {/* Footer con los botones de acción */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 space-y-3">
        {/* ✨ ESTE BOTÓN AHORA FUNCIONARÁ PERFECTAMENTE */}
        {!isFullyPaid && (
          <button
            onClick={onAddAnotherPayment}
            className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-base flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Añadir otro pago
          </button>
        )}
        <button
  // ✨ SOLUCIÓN: Pasa la 'order' a la función
  onClick={() => onFinalizeOrder(order)} 
  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base"
>
  Finalizar pedido
</button>
      </div>
    </>
  );
};

export default PaymentSummaryView;