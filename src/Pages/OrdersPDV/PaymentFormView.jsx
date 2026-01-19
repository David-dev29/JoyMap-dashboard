import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';

// --- Componentes de Íconos Personalizados ---
const DivideIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="6" r="1" /><line x1="5" x2="19" y1="12" y2="12" /><circle cx="12" cy="18" r="1" />
  </svg>
);
const PercentIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const PaymentFormView = ({ order, registeredPayments, onRegisterPayment }) => {
  // --- Estados del Formulario ---
  const [paymentMethod, setPaymentMethod] = useState("Efectivo");
  const [amount, setAmount] = useState('0.00');
  const [tip, setTip] = useState('0.00');
  const [cashReceived, setCashReceived] = useState('0.00');
  const [tipMode, setTipMode] = useState('amount');
  const [isDivideOpen, setIsDivideOpen] = useState(false);
  const divideMenuRef = useRef(null);

  // --- Lógica de Cálculos ---
  const totalToPay = parseFloat(order?.subtotal) || 0;
  const totalPaid = registeredPayments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = totalToPay - totalPaid;

  const currentPaymentAmount = parseFloat(amount) || 0;
  const currentTipAmount = tipMode === 'percent'
    ? (remainingAmount * (parseFloat(tip || 0) / 100))
    : (parseFloat(tip || 0));
  const change = (parseFloat(cashReceived) || 0) - (currentPaymentAmount + currentTipAmount);

  // --- Efectos ---
  useEffect(() => {
    if (remainingAmount > 0) {
      setAmount(remainingAmount.toFixed(2));
      setCashReceived(remainingAmount.toFixed(2));
    } else {
      setAmount('0.00');
      setCashReceived('0.00');
    }
  }, [remainingAmount]);
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (divideMenuRef.current && !divideMenuRef.current.contains(e.target)) {
        setIsDivideOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleDivide = (divisor) => {
    const amountToSet = (remainingAmount / divisor).toFixed(2);
    setAmount(amountToSet);
    setCashReceived(amountToSet);
    setIsDivideOpen(false);
  };

  const handleTipModeToggle = () => {
    setTipMode(prev => prev === 'amount' ? 'percent' : 'amount');
    setTip('0.00');
  };

 // En PaymentFormView.jsx

const handleSubmit = (finalize = false) => {
  onRegisterPayment({
    // ...los otros campos se quedan igual
    amount: currentPaymentAmount,
    tip: currentTipAmount,
    method: paymentMethod,
    
    // ✨ CAMBIO CLAVE: Añade el monto recibido para que el backend lo guarde
    cashReceived: parseFloat(cashReceived) || 0,

  }, finalize);
};


  return (
    <>
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-3">
        {/* Resumen de Pago */}
        <div className="bg-white p-4 rounded-lg shadow-sm text-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium tracking-wider mb-0.5">TOTAL</p>
              <p className="text-xl font-semibold text-gray-900">MXN {totalToPay.toFixed(2)}</p>
            </div>
            <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full text-xs font-semibold">
              Pendiente
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><p className="text-xs text-blue-500 font-medium">PAGADO</p><p className="font-semibold text-gray-900">MXN {totalPaid.toFixed(2)}</p></div>
            <div><p className="text-xs text-orange-500 font-medium">QUEDA A PAGAR</p><p className="font-semibold text-gray-900">MXN {remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00'}</p></div>
          </div>
        </div>

        {/* Formulario de Pago Completo */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 text-sm">
          <div>
            <label className="block text-gray-500 mb-1 text-xs">Método de pago</label>
            <div className="relative">
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg appearance-none text-gray-800 font-medium text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option>Efectivo</option>
                <option>Tarjeta</option>
                <option>Transferencia</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-gray-500 mb-1 text-xs">Pago</label>
              <div className="flex items-center gap-2">
                <div className="relative" ref={divideMenuRef}>
                  <button onClick={() => setIsDivideOpen(p => !p)} className="bg-gray-100 border border-gray-300 rounded-lg p-2.5 flex items-center justify-center h-full gap-1">
                    <DivideIcon className="text-gray-500" />
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>
                  {isDivideOpen && (
                    <div className="absolute top-full mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                        <button key={num} onClick={() => handleDivide(num)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"> {num}</button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 font-medium text-lg text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1 text-xs">Propina</label>
              <div className="flex items-center gap-2">
                <button onClick={handleTipModeToggle} className="bg-gray-100 border border-gray-300 rounded-lg p-2.5 flex items-center justify-center h-full gap-1">
                  {tipMode === 'amount' ? <DollarSign size={16} className="text-gray-500" /> : <PercentIcon className="text-gray-500" />}
                  <ChevronDown size={12} className="text-gray-500" />
                </button>
                <div className="relative w-full">
                  <input type="number" value={tip} onChange={(e) => setTip(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium text-lg text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  {tipMode === 'percent' && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">%</span>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-500 mb-1 text-xs">Monto entregado</label>
            <input type="number" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium text-base text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
            <p className="text-center text-xs text-gray-500 mt-1">Vuelto {change >= 0 ? change.toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Footer Fijo con ambos botones */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200 space-y-3">
        <button 
          onClick={() => handleSubmit(false)} 
          disabled={currentPaymentAmount <= 0 || currentPaymentAmount > remainingAmount + 0.001} 
          className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-base disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
        >
          Registrar pago
        </button>
        <button 
          onClick={() => handleSubmit(true)} 
          disabled={currentPaymentAmount <= 0 || currentPaymentAmount > remainingAmount + 0.001} 
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Registrar y finalizar pedido
        </button>
      </div>
    </>
  );
};

export default PaymentFormView;