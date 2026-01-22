import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Phone,
  DollarSign,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar } from '../../components/ui';

// Mock data
const mockOrders = [
  {
    id: '1001',
    business: { id: 1, name: 'El Buen Sabor' },
    customer: { name: 'Juan Perez', email: 'juan@email.com', phone: '+52 999 123 4567' },
    items: [
      { name: 'Tacos al Pastor x3', price: 75, quantity: 1 },
      { name: 'Quesadilla', price: 45, quantity: 2 },
      { name: 'Agua de Horchata', price: 25, quantity: 1 },
    ],
    subtotal: 190,
    delivery: 35,
    discount: 20,
    total: 205,
    status: 'delivered',
    paymentMethod: 'card',
    date: '2024-01-21T14:30:00',
    deliveryAddress: 'Calle 60 #123, Centro, Merida',
  },
  {
    id: '1002',
    business: { id: 2, name: 'Pizza Express' },
    customer: { name: 'Maria Garcia', email: 'maria@email.com', phone: '+52 999 234 5678' },
    items: [
      { name: 'Pizza Pepperoni Grande', price: 189, quantity: 1 },
      { name: 'Refresco 2L', price: 35, quantity: 1 },
    ],
    subtotal: 224,
    delivery: 0,
    discount: 0,
    total: 224,
    status: 'preparing',
    paymentMethod: 'cash',
    date: '2024-01-21T15:00:00',
    deliveryAddress: 'Av. Itzaes #456, Col. Centro',
  },
  {
    id: '1003',
    business: { id: 3, name: 'Sushi Master' },
    customer: { name: 'Carlos Lopez', email: 'carlos@email.com', phone: '+52 999 345 6789' },
    items: [
      { name: 'Combo Familiar', price: 450, quantity: 1 },
      { name: 'Sake', price: 120, quantity: 1 },
    ],
    subtotal: 570,
    delivery: 45,
    discount: 50,
    total: 565,
    status: 'pending',
    paymentMethod: 'card',
    date: '2024-01-21T15:15:00',
    deliveryAddress: 'Calle 35 #789, Fracc. Las Americas',
  },
  {
    id: '1004',
    business: { id: 4, name: 'Cafe Central' },
    customer: { name: 'Ana Martinez', email: 'ana@email.com', phone: '+52 999 456 7890' },
    items: [
      { name: 'Cappuccino', price: 55, quantity: 2 },
      { name: 'Croissant', price: 35, quantity: 2 },
    ],
    subtotal: 180,
    delivery: 25,
    discount: 0,
    total: 205,
    status: 'ready',
    paymentMethod: 'card',
    date: '2024-01-21T13:45:00',
    deliveryAddress: 'Calle 50 #321, Centro',
  },
  {
    id: '1005',
    business: { id: 1, name: 'El Buen Sabor' },
    customer: { name: 'Pedro Sanchez', email: 'pedro@email.com', phone: '+52 999 567 8901' },
    items: [
      { name: 'Enchiladas Verdes', price: 95, quantity: 1 },
      { name: 'Tacos de Carnitas x4', price: 100, quantity: 1 },
    ],
    subtotal: 195,
    delivery: 35,
    discount: 0,
    total: 230,
    status: 'cancelled',
    paymentMethod: 'cash',
    date: '2024-01-21T12:30:00',
    deliveryAddress: 'Av. Prolongacion Montejo #111',
    cancelReason: 'Cliente no disponible',
  },
  {
    id: '1006',
    business: { id: 2, name: 'Pizza Express' },
    customer: { name: 'Laura Torres', email: 'laura@email.com', phone: '+52 999 678 9012' },
    items: [
      { name: 'Pizza Hawaiana Mediana', price: 149, quantity: 1 },
      { name: 'Palitos de Ajo', price: 65, quantity: 1 },
    ],
    subtotal: 214,
    delivery: 35,
    discount: 0,
    total: 249,
    status: 'delivered',
    paymentMethod: 'card',
    date: '2024-01-21T11:00:00',
    deliveryAddress: 'Calle 21 #456, Col. Garcia Gineres',
  },
  {
    id: '1007',
    business: { id: 5, name: 'Taqueria Don Jose' },
    customer: { name: 'Diego Ruiz', email: 'diego@email.com', phone: '+52 999 789 0123' },
    items: [
      { name: 'Orden de Tacos x6', price: 120, quantity: 1 },
      { name: 'Guacamole', price: 45, quantity: 1 },
      { name: 'Agua de Jamaica', price: 25, quantity: 2 },
    ],
    subtotal: 215,
    delivery: 30,
    discount: 15,
    total: 230,
    status: 'delivered',
    paymentMethod: 'cash',
    date: '2024-01-20T19:30:00',
    deliveryAddress: 'Calle 25 #789, Centro',
  },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  preparing: { label: 'Preparando', color: 'info', icon: Package },
  ready: { label: 'Listo', color: 'primary', icon: CheckCircle },
  delivered: { label: 'Entregado', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

const mockBusinesses = [
  { value: '', label: 'Todos los negocios' },
  { value: '1', label: 'El Buen Sabor' },
  { value: '2', label: 'Pizza Express' },
  { value: '3', label: 'Sushi Master' },
  { value: '4', label: 'Cafe Central' },
  { value: '5', label: 'Taqueria Don Jose' },
];

const SalesHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 500);
  }, []);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      order.id.includes(searchQuery) ||
      order.customer.name.toLowerCase().includes(searchLower) ||
      order.business.name.toLowerCase().includes(searchLower);
    const matchesBusiness = !businessFilter || order.business.id.toString() === businessFilter;
    const matchesStatus = !statusFilter || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter) {
      const orderDate = new Date(order.date).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      matchesDate = orderDate === filterDate;
    }

    return matchesSearch && matchesBusiness && matchesStatus && matchesDate;
  });

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
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
              options={mockBusinesses}
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
                { value: 'preparing', label: 'Preparando' },
                { value: 'ready', label: 'Listo' },
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
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                return (
                  <Table.Row key={order.id}>
                    <Table.Cell>
                      <span className="font-mono font-semibold text-gray-900 dark:text-white">
                        #{order.id}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {order.business.name}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <Avatar name={order.customer.name} size="sm" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer.name}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-500">
                        {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${order.total}
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
                        <p className="text-gray-900 dark:text-white">{formatDate(order.date)}</p>
                        <p className="text-xs text-gray-500">{formatTime(order.date)}</p>
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
        title={`Orden #${selectedOrder?.id}`}
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
                    {selectedOrder.business.name}
                  </p>
                  <p className="text-sm text-gray-500">{formatDateTime(selectedOrder.date)}</p>
                </div>
              </div>
              <Badge variant={statusConfig[selectedOrder.status].color} size="md">
                {statusConfig[selectedOrder.status].label}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Cliente</h4>
              <div className="flex items-start gap-3">
                <Avatar name={selectedOrder.customer.name} size="md" />
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedOrder.customer.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone size={14} />
                    {selectedOrder.customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={14} />
                    {selectedOrder.deliveryAddress}
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Productos</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 dark:text-white">${selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Envio</span>
                <span className="text-gray-900 dark:text-white">
                  {selectedOrder.delivery > 0 ? `$${selectedOrder.delivery}` : 'Gratis'}
                </span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Descuento</span>
                  <span className="text-emerald-600 dark:text-emerald-400">-${selectedOrder.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-indigo-600 dark:text-indigo-400">${selectedOrder.total}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Metodo de pago</span>
              </div>
              <Badge variant={selectedOrder.paymentMethod === 'card' ? 'primary' : 'default'}>
                {selectedOrder.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}
              </Badge>
            </div>

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
