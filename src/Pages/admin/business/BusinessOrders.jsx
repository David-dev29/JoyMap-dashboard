import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Eye,
  Clock,
  User,
  MapPin,
  Phone,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import { getBusinessOrders, updateOrderStatus } from '../../../services/api';
import NoBusinessSelected from '../../../Components/Dashboard/NoBusinessSelected';

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'preparing', label: 'En preparacion' },
  { value: 'ready', label: 'Listos' },
  { value: 'delivering', label: 'En camino' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'cancelled', label: 'Cancelados' },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'info', icon: CheckCircle },
  preparing: { label: 'Preparando', color: 'primary', icon: ChefHat },
  ready: { label: 'Listo', color: 'info', icon: Package },
  delivering: { label: 'En camino', color: 'primary', icon: Truck },
  delivered: { label: 'Entregado', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

const BusinessOrders = () => {
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Detail modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      if (!selectedBusiness) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBusinessOrders(selectedBusiness._id);
        const ordersData = response.orders || response.data || response || [];
        // Sort by date descending
        ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersData);
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [selectedBusiness]);

  // Guard: No business selected
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return (
      <NoBusinessSelected
        icon={ShoppingCart}
        title="Selecciona un negocio"
        message="Para ver los pedidos, primero selecciona un negocio desde el selector en la barra superior."
      />
    );
  }

  // Loading state
  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando pedidos...</span>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery ||
      order.orderNumber?.toString().includes(searchQuery) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      matchesDate = orderDate === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
  };

  const getItemsCount = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    return 0;
  };

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
      );

      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pedidos del Negocio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los pedidos de {selectedBusiness?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning" size="md">
            {stats.pending} pendientes
          </Badge>
          <Badge variant="primary" size="md">
            {stats.preparing} en preparacion
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total pedidos</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{stats.preparing}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">En proceso</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.delivered}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Entregados</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por #orden, cliente o telefono..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full md:w-44"
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header># Orden</Table.Header>
              <Table.Header>Cliente</Table.Header>
              <Table.Header align="center">Items</Table.Header>
              <Table.Header align="right">Total</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header>Fecha</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredOrders.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={searchQuery || statusFilter !== 'all' || dateFilter
                  ? 'No se encontraron pedidos con esos filtros'
                  : 'No hay pedidos registrados'
                }
              />
            ) : (
              filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Clock;
                return (
                  <Table.Row key={order._id}>
                    <Table.Cell>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        #{order.orderNumber || order._id?.slice(-6)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.customer?.name || 'Cliente'}
                        </p>
                        {order.customer?.phone && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.customer.phone}
                          </p>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Badge variant="secondary" size="sm">
                        {getItemsCount(order)} items
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={statusConfig[order.status]?.color || 'secondary'}
                        size="sm"
                      >
                        <StatusIcon size={14} className="mr-1" />
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetailModal(order)}
                        className="p-2"
                      >
                        <Eye size={16} />
                      </Button>
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
        Mostrando {filteredOrders.length} de {orders.length} pedidos
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Pedido #${selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Badge
                  variant={statusConfig[selectedOrder.status]?.color || 'secondary'}
                  size="lg"
                >
                  {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <Select
                options={statusOptions.filter(s => s.value !== 'all')}
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                disabled={updatingStatus}
                className="w-40"
              />
            </div>

            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <User size={18} />
                Informacion del Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {selectedOrder.customer?.name || 'No especificado'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {selectedOrder.customer?.phone || 'No especificado'}
                  </span>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div className="flex items-start gap-2 text-sm md:col-span-2">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {selectedOrder.deliveryAddress}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package size={18} />
                Productos ({getItemsCount(selectedOrder)} items)
              </h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image.startsWith('http') ? item.image : `https://${item.image}`}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} x {item.quantity || 1}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency((item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.subtotal || selectedOrder.total)}
                  </span>
                </div>
                {selectedOrder.deliveryCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Envio</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(selectedOrder.deliveryCost)}
                    </span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Descuento</span>
                    <span className="text-emerald-600">
                      -{formatCurrency(selectedOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">
                  Notas del cliente:
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        )}
        <Modal.Footer>
          <Button
            variant="ghost"
            onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedOrder(null);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BusinessOrders;
