import React, { useState, useEffect } from 'react';
import { X, Search, ChevronDown, Clock12, ChevronRight } from 'lucide-react';

// --- Sub-componente para el nuevo diseño de resultados ---
const SearchResultCard = ({ order, onSelect }) => {
  const [timerDisplay, setTimerDisplay] = useState("00:00 min");
  const [timerColorClass, setTimerColorClass] = useState("text-gray-500");

  // Efecto para el temporizador de cada tarjeta
  useEffect(() => {
    // ✨ SOLUCIÓN TIMER: La hora de inicio ahora depende del estado, pero no se reinicia con cada 'updatedAt'.
    // Usamos 'createdAt' como base para 'pending' y el primer 'updatedAt' para los demás estados.
    // Esta lógica es más robusta frente a actualizaciones que no cambian el estado (ej. un pago).
    const getStartTime = () => {
        if (order.status === "pending") {
            return new Date(order.createdAt).getTime();
        }
        // Para otros estados, asumimos que 'updatedAt' refleja cuándo cambió a ese estado.
        // La clave es que la dependencia del useEffect evita que se reinicie innecesariamente.
        return new Date(order.updatedAt).getTime();
    };

    const startTime = getStartTime();
    
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      setTimerDisplay(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} min`);

      const baseColor = order.status === "pending" ? "text-orange-500" : "text-green-500";
      setTimerColorClass(elapsedSeconds >= 300 ? "text-red-500" : baseColor);

    }, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt, order.status]); // Dependemos de 'status' para recalcular, pero no de 'updatedAt'.

  const statusInfo = {
    pending: { displayName: 'Pendiente', bg: 'bg-orange-100', text: 'text-orange-600', border: 'bg-orange-500' },
    preparing: { displayName: 'En preparación', bg: 'bg-green-100', text: 'text-green-600', border: 'bg-green-500' },
    delivered: { displayName: 'Entregado', bg: 'bg-gray-100', text: 'text-gray-500', border: 'bg-gray-400' },
    cancelled: { displayName: 'Cancelado', bg: 'bg-red-100', text: 'text-red-600', border: 'bg-red-500' },
  };

  const currentStatus = statusInfo[order.status] || { displayName: 'Desconocido', bg: 'bg-gray-200', text: 'text-gray-700', border: 'bg-gray-300' };
  const isPaid = order.paymentStatus === 'paid';
  const deliveryMethodText = order.deliveryMethod === 'domicilio' ? 'A domicilio' : 'Mostrador';
  const formattedDate = `${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(order.createdAt).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}`;

  return (
    <button 
      onClick={() => onSelect(order)}
      className="w-full text-left p-3 flex flex-col gap-2 border rounded-xl shadow-sm hover:shadow-md transition-all mb-3 relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentStatus.border}`} />

      {/* --- Fila Superior --- */}
      <div className="flex justify-between items-center text-sm pl-2">
        <div className="flex items-center gap-2 font-semibold">
          <span className={currentStatus.text}>#{order.orderNumber}</span>
          <span>{order.deliveryMethod === 'domicilio' ? '🛵' : '🛵'}</span>
          <span className={currentStatus.text}>{deliveryMethodText}</span>
        </div>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>

      {/* --- Fila de Etiquetas y Timer --- */}
      <div className="flex justify-between items-center pl-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white border border-gray-300 text-gray-800">WEB</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
            {currentStatus.displayName}
          </span>
           <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isPaid ? 'Pagado' : 'No pagado'}
          </span>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${timerColorClass}`}>
          <Clock12 size={14} />
          <span>{timerDisplay}</span>
        </div>
      </div>
      
      {/* --- Fila Inferior --- */}
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed pl-2">
         <button className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
           <span>Elige un repartidor</span>
           <ChevronRight size={16} />
         </button>
         <span className="text-lg font-bold text-gray-900">
           MXN {order.subtotal?.toFixed(2)}
         </span>
      </div>
    </button>
  );
};


const SearchSidebarModal = ({ isOpen, onClose, orders, onOrderSelect }) => {
  const [selectedOption, setSelectedOption] = useState('Cliente');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const options = ['ID unico', 'Cliente', 'Motivo de Cancelacion'];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order => {
      switch (selectedOption) {
        case 'ID unico':
          const orderNumber = String(order.orderNumber || '');
          const orderId = String(order._id || '');
          return (
            orderNumber.toLowerCase().includes(lowerCaseSearchTerm) ||
            orderId.slice(-4).includes(lowerCaseSearchTerm)
          );
        case 'Cliente':
          const customerName = String(order.customerId?.name || '').toLowerCase();
          return customerName.includes(lowerCaseSearchTerm);
        case 'Motivo de Cancelacion':
          const cancelReason = String(order.cancelReason || '').toLowerCase();
          return order.status === 'cancelled' && cancelReason.includes(lowerCaseSearchTerm);
        default:
          return false;
      }
    });
    setSearchResults(filtered);
  }, [searchTerm, selectedOption, orders]);

  const handleClose = () => {
    setSearchTerm('');
    setIsDropdownOpen(false);
    onClose();
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setSearchTerm(''); 
    setIsDropdownOpen(false);
  };

  const handleResultClick = (order) => {
    onOrderSelect(order); 
    handleClose(); 
  };

  if (!isOpen) {
    return null;
  }

  return (
    // ✨ SOLUCIÓN CIERRE: Ajuste de z-index para evitar conflictos
    <div className="fixed inset-0 z-20 top-12 flex justify-end">
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative z-50 bg-white w-1/4 h-full shadow-xl flex flex-col animate-slide-in-right">
        <style jsx>{`
            @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
            .animate-slide-in-right { animation: slideInRight 0.3s ease-out; }
        `}</style>
        
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Buscar pedido</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-hidden">
          <div className="p-4 space-y-4 border-b border-gray-200">
            <div className="flex gap-3">
              <div className="relative flex-shrink-0 w-40">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
                >
                  <span className="text-gray-900 truncate">{selectedOption}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform ml-1 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 w-full">
                    {options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionSelect(option)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg text-sm whitespace-nowrap"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Buscar por ${selectedOption.toLowerCase()}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {searchTerm.trim() && searchResults.length === 0 && (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-gray-500 text-sm">No se encontraron resultados para<br/><span className="font-semibold text-gray-600">"{searchTerm}"</span></p>
              </div>
            )}
            {!searchTerm.trim() && (
               <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">Busca un pedido para ver los resultados</p>
              </div>
            )}
            {searchResults.map(order => (
              <SearchResultCard key={order._id} order={order} onSelect={handleResultClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchSidebarModal;

