import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Eye,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Phone,
  DollarSign,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'info', icon: Clock },
  preparing: { label: 'Preparando', color: 'info', icon: Package },
  ready: { label: 'Listo', color: 'primary', icon: CheckCircle },
  delivering: { label: 'En camino', color: 'primary', icon: Package },
  delivered: { label: 'Entregado', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

const SalesHistory = () => {
  const isMobile = useIsMobile(768);
  const [orders, setOrders] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchOrders();
    fetchBusinesses();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.orders.base);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar órdenes');
      }

      const ordersData = data.orders || data.response || data.data || (Array.isArray(data) ? data : []);

      // Sort by date descending
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error al cargar las órdenes', 'error');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await authFetch(ENDPOINTS.businesses.all);
      const data = await response.json();
      const businessesData = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
      setBusinesses(businessesData);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setBusinesses([]);
    }
  };

  // Build business options for filter
  const businessOptions = [
    { value: '', label: 'Todos los negocios' },
    ...businesses.map(b => ({ value: b._id, label: b.name })),
  ];

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    // Ensure orderId is always a string (MongoDB _id is ObjectId)
    const orderId = order.orderNumber?.toString() || order._id?.toString()?.slice(-6) || '';
    const customerName = order.customer?.name || order.customerId?.name || '';
    const businessName = order.business?.name || order.businessId?.name || '';

    const matchesSearch =
      orderId.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      businessName.toLowerCase().includes(searchLower);

    const matchesBusiness = !businessFilter || order.business?._id === businessFilter || order.businessId === businessFilter;
    const matchesStatus = !statusFilter || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      matchesDate = orderDate === dateFilter;
    }

    return matchesSearch && matchesBusiness && matchesStatus && matchesDate;
  });

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mobile status tabs
  const statusTabs = [
    { key: '', label: 'Todos', count: orders.length },
    { key: 'pending', label: 'Pendiente', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmado', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'preparing', label: 'Preparando', count: orders.filter(o => o.status === 'preparing').length },
    { key: 'delivering', label: 'En camino', count: orders.filter(o => o.status === 'delivering').length },
    { key: 'delivered', label: 'Entregado', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelado', count: orders.filter(o => o.status === 'cancelled').length },
  ];

  // Mobile Order Card Component
  const MobileOrderCard = ({ order }) => {
    const isExpanded = expandedOrderId === order._id;
    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div
          className="p-4"
          onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
        >
          {/* Header with order number and status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                #{order.orderNumber || order._id?.toString()?.slice(-6)}
              </span>
              <Badge variant={status.color} size="sm">
                <span className="flex items-center gap-1">
                  <StatusIcon size={10} />
                  {status.label}
                </span>
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp size={18} className="text-gray-400" />
            ) : (
              <ChevronDown size={18} className="text-gray-400" />
            )}
          </div>

          {/* Business and customer info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {order.business?.name || 'Negocio'}
              </span>
            </div>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              ${order.total || 0}
            </span>
          </div>

          {/* Customer and date */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Avatar name={order.customer?.name || 'Cliente'} size="xs" />
              <span className="text-gray-600 dark:text-gray-300">
                {order.customer?.name || 'Cliente'}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(order.createdAt)} • {formatTime(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {/* Items summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2">
                {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
              </p>
              {order.items?.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {item.quantity}x {item.product?.name || item.name || 'Producto'}
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ${(item.price || 0) * (item.quantity || 1)}
                  </span>
                </div>
              ))}
              {order.items?.length > 3 && (
                <p className="text-xs text-gray-500 mt-1">
                  +{order.items.length - 3} más...
                </p>
              )}
            </div>

            {/* Action button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal(order);
              }}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Eye size={16} />
              Ver detalles completos
            </button>
          </div>
        )}
      </div>
    );
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Historial de Ventas</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {filteredOrders.length} órdenes
                </p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por # orden, cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {statusTabs.filter(tab => tab.count > 0 || tab.key === '').map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    statusFilter === tab.key
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.key
                        ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="px-4 pt-4 grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Ventas totales</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-xs text-gray-500">Entregadas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {orders.filter(o => o.status === 'cancelled').length}
            </p>
            <p className="text-xs text-gray-500">Canceladas</p>
          </div>
        </div>

        {/* Orders List */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No se encontraron órdenes</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <MobileOrderCard key={order._id} order={order} />
            ))
          )}
        </div>

        {/* Mobile Detail Modal */}
        <MobileModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          title={`Orden #${selectedOrder?.orderNumber || selectedOrder?._id?.toString()?.slice(-6)}`}
        >
          {selectedOrder && (
            <div className="space-y-4">
              {/* Status and Business */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <Building2 size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {selectedOrder.business?.name || 'Negocio'}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateTime(selectedOrder.createdAt)}</p>
                  </div>
                </div>
                <Badge variant={statusConfig[selectedOrder.status]?.color || 'secondary'} size="md">
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <Avatar name={selectedOrder.customer?.name || 'Cliente'} size="sm" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {selectedOrder.customerId?.name || selectedOrder.customer?.name || 'Cliente'}
                    </p>
                    {(selectedOrder.customerId?.phone || selectedOrder.customer?.phone) && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Phone size={12} />
                        {selectedOrder.customerId?.phone || selectedOrder.customer?.phone}
                      </div>
                    )}
                    {selectedOrder.deliveryAddress && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin size={12} />
                        {selectedOrder.deliveryAddress?.street || (typeof selectedOrder.deliveryAddress === 'string' ? selectedOrder.deliveryAddress : '')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Productos</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {item.product?.name || item.name || 'Producto'}
                          </p>
                          <p className="text-xs text-gray-500">x{item.quantity || 1}</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          ${(item.price || 0) * (item.quantity || 1)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-2 text-sm">Sin detalles de productos</p>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                {selectedOrder.subtotal && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.subtotal}</span>
                  </div>
                )}
                {selectedOrder.deliveryCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Envío</span>
                    <span className="text-gray-900 dark:text-white">${selectedOrder.deliveryCost}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Descuento</span>
                    <span className="text-emerald-600">-${selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.total || 0}</span>
                </div>
              </div>

              {/* Payment Method */}
              {selectedOrder.paymentMethod && (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">Pago</span>
                  </div>
                  <Badge variant={selectedOrder.paymentMethod === 'card' ? 'primary' : 'default'} size="sm">
                    {selectedOrder.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
                  </Badge>
                </div>
              )}

              {/* Cancel Reason */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <strong>Razón:</strong> {selectedOrder.cancelReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </MobileModal>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historial de Ventas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Todas las ordenes de todos los negocios
          </p>
        </div>
        <Badge variant="primary" size="md">
          {filteredOrders.length} ordenes
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por # orden, cliente o negocio..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              options={businessOptions}
              value={businessFilter}
              onChange={(e) => setBusinessFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-44"
            />
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'pending', label: 'Pendiente' },
                { value: 'confirmed', label: 'Confirmado' },
                { value: 'preparing', label: 'Preparando' },
                { value: 'ready', label: 'Listo' },
                { value: 'delivering', label: 'En camino' },
                { value: 'delivered', label: 'Entregado' },
                { value: 'cancelled', label: 'Cancelado' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-40"
            />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header># Orden</Table.Header>
              <Table.Header>Negocio</Table.Header>
              <Table.Header>Cliente</Table.Header>
              <Table.Header>Items</Table.Header>
              <Table.Header align="right">Total</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header>Fecha</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={8} />
            ) : filteredOrders.length === 0 ? (
              <Table.Empty
                colSpan={8}
                message="No se encontraron ordenes"
              />
            ) : (
              filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <Table.Row key={order._id}>
                    <Table.Cell>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        #{order.orderNumber || order._id?.toString()?.slice(-6)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {order.business?.name || 'Negocio'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <Avatar name={order.customer?.name || 'Cliente'} size="sm" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer?.name || 'Cliente'}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500">
                        {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${order.total || 0}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={status.color} size="sm">
                        <span className="flex items-center gap-1">
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                      </div>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye size={16} />}
                        onClick={() => openDetailModal(order)}
                      >
                        Ver
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Orden #${selectedOrder?.orderNumber || selectedOrder?._id?.toString()?.slice(-6)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status and Business */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.business?.name || 'Negocio'}
                  </p>
                  <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.createdAt)}</p>
                </div>
              </div>
              <Badge variant={statusConfig[selectedOrder.status]?.color || 'secondary'} size="md">
                {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cliente</h4>
              <div className="flex items-start gap-3">
                <Avatar name={selectedOrder.customer?.name || 'Cliente'} size="md" />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.customerId?.name || selectedOrder.customer?.name || 'Cliente'}
                  </p>
                  {(selectedOrder.customerId?.phone || selectedOrder.customer?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone size={14} />
                      {selectedOrder.customerId?.phone || selectedOrder.customer?.phone}
                    </div>
                  )}
                  {selectedOrder.deliveryAddress && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      {selectedOrder.deliveryAddress?.street || (typeof selectedOrder.deliveryAddress === 'string' ? selectedOrder.deliveryAddress : '')}
                      {selectedOrder.deliveryAddress?.reference ? ` (${selectedOrder.deliveryAddress.reference})` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h4>
              <div className="space-y-2">
                {selectedOrder.items?.length > 0 ? (
                  selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product?.name || item.name || 'Producto'}
                        </p>
                        <p className="text-sm text-gray-500">Cantidad: {item.quantity || 1}</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${(item.price || 0) * (item.quantity || 1)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-2">Sin detalles de productos</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              {selectedOrder.subtotal && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${selectedOrder.subtotal}</span>
                </div>
              )}
              {selectedOrder.deliveryCost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envio</span>
                  <span className="text-gray-900 dark:text-white">${selectedOrder.deliveryCost}</span>
                </div>
              )}
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="text-emerald-600 dark:text-emerald-400">-${selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.total || 0}</span>
              </div>
            </div>

            {/* Payment Method */}
            {selectedOrder.paymentMethod && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Metodo de pago</span>
                </div>
                <Badge variant={selectedOrder.paymentMethod === 'card' ? 'primary' : 'default'}>
                  {selectedOrder.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
                </Badge>
              </div>
            )}

            {/* Cancel Reason */}
            {selectedOrder.status === 'cancelled' && selectedOrder.cancelReason && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">
                  <strong>Razon de cancelacion:</strong> {selectedOrder.cancelReason}
                </p>
              </div>
            )}
          </div>
        )}
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalesHistory;
