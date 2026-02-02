import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineCube,
  HiOutlineClock,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from 'react-icons/hi';
import { useBusiness } from '../../context/BusinessContext';
import { getMyOrders, getMyBusiness, getMyProducts } from '../../services/api';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600' },
  confirmed: { label: 'Confirmado', color: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600' },
  preparing: { label: 'Preparando', color: 'indigo', bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600' },
  ready: { label: 'Listo', color: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600' },
  delivering: { label: 'En camino', color: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600' },
  delivered: { label: 'Entregado', color: 'gray', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400' },
  cancelled: { label: 'Cancelado', color: 'red', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600' },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [business, setBusiness] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [businessRes, ordersRes, productsRes] = await Promise.all([
        getMyBusiness(),
        getMyOrders(),
        getMyProducts(),
      ]);

      const businessData = businessRes.business || businessRes;
      setBusiness(businessData);

      const ordersData = ordersRes.orders || ordersRes.data || ordersRes || [];
      const ordersList = Array.isArray(ordersData) ? ordersData : [];

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

      // Yesterday stats for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayOrders = ordersList.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === yesterday.getTime();
      });

      const yesterdayRevenue = yesterdayOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      // Products
      const productsData = productsRes.products || productsRes.data || productsRes || [];
      let productsList = [];
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

      // Calculate change percentages
      const ordersChange = yesterdayOrders.length > 0
        ? Math.round(((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100)
        : todayOrders.length > 0 ? 100 : 0;

      const revenueChange = yesterdayRevenue > 0
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
        : todayRevenue > 0 ? 100 : 0;

      setStats({
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
        activeProducts: activeCount,
        ordersChange,
        revenueChange,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <HiOutlineExclamationCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-full text-sm font-medium active:scale-95 transition-transform"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-4">
      {/* Welcome Section */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Hola! 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {business?.name || selectedBusiness?.name || 'Mi Negocio'}
            </p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className={`w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-card flex items-center justify-center active:scale-95 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Business Status Badge */}
        <div className="flex items-center gap-2 mt-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            business?.isOpen
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${business?.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {business?.isOpen ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
      </div>

      {/* Stats Grid - 2x2 */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {/* Orders Today */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HiOutlineShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            {stats?.ordersChange !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs font-medium ${
                stats?.ordersChange > 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stats?.ordersChange > 0 ? <HiOutlineTrendingUp className="w-4 h-4" /> : <HiOutlineTrendingDown className="w-4 h-4" />}
                {Math.abs(stats?.ordersChange || 0)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.todayOrders || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pedidos hoy</p>
        </div>

        {/* Revenue Today */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
            </div>
            {stats?.revenueChange !== 0 && (
              <div className={`flex items-center gap-0.5 text-xs font-medium ${
                stats?.revenueChange > 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {stats?.revenueChange > 0 ? <HiOutlineTrendingUp className="w-4 h-4" /> : <HiOutlineTrendingDown className="w-4 h-4" />}
                {Math.abs(stats?.revenueChange || 0)}%
              </div>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats?.todayRevenue)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ventas hoy</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
            <HiOutlineClock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.pendingOrders || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Pendientes</p>
        </div>

        {/* Active Products */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-2">
            <HiOutlineCube className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.activeProducts || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Productos activos</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold">Pantalla de Cocina</h3>
              <p className="text-primary-100 text-sm mt-0.5">Gestiona pedidos en tiempo real</p>
            </div>
            <button
              onClick={() => navigate('/kitchen')}
              className="px-4 py-2 bg-white text-primary-600 rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              Abrir KDS
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Pedidos recientes
          </h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-primary-600 font-medium flex items-center gap-1"
          >
            Ver todos
            <HiOutlineChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-card text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <HiOutlineShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <button
                  key={order._id}
                  onClick={() => navigate(`/orders`)}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0`}>
                    <HiOutlineShoppingCart className={`w-6 h-6 ${status.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        #{order.orderNumber || order._id?.toString()?.slice(-6)}
                      </p>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {order.customerId?.name || order.customer?.name || 'Cliente'}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} font-medium`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Delivery Info */}
      {business && (
        <div className="px-4 mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Configuracion de envio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Costo de envio</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(business.deliveryCost || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tiempo estimado</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {business.minDeliveryTime || 30}-{business.maxDeliveryTime || 45} min
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
