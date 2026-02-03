import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineVolumeUp,
  HiOutlineVolumeOff,
  HiOutlineWifi,
  HiOutlineChat,
  HiOutlineTruck,
  HiOutlineShoppingBag,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import {
  Clock,
  ChefHat,
  ShoppingCart,
  Truck,
  Package,
  UtensilsCrossed,
  RefreshCw,
  Volume2,
  VolumeX,
  Wifi,
  MessageSquare,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useBusiness } from '../../context/BusinessContext';
import { ENDPOINTS, SOCKET_URL, SOCKET_CONFIG, authFetch } from '../../config/api';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

// ============================================
// CONSTANTS
// ============================================
const TIME_THRESHOLDS = { GREEN: 10, YELLOW: 20 };

const ORDER_TYPES = {
  delivery: { label: 'Delivery', icon: Truck, mobileIcon: HiOutlineTruck, variant: 'info' },
  takeaway: { label: 'Para llevar', icon: Package, mobileIcon: HiOutlineShoppingBag, variant: 'warning' },
  pickup: { label: 'Para llevar', icon: Package, mobileIcon: HiOutlineShoppingBag, variant: 'warning' },
  dine_in: { label: 'En local', icon: UtensilsCrossed, mobileIcon: HiOutlineShoppingBag, variant: 'success' },
  local: { label: 'En local', icon: UtensilsCrossed, mobileIcon: HiOutlineShoppingBag, variant: 'success' },
};

const TAB_CONFIG = [
  { id: 'nuevas', label: 'Pendientes', statuses: ['pending'], color: 'amber' },
  { id: 'preparando', label: 'Preparando', statuses: ['accepted', 'preparing'], color: 'blue' },
  { id: 'listas', label: 'Listas', statuses: ['ready'], color: 'green' },
];

// ============================================
// HELPERS
// ============================================
const getTimeElapsed = (createdAt) => {
  if (!createdAt) return { minutes: 0, display: '0 min', variant: 'success' };

  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  let display;
  if (diffMins < 60) {
    display = `${diffMins} min`;
  } else {
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    display = `${hours}h ${mins}m`;
  }

  let variant = 'success';
  if (diffMins >= TIME_THRESHOLDS.YELLOW) {
    variant = 'danger';
  } else if (diffMins >= TIME_THRESHOLDS.GREEN) {
    variant = 'warning';
  }

  return { minutes: diffMins, display, variant };
};

// ============================================
// MOBILE ORDER CARD
// ============================================
const MobileOrderCard = ({ order, onAccept, onReject, onReady, onDelivered, isUpdating }) => {
  const timeElapsed = getTimeElapsed(order.createdAt);
  const orderType = ORDER_TYPES[order.orderType] || ORDER_TYPES.delivery;
  const orderNumber = order.orderNumber || order._id?.slice(-4).toUpperCase();

  const getTimerColor = () => {
    if (timeElapsed.variant === 'danger') return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    if (timeElapsed.variant === 'warning') return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
    return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
      {/* Header with Order Number and Timer */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            #{orderNumber}
          </span>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
            orderType.variant === 'info' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
            orderType.variant === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
          }`}>
            {orderType.label}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getTimerColor()}`}>
          <HiOutlineClock className="w-4 h-4" />
          <span className="text-sm font-semibold">{timeElapsed.display}</span>
        </div>
      </div>

      {/* Customer Info */}
      {(order.customerId?.name || order.customer?.name) && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {order.customerId?.name || order.customer?.name}
          </p>
        </div>
      )}

      {/* Items List */}
      <div className="p-4">
        <div className="space-y-2">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-7 h-7 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                {item.quantity || 1}
              </span>
              <span className="text-gray-800 dark:text-gray-200 flex-1">
                {item.product?.name || item.name || 'Producto'}
              </span>
            </div>
          ))}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-r-lg">
            <div className="flex items-start gap-2">
              <HiOutlineChat className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-800 dark:text-amber-300">{order.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        {order.status === 'pending' && (
          <div className="flex gap-3">
            <button
              onClick={() => onReject(order)}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
            >
              <HiOutlineX className="w-5 h-5" />
              Rechazar
            </button>
            <button
              onClick={() => onAccept(order)}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              <HiOutlineCheck className="w-5 h-5" />
              Aceptar
            </button>
          </div>
        )}

        {['accepted', 'preparing'].includes(order.status) && (
          <button
            onClick={() => onReady(order)}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <HiOutlineCheck className="w-5 h-5" />
            Marcar como Lista
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => onDelivered(order)}
            disabled={isUpdating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <HiOutlineCheck className="w-5 h-5" />
            Entregada
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// DESKTOP ORDER CARD
// ============================================
const DesktopOrderCard = ({ order, onAccept, onReject, onReady, onDelivered, isUpdating }) => {
  const timeElapsed = getTimeElapsed(order.createdAt);
  const orderType = ORDER_TYPES[order.orderType] || ORDER_TYPES.delivery;
  const OrderTypeIcon = orderType.icon;

  const orderNumber = order.orderNumber || order._id?.slice(-4).toUpperCase();

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            #{orderNumber}
          </span>
          <Badge variant={timeElapsed.variant} size="sm">
            <Clock size={14} className="mr-1" />
            {timeElapsed.display}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        {/* Order Type */}
        <div className="mb-3">
          <Badge variant={orderType.variant} size="sm">
            <OrderTypeIcon size={14} className="mr-1" />
            {orderType.label}
          </Badge>
          {(order.customerId?.name || order.customer?.name) && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {order.customerId?.name || order.customer?.name}
            </span>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-2 mb-3">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">
                {item.quantity || 1}
              </span>
              <span className="text-gray-700 dark:text-gray-300 flex-1 truncate">
                {item.product?.name || item.name || 'Producto'}
              </span>
            </div>
          ))}
        </div>

        {/* Customer Notes */}
        {order.notes && (
          <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded text-sm text-amber-800 dark:text-amber-300">
            <div className="flex items-start gap-2">
              <MessageSquare size={14} className="flex-shrink-0 mt-0.5" />
              <span>{order.notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-700">
        {order.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => onReject(order)}
              disabled={isUpdating}
            >
              Rechazar
            </Button>
            <Button
              variant="success"
              size="sm"
              className="flex-1"
              onClick={() => onAccept(order)}
              disabled={isUpdating}
            >
              Aceptar
            </Button>
          </div>
        )}

        {['accepted', 'preparing'].includes(order.status) && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onReady(order)}
            disabled={isUpdating}
          >
            Lista para entrega
          </Button>
        )}

        {order.status === 'ready' && (
          <Button
            variant="success"
            size="sm"
            fullWidth
            onClick={() => onDelivered(order)}
            disabled={isUpdating}
          >
            Entregada
          </Button>
        )}
      </div>
    </Card>
  );
};

// ============================================
// CONNECTION STATUS INDICATOR
// ============================================
const ConnectionStatus = ({ isConnected, isMobile }) => (
  <div className={`fixed ${isMobile ? 'bottom-20 right-4' : 'bottom-4 right-4'} z-50`}>
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg
        ${isConnected
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        }
      `}
    >
      {isConnected ? <HiOutlineWifi className="w-4 h-4" /> : <Wifi size={14} />}
      {isConnected ? 'Conectado' : 'Desconectado'}
    </div>
  </div>
);

// ============================================
// MAIN KITCHEN COMPONENT
// ============================================
const Kitchen = () => {
  const isMobile = useIsMobile();

  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('nuevas');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [updatingOrders, setUpdatingOrders] = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Context
  const { selectedBusiness } = useBusiness();

  // Refs
  const notificationSoundRef = useRef(null);
  const socketRef = useRef(null);

  // Derived state - filter orders by tab
  const ordersByTab = useMemo(() => {
    const result = {};
    TAB_CONFIG.forEach(tab => {
      result[tab.id] = orders.filter(o => tab.statuses.includes(o.status));
    });
    return result;
  }, [orders]);

  // Stats for header
  const stats = useMemo(() => ({
    total: orders.length,
    nuevas: ordersByTab.nuevas?.length || 0,
    preparando: ordersByTab.preparando?.length || 0,
    listas: ordersByTab.listas?.length || 0,
  }), [orders, ordersByTab]);

  // ============================================
  // SOUND NOTIFICATION
  // ============================================
  useEffect(() => {
    notificationSoundRef.current = new Audio('/assets/notifications.MP3');
    notificationSoundRef.current.preload = 'auto';
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || !notificationSoundRef.current) return;
    notificationSoundRef.current.currentTime = 0;
    notificationSoundRef.current.play().catch(() => {});

    // Vibrate on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [soundEnabled, isMobile]);

  // ============================================
  // CLOCK UPDATE
  // ============================================
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // FETCH ORDERS
  // ============================================
  const fetchOrders = useCallback(async () => {
    if (!selectedBusiness?._id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const statusFilter = 'pending,accepted,preparing,ready';
      const response = await authFetch(
        `${ENDPOINTS.me.orders}?status=${statusFilter}`
      );
      const data = await response.json();

      const ordersList = data.orders || data.data || data || [];
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?._id]);

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchOrders();
    const refreshInterval = setInterval(fetchOrders, 30000);
    return () => clearInterval(refreshInterval);
  }, [fetchOrders]);

  // ============================================
  // SOCKET.IO CONNECTION
  // ============================================
  useEffect(() => {
    if (!selectedBusiness?._id) return;

    const socket = io(SOCKET_URL, SOCKET_CONFIG.options);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new-order', (newOrder) => {
      const orderBusinessId = newOrder.businessId?._id || newOrder.businessId;
      if (orderBusinessId !== selectedBusiness._id) return;

      setOrders(prev => {
        if (prev.some(o => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });

      playNotificationSound();
    });

    socket.on('order-updated', (updatedOrder) => {
      const orderBusinessId = updatedOrder.businessId?._id || updatedOrder.businessId;
      if (orderBusinessId !== selectedBusiness._id) return;

      setOrders(prev => {
        if (['delivered', 'cancelled'].includes(updatedOrder.status)) {
          return prev.filter(o => o._id !== updatedOrder._id);
        }
        return prev.map(o =>
          o._id === updatedOrder._id ? updatedOrder : o
        );
      });
    });

    socket.on('order:new', (newOrder) => {
      socket.emit('new-order', newOrder);
    });

    socket.on('order:update', (updatedOrder) => {
      socket.emit('order-updated', updatedOrder);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-order');
      socket.off('order-updated');
      socket.off('order:new');
      socket.off('order:update');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedBusiness?._id, playNotificationSound]);

  // ============================================
  // STATUS CHANGE HANDLERS
  // ============================================
  const handleStatusChange = async (order, newStatus) => {
    setUpdatingOrders(prev => new Set([...prev, order._id]));

    try {
      const response = await authFetch(ENDPOINTS.orders.byId(order._id), {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      if (['delivered', 'cancelled'].includes(newStatus)) {
        setOrders(prev => prev.filter(o => o._id !== order._id));
      } else {
        setOrders(prev =>
          prev.map(o =>
            o._id === order._id ? { ...o, status: newStatus } : o
          )
        );
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      fetchOrders();
    } finally {
      setUpdatingOrders(prev => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
    }
  };

  const handleAccept = (order) => handleStatusChange(order, 'preparing');
  const handleReject = (order) => handleStatusChange(order, 'cancelled');
  const handleReady = (order) => handleStatusChange(order, 'ready');
  const handleDelivered = (order) => handleStatusChange(order, 'delivered');

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">
            Cargando cocina...
          </span>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ChefHat size={32} className="text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Button onClick={fetchOrders} leftIcon={<RefreshCw size={18} />}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // ============================================
  // MOBILE LAYOUT
  // ============================================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Cocina</h1>
              {stats.nuevas > 0 && (
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-full">
                  {stats.nuevas} nuevos
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                {soundEnabled ? (
                  <HiOutlineVolumeUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <HiOutlineVolumeOff className="w-5 h-5 text-gray-400" />
                )}
              </button>
              {/* Refresh */}
              <button
                onClick={fetchOrders}
                className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
              >
                <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[65px] z-20 bg-gray-50 dark:bg-gray-950">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? tab.color === 'amber' ? 'bg-amber-500 text-white' :
                      tab.color === 'blue' ? 'bg-blue-500 text-white' :
                      'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.color === 'amber' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                      tab.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'
                }`}>
                  {stats[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 py-4">
          {(ordersByTab[activeTab] || []).length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center">
              <ChefHat size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No hay pedidos en esta categoria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {(ordersByTab[activeTab] || []).map(order => (
                <MobileOrderCard
                  key={order._id}
                  order={order}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onReady={handleReady}
                  onDelivered={handleDelivered}
                  isUpdating={updatingOrders.has(order._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Connection Status */}
        <ConnectionStatus isConnected={isConnected} isMobile={true} />
      </div>
    );
  }

  // ============================================
  // DESKTOP LAYOUT
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Cocina
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {selectedBusiness?.name || 'Mi Negocio'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Current Time */}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock size={18} />
            <span className="font-mono text-lg">
              {currentTime.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            className="p-2"
          >
            <RefreshCw size={18} />
          </Button>

          {/* Pending Orders Counter */}
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <ShoppingCart size={18} className="text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-amber-700 dark:text-amber-400">
              {stats.total} pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative py-3 px-1 text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                <Badge
                  variant={
                    tab.id === 'nuevas' ? 'warning' :
                    tab.id === 'preparando' ? 'info' : 'success'
                  }
                  size="xs"
                >
                  {stats[tab.id]}
                </Badge>
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(ordersByTab[activeTab] || []).map(order => (
          <DesktopOrderCard
            key={order._id}
            order={order}
            onAccept={handleAccept}
            onReject={handleReject}
            onReady={handleReady}
            onDelivered={handleDelivered}
            isUpdating={updatingOrders.has(order._id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {(ordersByTab[activeTab] || []).length === 0 && (
        <div className="text-center py-12">
          <ChefHat size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay pedidos en esta categoria
          </p>
        </div>
      )}

      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} isMobile={false} />
    </div>
  );
};

export default Kitchen;
