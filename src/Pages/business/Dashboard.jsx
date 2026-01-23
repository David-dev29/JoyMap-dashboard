import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  MoreHorizontal,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { useBusiness } from '../../context/BusinessContext';
import { getMyOrdersStats, getMyOrders, getMyBusiness, getMyProducts } from '../../services/api';

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivering: 'primary',
  delivered: 'default',
  cancelled: 'danger',
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo',
  delivering: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeProducts, setActiveProducts] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [businessRes, ordersRes, productsRes] = await Promise.all([
        getMyBusiness(),
        getMyOrders(),
        getMyProducts(),
      ]);

      console.log('=== DEBUG Business Dashboard ===');
      console.log('Business:', businessRes);
      console.log('Orders:', ordersRes);
      console.log('Products:', productsRes);

      // Process business data
      const businessData = businessRes.business || businessRes;
      setBusiness(businessData);

      // Process orders data
      const ordersData = ordersRes.orders || ordersRes.data || ordersRes || [];
      const ordersList = Array.isArray(ordersData) ? ordersData : [];

      // Get recent orders (last 5)
      const sortedOrders = [...ordersList].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentOrders(sortedOrders.slice(0, 5));

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = ordersList.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

      const todayRevenue = todayOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const pendingOrders = ordersList.filter(o =>
        ['pending', 'confirmed', 'preparing'].includes(o.status)
      ).length;

      // Process products data
      const productsData = productsRes.products || productsRes.data || productsRes || [];
      let productsList = [];

      // Handle if products come nested in categories
      if (Array.isArray(productsData)) {
        productsData.forEach(item => {
          if (item.products && Array.isArray(item.products)) {
            productsList = [...productsList, ...item.products];
          } else {
            productsList.push(item);
          }
        });
      }

      const activeCount = productsList.filter(p => p.isAvailable !== false).length;
      setActiveProducts(activeCount);

      // Set stats
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
        activeProducts: activeCount,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
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

  const statsCards = [
    {
      title: 'Pedidos Hoy',
      value: stats?.todayOrders || 0,
      icon: <ShoppingCart size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Ventas Hoy',
      value: `$${(stats?.todayRevenue || 0).toLocaleString()}`,
      icon: <DollarSign size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Productos Activos',
      value: stats?.activeProducts || 0,
      icon: <Package size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ordenes Pendientes',
      value: stats?.pendingOrders || 0,
      icon: <Clock size={22} />,
      iconVariant: 'warning',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {business?.name || selectedBusiness?.name || 'Mi Negocio'} - Resumen del dia
          </p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25"
        >
          <Plus size={18} />
          Nuevo pedido
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <Card.Header
            action={
              <div className="flex items-center gap-2">
                <Badge variant="primary">{recentOrders.length} recientes</Badge>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreHorizontal size={18} className="text-gray-400" />
                </button>
              </div>
            }
          >
            <Card.Title>Pedidos Recientes</Card.Title>
            <Card.Description>Ultimos pedidos recibidos</Card.Description>
          </Card.Header>
          <Card.Content>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay pedidos recientes
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Pedido #{order.orderNumber || order._id?.toString()?.slice(-6)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer?.name || 'Cliente'} - {formatTimeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${order.total || 0}
                      </span>
                      <Badge variant={statusColors[order.status] || 'default'} size="sm">
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <Card>
          <Card.Header
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            }
          >
            <Card.Title>Estado del Negocio</Card.Title>
            <Card.Description>Resumen rapido</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-5">
              {/* Business Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                <Badge variant={business?.isOpen ? 'success' : 'danger'} size="sm">
                  {business?.isOpen ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>

              {/* Today Progress */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pedidos completados hoy</span>
                  <span className="text-sm font-semibold text-emerald-500">
                    {recentOrders.filter(o => o.status === 'delivered').length}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${stats?.todayOrders > 0
                        ? (recentOrders.filter(o => o.status === 'delivered').length / stats.todayOrders) * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Pending */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ordenes pendientes</span>
                  <span className="text-sm font-semibold text-amber-500">{stats?.pendingOrders || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min((stats?.pendingOrders || 0) * 10, 100)}%` }}
                  />
                </div>
              </div>

              {/* Products */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Productos activos</span>
                  <span className="text-sm font-semibold text-indigo-500">{stats?.activeProducts || 0}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-2 bg-indigo-500 rounded-full transition-all"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Delivery Info */}
              {business && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Costo de envio</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${business.deliveryCost || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Tiempo de entrega</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {business.minDeliveryTime || 30}-{business.maxDeliveryTime || 45} min
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;
