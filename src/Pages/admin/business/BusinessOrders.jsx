import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingCart,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  Package,
  User,
  MapPin,
  Phone,
  Calendar,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CreditCard,
  Banknote,
  FileText,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Badge } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import { getBusinessOrders, updateOrderStatus } from '../../../services/api';
import { BusinessPanelLayout } from '../../../Components/layout';
import { useIsMobile } from '../../../hooks/useIsMobile';

// Status configuration
const statusConfig = {
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  preparing: { label: 'Preparando', variant: 'info', icon: ChefHat },
  delivering: { label: 'En camino', variant: 'primary', icon: Truck },
  delivered: { label: 'Entregado', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'danger', icon: XCircle },
};

// 4 Kanban columns for delivery app
const kanbanColumns = [
  {
    id: 'pending',
    title: 'Pendientes',
    statuses: ['pending'],
    color: 'amber',
    icon: Clock,
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600',
  },
  {
    id: 'preparing',
    title: 'En Preparacion',
    statuses: ['preparing'],
    color: 'indigo',
    icon: ChefHat,
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    textClass: 'text-indigo-600',
  },
  {
    id: 'delivering',
    title: 'En Camino',
    statuses: ['delivering'],
    color: 'violet',
    icon: Truck,
    bgClass: 'bg-violet-100 dark:bg-violet-900/30',
    textClass: 'text-violet-600',
  },
  {
    id: 'delivered',
    title: 'Entregadas',
    statuses: ['delivered'],
    color: 'emerald',
    icon: CheckCircle,
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600',
  },
];

// Helper to extract customer data from API structure
const getCustomerData = (order) => {
  const name = order.customerId?.name || order.customer?.name || order.customerName || 'Cliente';
  const phone = order.customerId?.phone || order.customer?.phone || order.customerPhone || '';
  const address = order.deliveryAddress?.street ||
    (typeof order.deliveryAddress === 'string' ? order.deliveryAddress : '') ||
    order.address || '';
  const reference = order.deliveryAddress?.reference || '';
  return { name, phone, address, reference };
};

// Helper to get item image from multiple possible sources
const getItemImage = (item) => {
  return item.image ||
    item.productId?.image ||
    item.productId?.images?.[0] ||
    item.product?.image ||
    item.product?.images?.[0] ||
    null;
};

// Get item name from multiple possible sources
const getItemName = (item) => {
  return item.name || item.productId?.name || item.product?.name || 'Producto';
};

// Timer component for pending orders - POS/Kitchen style
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

  const cappedSeconds = Math.min(elapsed, 3600);
  const minutes = Math.floor(cappedSeconds / 60);
  const seconds = cappedSeconds % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let colorClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (minutes >= 45) {
    colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse';
  } else if (minutes >= 30) {
    colorClasses = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  } else if (minutes >= 15) {
    colorClasses = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  }

  return (
    <span className={`text-xs font-mono font-bold flex items-center gap-1 px-2 py-1 rounded-lg ${colorClasses}`}>
      <Timer size={14} />
      {timeStr}
    </span>
  );
};

const BusinessOrders = () => {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [mobileStatusFilter, setMobileStatusFilter] = useState('pending');

  const previousOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  const loadOrders = useCallback(async (showLoading = true) => {
    if (!selectedBusiness) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError('');

      const response = await getBusinessOrders(selectedBusiness._id);
      const ordersList = response.orders || response.data || response || [];

      if (Array.isArray(ordersList)) {
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersList);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las ordenes');
      if (showLoading) toast.error('Error al cargar las ordenes');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness]);

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

  // Guard: No business selected - handled by BusinessPanelLayout for admins
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return <BusinessPanelLayout>{null}</BusinessPanelLayout>;
  }

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const orderId = order.orderNumber?.toString() || order._id?.toString()?.slice(-6) || '';
    const customer = getCustomerData(order);
    return orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
  });

  const getColumnOrders = (column) => {
    return filteredOrders.filter(order => column.statuses.includes(order.status));
  };

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

  // Action handlers for each column
  const handleAccept = (order) => handleStatusChange(order, 'preparing', 'aceptada');
  const handleReject = (order) => handleStatusChange(order, 'cancelled', 'rechazada');
  const handleReadyForDelivery = (order) => handleStatusChange(order, 'delivering', 'lista para envio');
  const handleDelivered = (order) => handleStatusChange(order, 'delivered', 'entregada');

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  // Order Card Component
  const OrderCard = ({ order }) => {
    const expanded = expandedOrderId === order._id;
    const toggleExpanded = () => setExpandedOrderId(expanded ? null : order._id);
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const customer = getCustomerData(order);
    const isUpdating = updating === order._id;

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                #{order.orderNumber || order._id?.toString()?.slice(-6)}
              </span>
              <Badge variant={config.variant} size="sm">
                <StatusIcon size={12} className="mr-1" />
                {config.label}
              </Badge>
            </div>
            {order.status === 'pending' && <PendingTimer createdAt={order.createdAt} />}
          </div>

          {/* Customer Info */}
          <div className="mb-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Phone size={12} />
                {customer.phone}
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{order.items?.length || 0} productos</p>
            {!expanded && (
              <div className="space-y-1">
                {(order.items || []).slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{item.quantity || 1}x</span> {getItemName(item)}
                  </div>
                ))}
                {(order.items?.length || 0) > 2 && (
                  <p className="text-xs text-gray-400">+{order.items.length - 2} mas...</p>
                )}
              </div>
            )}
          </div>

          {/* Total and Expand */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700">
            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{formatCurrency(order.total)}</span>
            <button
              onClick={toggleExpanded}
              className="flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors"
            >
              {expanded ? <><span>Menos</span><ChevronUp size={16} /></> : <><span>Ver mas</span><ChevronDown size={16} /></>}
            </button>
          </div>
        </div>

        {/* Expanded View */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-slate-700 p-4 bg-gray-50/50 dark:bg-slate-700/30">
            {/* Customer Details */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <User size={16} /> Cliente
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <p>{customer.name}</p>
                {customer.phone && <p className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</p>}
                {customer.address && (
                  <p className="flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5" />
                    {customer.address}
                    {customer.reference && <span className="text-xs text-gray-500"> (Ref: {customer.reference})</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Products with Images */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Package size={16} /> Productos
              </h4>
              <div className="space-y-2">
                {(order.items || []).map((item, idx) => {
                  const itemImage = getItemImage(item);
                  const itemName = getItemName(item);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-lg">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                          <Package size={18} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{itemName}</p>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} x {item.quantity || 1}</p>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal || order.total)}</span>
              </div>
              {(order.deliveryFee > 0 || order.deliveryCost > 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envio</span>
                  <span>{formatCurrency(order.deliveryFee || order.deliveryCost)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="text-emerald-600">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-orange-600 dark:text-orange-400">{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Payment & Notes */}
            {order.paymentMethod && (
              <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {order.paymentMethod === 'cash' ? <Banknote size={16} className="text-emerald-500" /> : <CreditCard size={16} className="text-blue-500" />}
                {order.paymentMethod === 'cash' ? 'Efectivo' : order.paymentMethod === 'card' ? 'Tarjeta' : order.paymentMethod}
              </div>
            )}
            {order.notes && (
              <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                <FileText size={14} className="inline text-amber-600 mr-1" />
                <span className="text-amber-700 dark:text-amber-300">{order.notes}</span>
              </div>
            )}
            <div className="mb-3 text-xs text-gray-500 flex items-center gap-1">
              <Calendar size={12} /> {formatDate(order.createdAt)}
            </div>

            {/* Action Buttons by Status */}
            {order.status === 'pending' && (
              <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button variant="primary" className="flex-1" onClick={() => handleAccept(order)} disabled={isUpdating}>
                  <CheckCircle size={18} className="mr-2" /> Aceptar
                </Button>
                <Button variant="danger" className="flex-1" onClick={() => handleReject(order)} disabled={isUpdating}>
                  <XCircle size={18} className="mr-2" /> Rechazar
                </Button>
              </div>
            )}
            {order.status === 'preparing' && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button variant="primary" className="w-full" onClick={() => handleReadyForDelivery(order)} disabled={isUpdating}>
                  <Truck size={18} className="mr-2" /> Listo para Envio
                </Button>
              </div>
            )}
            {order.status === 'delivering' && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button variant="success" className="w-full" onClick={() => handleDelivered(order)} disabled={isUpdating}>
                  <CheckCircle size={18} className="mr-2" /> Marcar Entregado
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Kanban Column Component
  const KanbanColumn = ({ column }) => {
    const columnOrders = getColumnOrders(column);
    const Icon = column.icon;

    return (
      <div className="flex flex-col min-w-[280px] lg:min-w-0">
        {/* Column Header with Count Badge */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${column.bgClass} ${column.textClass}`}>
              <Icon size={18} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-sm font-bold ${column.bgClass} ${column.textClass}`}>
            {columnOrders.length}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          {columnOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${column.bgClass} ${column.textClass} opacity-50`}>
                <Icon size={24} />
              </div>
              <p className="text-sm text-gray-500">Sin ordenes</p>
            </div>
          ) : (
            columnOrders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </div>
      </div>
    );
  };

  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando ordenes...</span>
        </div>
      </div>
    );
  }

  // Mobile status tabs with counts
  const mobileStatusTabs = kanbanColumns.map(col => ({
    key: col.id,
    label: col.title,
    count: getColumnOrders(col).length,
    color: col.color,
    Icon: col.icon,
    bgClass: col.bgClass,
    textClass: col.textClass,
  }));

  // Get orders for mobile view
  const getMobileFilteredOrders = () => {
    const column = kanbanColumns.find(c => c.id === mobileStatusFilter);
    if (!column) return [];
    return filteredOrders.filter(order => column.statuses.includes(order.status));
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    const mobileOrders = getMobileFilteredOrders();

    const mobileContent = (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        {/* Search and Filter Header */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {orders.length} pedidos
            </p>
            <button
              onClick={() => loadOrders(true)}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
            >
              <RefreshCw size={16} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por # orden o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {mobileStatusTabs.map((tab) => {
                const Icon = tab.Icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setMobileStatusFilter(tab.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      mobileStatusFilter === tab.key
                        ? `${tab.bgClass} ${tab.textClass}`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      mobileStatusFilter === tab.key
                        ? 'bg-white/30'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-4 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Orders List */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {mobileOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                mobileStatusTabs.find(t => t.key === mobileStatusFilter)?.bgClass
              }`}>
                {(() => {
                  const tab = mobileStatusTabs.find(t => t.key === mobileStatusFilter);
                  const Icon = tab?.Icon || Clock;
                  return <Icon size={28} className={tab?.textClass} />;
                })()}
              </div>
              <p className="text-gray-500 dark:text-gray-400">Sin órdenes</p>
            </div>
          ) : (
            mobileOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          )}
        </div>
      </div>
    );

    // Wrap with BusinessPanelLayout for admin users
    if (isAdmin) {
      return <BusinessPanelLayout>{mobileContent}</BusinessPanelLayout>;
    }
    return mobileContent;
  }

  // ========== DESKTOP LAYOUT ==========
  const desktopContent = (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos del Negocio</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona los pedidos de {selectedBusiness?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="Buscar orden..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" leftIcon={<RefreshCw size={18} />} onClick={() => loadOrders(true)}>
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => loadOrders(true)}>Reintentar</Button>
        </div>
      )}

      {/* Kanban Board - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
        {kanbanColumns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    </div>
  );

  // Wrap with BusinessPanelLayout for admin users
  if (isAdmin) {
    return <BusinessPanelLayout>{desktopContent}</BusinessPanelLayout>;
  }
  return desktopContent;
};

export default BusinessOrders;
