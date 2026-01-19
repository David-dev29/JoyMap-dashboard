import React, { useState, useEffect } from 'react';
import { Clock, Check, FileText, Flame, TrendingUp } from 'lucide-react';

const OrderCard = ({ order, kitchenColor, onItemPrepared }) => {
  const {
    _id,
    customerId,
    notes = '',
    items = [],
    statusHistory = [],
    createdAt,
  } = order || {};

  // Extraer timestamp de cuando fue aceptado (buscar en statusHistory)
  const acceptedStatus = statusHistory.find(s => s.status === 'accepted' || s.status === 'confirmed');
  const acceptedAt = acceptedStatus?.timestamp;

  // Generar número de orden corto del ID
  const orderNumber = _id ? String(_id).slice(-4).toUpperCase() : '0000';

  // --- Timer en segundos desde que fue ACEPTADO ---
  const [secondsElapsed, setSecondsElapsed] = useState(() => {
    if (!acceptedAt) return 0;
    const now = new Date();
    const acceptTime = new Date(acceptedAt);
    const diffSeconds = Math.floor((now - acceptTime) / 1000);
    return diffSeconds > 3600 ? 3600 : diffSeconds; // límite 1 hora
  });

  useEffect(() => {
    if (!acceptedAt) return;
    
    const interval = setInterval(() => {
      setSecondsElapsed(prev => (prev < 3600 ? prev + 1 : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [acceptedAt]);

  // --- Formateo del timer en MM:SS con color dinámico ---
  const minutes = Math.floor(secondsElapsed / 60);
  const seconds = secondsElapsed % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // Determinar urgencia por tiempo
  const getTimerColor = () => {
    if (minutes < 5) return 'text-green-600'; // Rápido
    if (minutes < 10) return 'text-amber-600'; // Moderado
    if (minutes < 15) return 'text-orange-600'; // Lento
    return 'text-red-600'; // Muy lento
  };

  const getUrgencyBg = () => {
    if (minutes < 5) return 'bg-green-50 border-green-200';
    if (minutes < 10) return 'bg-amber-50 border-amber-200';
    if (minutes < 15) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  // --- Contador de items preparados ---
  const preparedCount = items.filter(it => it.status === 'prepared').length;
  const totalCount = items.length;
  const allPrepared = preparedCount === totalCount && totalCount > 0;

  // --- Funciones para marcar items ---
  const toggleItem = (item) => {
    if (item && item._id && item.status !== 'prepared') {
      onItemPrepared?.(order._id, item._id);
    }
  };

  const markAllPrepared = () => {
    items.forEach(it => {
      if (it.status !== 'prepared') {
        onItemPrepared?.(order._id, it._id);
      }
    });
  };

  return (
    <div className={`w-full h-full flex flex-col rounded-2xl overflow-hidden shadow-lg border-2 transition-all ${
      allPrepared 
        ? 'border-green-300 bg-green-50/30' 
        : 'border-gray-200 bg-white'
    }`}>
      {/* Header con color de cocina */}
      <div className="px-5 py-4" style={{ background: kitchenColor, backgroundImage: `linear-gradient(135deg, ${kitchenColor} 0%, ${kitchenColor}dd 100%)` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Número de orden circular */}
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0">
              <span className="text-2xl font-black text-gray-900">
                {orderNumber.replace('#', '')}
              </span>
            </div>
            
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-sm font-semibold text-white/80 uppercase tracking-widest">
                Orden
              </span>
              <span className="text-lg font-extrabold text-white break-words">
                {customerId?.name || 'Cliente'}
              </span>
            </div>
          </div>

          {/* Badge de estado */}
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30">
            <div className={`w-2 h-2 rounded-full ${allPrepared ? 'bg-green-400 animate-pulse' : 'bg-yellow-300 animate-pulse'}`}></div>
            <span className="text-xs font-bold text-white">
              {allPrepared ? 'LISTO' : 'EN COCINA'}
            </span>
          </div>
        </div>

        {/* Timer y progreso */}
        <div className="flex items-center gap-2 mt-3">
          <div className={`flex-1 px-3 py-2 rounded-lg ${getUrgencyBg()} border flex items-center gap-2`}>
            <Flame className={`w-4 h-4 ${getTimerColor()}`} />
            <span className={`font-black text-lg ${getTimerColor()}`}>
              {timerDisplay}
            </span>
          </div>
          
          {/* Barra de progreso visual */}
          <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                allPrepared 
                  ? 'w-full bg-green-400' 
                  : 'bg-white'
              }`}
              style={{ width: `${Math.min((preparedCount / totalCount) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 bg-white overflow-hidden">
        {/* Notas */}
        {notes && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded mb-4 flex gap-2">
            <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-amber-900">{notes}</span>
          </div>
        )}

        {/* Items list */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-3">
          {items.map(it => (
            <div 
              key={it._id} 
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                it.status === 'prepared'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => toggleItem(it)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Cantidad */}
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {it.quantity}
                </div>
                
                {/* Nombre */}
                <span className={`font-semibold text-sm ${
                  it.status === 'prepared' 
                    ? 'line-through text-gray-400' 
                    : 'text-gray-900'
                } truncate`}>
                  {it.name || it.productId?.name}
                </span>
              </div>

              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  it.status === 'prepared'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {it.status === 'prepared' && (
                  <Check className="w-4 h-4 text-white font-bold" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progreso y botón */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingUp className="w-4 h-4" />
              <span>Progreso: {preparedCount}/{totalCount}</span>
            </div>
            <span className="text-blue-600">{Math.round((preparedCount / totalCount) * 100)}%</span>
          </div>

          <button
            onClick={markAllPrepared}
            disabled={allPrepared}
            className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wide ${
              allPrepared
                ? 'bg-green-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            <Check className="w-5 h-5" />
            {allPrepared ? '✓ COMPLETADO' : 'Marcar todo preparado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;