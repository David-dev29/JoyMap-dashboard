import { useState, useEffect, useCallback, useRef } from 'react';
import {
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineTruck,
  HiOutlineRefresh,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineExclamationCircle,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineDocumentText,
  HiOutlineCalendar,
  HiOutlineCube,
} from 'react-icons/hi';
import { toast } from 'sonner';
import { getMyOrders, updateOrderStatus } from '../../services/api';

// Status configuration
const statusConfig = {
  pending: {
    label: 'Pendiente',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600',
    icon: HiOutlineClock
  },
  preparing: {
    label: 'Preparando',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600',
    icon: HiOutlineCube
  },
  delivering: {
    label: 'En camino',
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-600',
    icon: HiOutlineTruck
  },
  delivered: {
    label: 'Entregado',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600',
    icon: HiOutlineCheckCircle
  },
  cancelled: {
    label: 'Cancelado',
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600',
    icon: HiOutlineXCircle
  },
};

// Tab filters
const tabs = [
  { id: 'all', label: 'Todos', statuses: null },
  { id: 'pending', label: 'Pendientes', statuses: ['pending'] },
  { id: 'preparing', label: 'Preparando', statuses: ['preparing'] },
  { id: 'delivering', label: 'En camino', statuses: ['delivering'] },
  { id: 'delivered', label: 'Entregados', statuses: ['delivered'] },
];

// Helper functions
const getCustomerData = (order) => {
  const name = order.customerId?.name || order.customer?.name || order.customerName || 'Cliente';
  const phone = order.customerId?.phone || order.customer?.phone || order.customerPhone || '';
  const address = order.deliveryAddress?.street ||
    (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '') ||
    order.address || '';
  const reference = order.deliveryAddress?.reference || '';
  return { name, phone, address, reference };
};

const getItemImage = (item) => {
  return item.image || item.productId?.image || item.productId?.images?.[0] ||
         item.product?.image || item.product?.images?.[0] || null;
};

const getItemName = (item) => {
  return item.name || item.productId?.name || item.product?.name || 'Producto';
};

// Timer component
const PendingTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      if (!createdAt) return 0;
      return Math.floor((new Date() - new Date(createdAt)) / 1000);
    };

    setElapsed(calculateElapsed());
    const interval = setInterval(() => setElapsed(calculateElapsed()), 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(Math.min(elapsed, 3600) / 60);
  const seconds = Math.min(elapsed, 3600) % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let colorClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (minutes >= 45) {
    colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse';
  } else if (minutes >= 30) {
    colorClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  } else if (minutes >= 15) {
    colorClasses = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  }

  return (
    <span className={`text-xs font-mono font-bold px-2 py-1 rounded-lg ${colorClasses}`}>
      {timeStr}
    </span>
  );
};

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const previousOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  const loadOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);
      setError('');

      const response = await getMyOrders();
      const ordersList = response.orders || response.data || response || [];

      if (Array.isArray(ordersList)) {
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersList);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las ordenes');
      toast.error('Error al cargar las ordenes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => loadOrders(false), 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // New order detection
  useEffect(() => {
    if (orders.length === 0) return;
    const currentIds = new Set(orders.map(o => o._id));

    if (isFirstLoadRef.current) {
      previousOrderIdsRef.current = currentIds;
      isFirstLoadRef.current = false;
      return;
    }

    orders.forEach(order => {
      if (!previousOrderIdsRef.current.has(order._id)) {
        const customer = getCustomerData(order);
        toast.success(`Nuevo pedido #${order.orderNumber || order._id?.slice(-6)}`, {
          description: `${customer.name} - $${order.total?.toLocaleString() || 0}`,
          duration: 10000,
        });
      }
    });

    previousOrderIdsRef.current = currentIds;
  }, [orders]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Tab filter
    const currentTab = tabs.find(t => t.id === activeTab);
    if (currentTab?.statuses && !currentTab.statuses.includes(order.status)) {
      return false;
    }

    // Search filter
    if (searchTerm) {
      const orderId = order.orderNumber?.toString() || order._id?.toString()?.slice(-6) || '';
      const customer = getCustomerData(order);
      return orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
    }

    return true;
  });

  // Get count for each tab
  const getTabCount = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab?.statuses) return orders.length;
    return orders.filter(o => tab.statuses.includes(o.status)).length;
  };

  // Action handlers
  const handleStatusChange = async (order, newStatus, actionLabel) => {
    if (!newStatus) return;
    const orderNum = order.orderNumber || order._id?.toString()?.slice(-6);

    try {
      setUpdating(order._id);
      await updateOrderStatus(order._id, newStatus);

      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: newStatus } : o
      ));

      toast.success(`Orden #${orderNum} ${actionLabel}`);
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(`Error al actualizar orden #${orderNum}`);
    } finally {
      setUpdating(null);
    }
  };

  const handleAccept = (order) => handleStatusChange(order, 'preparing', 'aceptada');
  const handleReject = (order) => handleStatusChange(order, 'cancelled', 'rechazada');
  const handleReadyForDelivery = (order) => handleStatusChange(order, 'delivering', 'lista para envio');
  const handleDelivered = (order) => handleStatusChange(order, 'delivered', 'entregada');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  // Mobile Order Card
  const MobileOrderCard = ({ order }) => {
    const expanded = expandedOrderId === order._id;
    const toggleExpanded = () => setExpandedOrderId(expanded ? null : order._id);
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const customer = getCustomerData(order);
    const isUpdating = updating === order._id;

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
        {/* Card Header */}
        <button
          onClick={toggleExpanded}
          className="w-full p-4 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Pedido #{order.orderNumber || order._id?.toString()?.slice(-6)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{customer.name}</p>
            </div>
            <div className="flex items-center gap-2">
              {order.status === 'pending' && <PendingTimer createdAt={order.createdAt} />}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineCube className="w-4 h-4" />
              <span>{order.items?.length || 0} productos</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span>{formatTimeAgo(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
              {expanded ? (
                <HiOutlineChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/50 space-y-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineUser className="w-4 h-4" /> Cliente
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>{customer.name}</p>
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-primary-600">
                    <HiOutlinePhone className="w-4 h-4" /> {customer.phone}
                  </a>
                )}
                {customer.address && (
                  <p className="flex items-start gap-1">
                    <HiOutlineLocationMarker className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {customer.address}
                  </p>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <HiOutlineCube className="w-4 h-4" /> Productos
              </h4>
              <div className="space-y-2">
                {(order.items || []).map((item, idx) => {
                  const itemImage = getItemImage(item);
                  const itemName = getItemName(item);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-900 rounded-xl">
                      {itemImage ? (
                        <img src={itemImage} alt={itemName} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <HiOutlineCube className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{itemName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} x {item.quantity || 1}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-white dark:bg-gray-900 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              {(order.deliveryFee > 0 || order.deliveryCost > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envio</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(order.deliveryFee || order.deliveryCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Payment & Notes */}
            {order.paymentMethod && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {order.paymentMethod === 'cash' ? (
                  <HiOutlineCash className="w-4 h-4 text-emerald-500" />
                ) : (
                  <HiOutlineCreditCard className="w-4 h-4 text-blue-500" />
                )}
                {order.paymentMethod === 'cash' ? 'Efectivo' : 'Tarjeta'}
              </div>
            )}
            {order.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-sm">
                <HiOutlineDocumentText className="inline w-4 h-4 text-amber-600 mr-1" />
                <span className="text-amber-700 dark:text-amber-300">{order.notes}</span>
              </div>
            )}
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <HiOutlineCalendar className="w-4 h-4" /> {formatDate(order.createdAt)}
            </div>

            {/* Action Buttons */}
            {order.status === 'pending' && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleAccept(order)}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium active:scale-95 transition-transform disabled:opacity-50"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => handleReject(order)}
                  disabled={isUpdating}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium active:scale-95 transition-transform disabled:opacity-50"
                >
                  Rechazar
                </button>
              </div>
            )}
            {order.status === 'preparing' && (
              <button
                onClick={() => handleReadyForDelivery(order)}
                disabled={isUpdating}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <HiOutlineTruck className="w-5 h-5" /> Listo para Envio
              </button>
            )}
            {order.status === 'delivering' && (
              <button
                onClick={() => handleDelivered(order)}
                disabled={isUpdating}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <HiOutlineCheckCircle className="w-5 h-5" /> Marcar Entregado
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Search Bar - Sticky */}
      <div className="sticky top-14 z-20 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pedido, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={() => loadOrders(false)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${refreshing ? 'animate-spin' : ''}`}
          >
            <HiOutlineRefresh className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Filter Tabs - Horizontal Scroll */}
      <div className="sticky top-[105px] z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium
                  transition-all active:scale-95
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                {tab.label}
                <span className={`
                  min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</p>
          <button
            onClick={() => loadOrders(true)}
            className="text-sm font-medium text-red-600"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4 space-y-3 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineCube className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron pedidos' : 'No hay pedidos en esta categoria'}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <MobileOrderCard key={order._id} order={order} />
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
