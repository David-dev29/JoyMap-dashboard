import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import PaymentFormView from './PaymentFormView';
import PaymentSummaryView from './PaymentSummaryView';
import { ENDPOINTS } from '../../config/api';

const PaymentSidebar = ({ isOpen, onClose, order, onUpdate }) => {
  const [view, setView] = useState('form');

  // useMemo sigue siendo la mejor forma de manejar los pagos derivados.
  const registeredPayments = useMemo(() => {
    return order?.payments?.map(p => ({
      ...p,
      amount: Number(p.amount) || 0,
      timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
    })) || [];
  }, [order?.payments]);

  // ✨ LA SOLUCIÓN DEFINITIVA: El useEffect es 100% reactivo a la orden.
  // Siempre sincronizará la vista con el estado actual de la orden que reciba.
  useEffect(() => {
    if (isOpen && order) {
      // Decide qué vista mostrar basándose en si ya existen pagos.
      // Funciona al abrir por primera vez, al re-abrir y después de registrar un pago.
      if (registeredPayments.length > 0) {
        setView('summary');
      } else {
        setView('form');
      }
    }
  }, [isOpen, order]); // Se ejecuta al abrir y cada vez que el objeto 'order' cambia.


  const handleFinalizeOrder = async (currentOrder = order) => {
    try {
      const response = await fetch(ENDPOINTS.orders.update(currentOrder._id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'delivered' }),
      });
      if (!response.ok) throw new Error('Error al finalizar el pedido');
      
      const finalOrderData = await response.json();
      onUpdate(finalOrderData.response);
      onClose();
    } catch (error) {
      // Error finalizing order
    }
  };

  const handleRegisterPayment = async (paymentData, finalize = false) => {
    try {
      const response = await fetch(ENDPOINTS.orders.registerPayment(order._id), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) throw new Error('Error al registrar el pago');
      
      const updatedOrderData = await response.json();

      // ✨ LÓGICA SIMPLIFICADA: Solo notifica al padre.
      // El useEffect de arriba se encargará de actualizar la vista automáticamente cuando reciba la nueva 'order'.
      onUpdate(updatedOrderData.response);

      if (finalize) {
        await handleFinalizeOrder(updatedOrderData.response);
      }
      // Ya no necesitamos setView('summary') aquí. El useEffect es el único jefe.
    } catch (error) {
      // Error registering payment
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-30 z-20" onClick={onClose} />
      <div className="fixed top-12 bottom-0 right-0 w-96 bg-gray-100 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center p-4 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="mr-4 p-1 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-700" />
          </button>
          <h2 className="text-lg font-medium text-gray-900">Registrar pago</h2>
        </div>

        {view === 'form' ? (
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
            onAddAnotherPayment={() => setView('form')}
          />
        )}
      </div>
    </>
  );
};

export default PaymentSidebar;