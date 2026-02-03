import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingCart,
  DollarSign,
  MapPin,
  Check,
  AlertCircle,
  TrendingUp,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';

// Hook for mobile detection
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

const sortOptions = [
  { value: 'recent', label: 'Mas recientes' },
  { value: 'oldest', label: 'Mas antiguos' },
  { value: 'orders_desc', label: 'Mas ordenes' },
  { value: 'orders_asc', label: 'Menos ordenes' },
  { value: 'spent_desc', label: 'Mayor gasto' },
  { value: 'spent_asc', label: 'Menor gasto' },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning' },
  confirmed: { label: 'Confirmado', color: 'info' },
  preparing: { label: 'Preparando', color: 'info' },
  ready: { label: 'Listo', color: 'primary' },
  delivering: { label: 'En camino', color: 'primary' },
  delivered: { label: 'Entregado', color: 'success' },
  cancelled: { label: 'Cancelado', color: 'danger' },
};

// Mobile Customer Card Component
const MobileCustomerCard = ({ customer, onView, formatDate }) => {
  return (
    <button
      onClick={() => onView(customer)}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4 text-left"
    >
      <div className="flex items-center gap-3">
        <Avatar name={customer.name} size="lg" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {customer.name}
          </h3>
          {customer.email && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <Mail size={12} />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              <Phone size={12} />
              <span>{customer.phone}</span>
            </div>
          )}
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>

      {/* Stats row */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {customer.totalOrders || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ordenes</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            ${(customer.totalSpent || 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Gastado</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            ${customer.totalOrders > 0
              ? Math.round((customer.totalSpent || 0) / customer.totalOrders).toLocaleString()
              : 0
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Promedio</p>
        </div>
      </div>

      {/* Registration date */}
      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
        <Calendar size={12} />
        Cliente desde: {formatDate(customer.registeredAt)}
      </div>
    </button>
  );
};

const Customers = () => {
  const isMobile = useIsMobile();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${ENDPOINTS.users.base}?role=customer`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar clientes');
      }

      const usersData = data.users || data.response || data.data || (Array.isArray(data) ? data : []);

      const customersWithStats = usersData.map(user => ({
        _id: user._id,
        name: user.name || 'Sin nombre',
        email: user.email || '',
        phone: user.phone || '',
        registeredAt: user.createdAt || new Date().toISOString(),
        totalOrders: user.ordersCount || 0,
        totalSpent: user.totalSpent || 0,
        lastOrderDate: user.lastOrderDate || user.createdAt,
        address: user.address || '',
      }));

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
      showToast('Error al cargar los clientes', 'error');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    setLoadingOrders(true);
    try {
      const response = await authFetch(`${ENDPOINTS.orders.base}?customerId=${customerId}`);
      const data = await response.json();

      if (response.ok) {
        const ordersData = data.orders || data.response || data.data || (Array.isArray(data) ? data : []);
        setCustomerOrders(ordersData.slice(0, 10));
      } else {
        setCustomerOrders([]);
      }
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (customer.name || '').toLowerCase().includes(searchLower) ||
        (customer.email || '').toLowerCase().includes(searchLower) ||
        (customer.phone || '').includes(searchQuery)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.registeredAt) - new Date(b.registeredAt);
        case 'recent':
          return new Date(b.registeredAt) - new Date(a.registeredAt);
        case 'orders_desc':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        case 'orders_asc':
          return (a.totalOrders || 0) - (b.totalOrders || 0);
        case 'spent_desc':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'spent_asc':
          return (a.totalSpent || 0) - (b.totalSpent || 0);
        default:
          return 0;
      }
    });

  // Calculate stats for mobile header
  const totalCustomers = customers.length;
  const newCustomersThisMonth = customers.filter(c => {
    const registeredDate = new Date(c.registeredAt);
    const now = new Date();
    return registeredDate.getMonth() === now.getMonth() && registeredDate.getFullYear() === now.getFullYear();
  }).length;
  const customersWithOrders = customers.filter(c => (c.totalOrders || 0) > 0).length;

  const openDetailModal = async (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
    await fetchCustomerOrders(customer._id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Detail modal content
  const renderDetailContent = () => {
    if (!selectedCustomer) return null;

    return (
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
                {selectedCustomer.email || '-'}
              </div>
              {selectedCustomer.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone size={14} className="text-gray-400" />
                  {selectedCustomer.phone}
                </div>
              )}
              {selectedCustomer.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin size={14} className="text-gray-400" />
                  {selectedCustomer.address}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-3 text-center">
            <ShoppingCart size={20} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {selectedCustomer.totalOrders || 0}
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400">Ordenes</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
            <DollarSign size={20} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              ${(selectedCustomer.totalSpent || 0).toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Gastado</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 text-center">
            <TrendingUp size={20} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
              ${selectedCustomer.totalOrders > 0
                ? ((selectedCustomer.totalSpent || 0) / selectedCustomer.totalOrders).toFixed(0)
                : 0
              }
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Promedio</p>
          </div>
        </div>

        {/* Order History */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Historial de Ordenes
          </h4>
          {loadingOrders ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : customerOrders.length > 0 ? (
            <div className="space-y-2">
              {customerOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Orden #{order.orderNumber || order._id?.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.business?.name || 'Negocio'} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      ${order.total || 0}
                    </span>
                    <Badge variant={statusConfig[order.status]?.color || 'secondary'} size="xs">
                      {statusConfig[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4 text-sm">
              No hay ordenes para mostrar
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
    );
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-4 md:-m-6">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          {/* Title */}
          <div className="px-4 pt-4 pb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Clientes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredCustomers.length} clientes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="px-4 pb-3 grid grid-cols-3 gap-2">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-2.5 text-center">
              <Users size={16} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
              <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                {totalCustomers}
              </p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">Total</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-2.5 text-center">
              <UserPlus size={16} className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {newCustomersThisMonth}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Nuevos</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-2.5 text-center">
              <ShoppingCart size={16} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
              <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                {customersWithOrders}
              </p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400">Con pedidos</p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Sort Selector */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {sortOptions.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'No se encontraron clientes'
                  : 'No hay clientes registrados'
                }
              </p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <MobileCustomerCard
                key={customer._id}
                customer={customer}
                onView={openDetailModal}
                formatDate={formatDate}
              />
            ))
          )}
        </div>

        {/* Detail Modal */}
        <MobileModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCustomer(null);
            setCustomerOrders([]);
          }}
          title="Detalle del Cliente"
          size="xl"
        >
          {renderDetailContent()}
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedCustomer(null);
              setCustomerOrders([]);
            }}>
              Cerrar
            </Button>
          </MobileModal.Footer>
        </MobileModal>
      </div>
    );
  }

  // Desktop Layout
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
                <Table.Row key={customer._id}>
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
                        {customer.email || '-'}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone size={14} className="text-gray-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{formatDate(customer.registeredAt)}</p>
                      {customer.lastOrderDate && (
                        <p className="text-xs text-gray-500">
                          Ultimo pedido: {formatDate(customer.lastOrderDate)}
                        </p>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {customer.totalOrders || 0}
                    </span>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${(customer.totalSpent || 0).toLocaleString()}
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
          setCustomerOrders([]);
        }}
        title="Detalle del Cliente"
        size="lg"
      >
        {renderDetailContent()}
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedCustomer(null);
            setCustomerOrders([]);
          }}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Customers;
