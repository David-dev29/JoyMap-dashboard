import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar } from '../../components/ui';

// Mock data
const mockCustomers = [
  {
    id: 1,
    name: 'Juan Perez',
    email: 'juan.perez@email.com',
    phone: '+52 999 123 4567',
    registeredAt: '2024-01-15',
    totalOrders: 45,
    totalSpent: 4520,
    lastOrderDate: '2024-01-20',
    address: 'Calle 60 #123, Centro, Merida',
    orders: [
      { id: '1001', date: '2024-01-20', total: 185, status: 'delivered', business: 'El Buen Sabor' },
      { id: '998', date: '2024-01-18', total: 92, status: 'delivered', business: 'Pizza Express' },
      { id: '995', date: '2024-01-15', total: 156, status: 'delivered', business: 'Sushi Master' },
    ],
  },
  {
    id: 2,
    name: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    phone: '+52 999 234 5678',
    registeredAt: '2024-01-10',
    totalOrders: 32,
    totalSpent: 3280,
    lastOrderDate: '2024-01-19',
    address: 'Av. Itzaes #456, Col. Centro',
    orders: [
      { id: '999', date: '2024-01-19', total: 78, status: 'delivered', business: 'Cafe Central' },
      { id: '990', date: '2024-01-16', total: 145, status: 'delivered', business: 'El Buen Sabor' },
    ],
  },
  {
    id: 3,
    name: 'Carlos Lopez',
    email: 'carlos.lopez@email.com',
    phone: '+52 999 345 6789',
    registeredAt: '2024-01-05',
    totalOrders: 28,
    totalSpent: 2150,
    lastOrderDate: '2024-01-21',
    address: 'Calle 35 #789, Fracc. Las Americas',
    orders: [
      { id: '1002', date: '2024-01-21', total: 210, status: 'preparing', business: 'Pizza Express' },
    ],
  },
  {
    id: 4,
    name: 'Ana Martinez',
    email: 'ana.martinez@email.com',
    phone: '+52 999 456 7890',
    registeredAt: '2023-12-20',
    totalOrders: 56,
    totalSpent: 6890,
    lastOrderDate: '2024-01-20',
    address: 'Calle 50 #321, Centro',
    orders: [],
  },
  {
    id: 5,
    name: 'Pedro Sanchez',
    email: 'pedro.sanchez@email.com',
    phone: '+52 999 567 8901',
    registeredAt: '2024-01-18',
    totalOrders: 8,
    totalSpent: 720,
    lastOrderDate: '2024-01-21',
    address: 'Av. Prolongacion Montejo #111',
    orders: [],
  },
  {
    id: 6,
    name: 'Laura Torres',
    email: 'laura.torres@email.com',
    phone: '+52 999 678 9012',
    registeredAt: '2023-11-15',
    totalOrders: 89,
    totalSpent: 12450,
    lastOrderDate: '2024-01-19',
    address: 'Calle 21 #456, Col. Garcia Gineres',
    orders: [],
  },
  {
    id: 7,
    name: 'Diego Ruiz',
    email: 'diego.ruiz@email.com',
    phone: '+52 999 789 0123',
    registeredAt: '2024-01-12',
    totalOrders: 15,
    totalSpent: 1890,
    lastOrderDate: '2024-01-17',
    address: 'Calle 25 #789, Centro',
    orders: [],
  },
  {
    id: 8,
    name: 'Sofia Morales',
    email: 'sofia.morales@email.com',
    phone: '+52 999 890 1234',
    registeredAt: '2023-10-05',
    totalOrders: 120,
    totalSpent: 15680,
    lastOrderDate: '2024-01-21',
    address: 'Av. Yucatan #234, Col. Itzimna',
    orders: [],
  },
];

const sortOptions = [
  { value: 'recent', label: 'Mas recientes' },
  { value: 'oldest', label: 'Mas antiguos' },
  { value: 'orders_desc', label: 'Mas ordenes' },
  { value: 'orders_asc', label: 'Menos ordenes' },
  { value: 'spent_desc', label: 'Mayor gasto' },
  { value: 'spent_asc', label: 'Menor gasto' },
];

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    setLoading(true);
    setTimeout(() => {
      setCustomers(mockCustomers);
      setLoading(false);
    }, 500);
  }, []);

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchQuery)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.registeredAt) - new Date(b.registeredAt);
        case 'recent':
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        case 'orders_desc':
          return b.totalOrders - a.totalOrders;
        case 'orders_asc':
          return a.totalOrders - b.totalOrders;
        case 'spent_desc':
          return b.totalSpent - a.totalSpent;
        case 'spent_asc':
          return a.totalSpent - b.totalSpent;
        default:
          return 0;
      }
    });

  const openDetailModal = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'warning' },
    preparing: { label: 'Preparando', color: 'info' },
    ready: { label: 'Listo', color: 'primary' },
    delivered: { label: 'Entregado', color: 'success' },
    cancelled: { label: 'Cancelado', color: 'danger' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Todos los clientes registrados en la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            {filteredCustomers.length} clientes
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, email o telefono..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            placeholder=""
            fullWidth={false}
            className="w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Cliente</Table.Header>
              <Table.Header>Contacto</Table.Header>
              <Table.Header>Registro</Table.Header>
              <Table.Header align="right">Ordenes</Table.Header>
              <Table.Header align="right">Total Gastado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={6} />
            ) : filteredCustomers.length === 0 ? (
              <Table.Empty
                colSpan={6}
                message={searchQuery
                  ? 'No se encontraron clientes con esa busqueda'
                  : 'No hay clientes registrados'
                }
              />
            ) : (
              filteredCustomers.map((customer) => (
                <Table.Row key={customer.id}>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <Avatar name={customer.name} size="md" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {customer.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Mail size={14} className="text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Phone size={14} className="text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{formatDate(customer.registeredAt)}</p>
                      <p className="text-xs text-gray-500">
                        Ultimo pedido: {formatDate(customer.lastOrderDate)}
                      </p>
                    </div>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customer.totalOrders}
                    </span>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${customer.totalSpent.toLocaleString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye size={16} />}
                      onClick={() => openDetailModal(customer)}
                    >
                      Ver
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCustomer(null);
        }}
        title="Detalle del Cliente"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="flex items-start gap-4">
              <Avatar name={selectedCustomer.name} size="xl" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedCustomer.name}
                </h3>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Mail size={14} className="text-gray-400" />
                    {selectedCustomer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Phone size={14} className="text-gray-400" />
                    {selectedCustomer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin size={14} className="text-gray-400" />
                    {selectedCustomer.address}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center">
                <ShoppingCart size={24} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {selectedCustomer.totalOrders}
                </p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400">Ordenes</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-center">
                <DollarSign size={24} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  ${selectedCustomer.totalSpent.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Total Gastado</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 text-center">
                <Calendar size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ${(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(0)}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Ticket Prom.</p>
              </div>
            </div>

            {/* Order History */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Historial de Ordenes
              </h4>
              {selectedCustomer.orders.length > 0 ? (
                <div className="space-y-2">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Orden #{order.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.business} · {formatDate(order.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${order.total}
                        </span>
                        <Badge variant={statusConfig[order.status]?.color} size="sm">
                          {statusConfig[order.status]?.label}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No hay ordenes recientes para mostrar
                </p>
              )}
            </div>

            {/* Registration Info */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500">
                Cliente desde: <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedCustomer.registeredAt)}
                </span>
              </p>
            </div>
          </div>
        )}
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedCustomer(null);
          }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Customers;
