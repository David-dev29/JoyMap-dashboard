import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
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
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { Card, Button, Input, Badge, Table, Modal } from '../../components/ui';
import { getMyOrders, updateOrderStatus } from '../../services/api';

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', variant: 'info', icon: CheckCircle },
  preparing: { label: 'Preparando', variant: 'info', icon: ChefHat },
  ready: { label: 'Listo', variant: 'success', icon: Package },
  delivering: { label: 'En camino', variant: 'primary', icon: Truck },
  delivered: { label: 'Entregado', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'danger', icon: XCircle },
};

const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered'];

const Orders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getMyOrders();
      console.log('=== DEBUG Orders ===');
      console.log('Orders response:', response);

      const ordersList = response.orders || response.data || response || [];
      if (Array.isArray(ordersList)) {
        // Sort by date, newest first
        ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersList);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las ordenes');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const orderId = order.orderNumber?.toString() || order._id?.toString()?.slice(-6) || '';
    const customerName = order.customer?.name?.toLowerCase() || '';

    const matchesSearch = orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        const orderDay = new Date(orderDate);
        orderDay.setHours(0, 0, 0, 0);
        matchesDate = orderDay.getTime() === today.getTime();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleStatusChange = async (order, newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(order._id, newStatus);

      // Update local state
      setOrders(prev => prev.map(o =>
        o._id === order._id ? { ...o, status: newStatus } : o
      ));

      if (selectedOrder?._id === order._id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando ordenes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ordenes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona las ordenes de tu negocio
          </p>
        </div>
        <Button
          variant="ghost"
          leftIcon={<RefreshCw size={18} />}
          onClick={loadOrders}
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-500">Pendientes</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <ChefHat size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length}
              </p>
              <p className="text-xs text-gray-500">En proceso</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Truck size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => ['ready', 'delivering'].includes(o.status)).length}
              </p>
              <p className="text-xs text-gray-500">En entrega</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
              <p className="text-xs text-gray-500">Completadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por # orden o cliente..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row hover={false}>
                <Table.Header>Orden</Table.Header>
                <Table.Header>Cliente</Table.Header>
                <Table.Header align="right">Total</Table.Header>
                <Table.Header align="center">Estado</Table.Header>
                <Table.Header>Fecha</Table.Header>
                <Table.Header align="right">Acciones</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredOrders.length === 0 ? (
                <Table.Empty
                  colSpan={6}
                  message={searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                    ? "No hay ordenes que coincidan con los filtros"
                    : "No hay ordenes registradas"}
                />
              ) : (
                filteredOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <Table.Row key={order._id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              #{order.orderNumber || order._id?.toString()?.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items?.length || 0} productos
                            </p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.customer?.name || 'Cliente'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.customer?.phone || '-'}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${order.total?.toLocaleString() || 0}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="center">
                        <Badge variant={config.variant} size="sm">
                          <StatusIcon size={14} className="mr-1" />
                          {config.label}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatTimeAgo(order.createdAt)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailModal(order)}
                            className="p-2"
                          >
                            <Eye size={16} />
                          </Button>
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStatusChange(order, getNextStatus(order.status))}
                              disabled={updating}
                            >
                              Avanzar
                            </Button>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {filteredOrders.length} ordenes mostradas
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Orden #${selectedOrder?.orderNumber || selectedOrder?._id?.toString()?.slice(-6)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estado actual</p>
                <Badge variant={statusConfig[selectedOrder.status]?.variant || 'default'} size="lg">
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <div className="flex gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder, 'cancelled')}
                    disabled={updating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedOrder, getNextStatus(selectedOrder.status))}
                    disabled={updating}
                  >
                    Avanzar a {statusConfig[getNextStatus(selectedOrder.status)]?.label}
                  </Button>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User size={16} />
                Cliente
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedOrder.customer?.name || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{selectedOrder.customer?.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {typeof selectedOrder.deliveryAddress === 'object'
                      ? `${selectedOrder.deliveryAddress?.street || ''}${selectedOrder.deliveryAddress?.reference ? ` (${selectedOrder.deliveryAddress.reference})` : ''}`
                      : selectedOrder.deliveryAddress || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package size={16} />
                Productos
              </h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600">
                        {item.quantity || 1}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {item.product?.name || item.name || 'Producto'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    ${(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString()}
                  </span>
                </div>
                {selectedOrder.deliveryCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Envio</span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedOrder.deliveryCost?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${selectedOrder.total?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar size={16} />
              <span>Creada: {formatDate(selectedOrder.createdAt)}</span>
            </div>
          </div>
        )}

        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDetailModalOpen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;
