import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Star,
  Plus,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import {
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineCurrencyDollar,
  HiOutlineRefresh,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineChevronRight,
  HiOutlinePlus,
  HiOutlineClipboardList,
  HiOutlineChartBar,
} from 'react-icons/hi';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAuth } from '../../context/AuthContext';
import { orderStatusConfig, getStatusClasses } from '../../config/statusConfig';

// Mobile Quick Action Button
const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all"
  >
    <div className="w-10 h-10 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center">
      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </div>
    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
  </button>
);

// Mobile Order Card
const MobileOrderCard = ({ order }) => {
  const status = orderStatusConfig[order.status] || orderStatusConfig.pending;

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <HiOutlineShoppingCart className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            #{order.id}
          </p>
          <p className="text-xs text-gray-500">{order.business}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          ${order.total?.toLocaleString() || 0}
        </p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgClass} ${status.textClass}`}>
          {status.label}
        </span>
      </div>
    </div>
  );
};

// Mobile Business Card (Top Businesses)
const MobileBusinessCard = ({ business, rank }) => {
  const rankColors = {
    1: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    2: 'bg-gray-200 text-gray-600 dark:bg-gray-600',
    3: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className={`w-8 h-8 ${rankColors[rank] || 'bg-gray-100 text-gray-500 dark:bg-gray-700'} rounded-lg flex items-center justify-center text-sm font-bold`}>
        {rank}°
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {business.name}
        </p>
        <p className="text-xs text-gray-500">{business.totalOrders} ordenes</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-emerald-600">
          ${business.totalRevenue?.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    ordersToday: 0,
    revenueToday: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
  });

  const [globalStats, setGlobalStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Get current date formatted
  const getCurrentDate = () => {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return now.toLocaleDateString('es-MX', options);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [businessesRes, usersRes, ordersRes, globalStatsRes] = await Promise.all([
        authFetch(ENDPOINTS.businesses.all),
        authFetch(ENDPOINTS.users.base),
        authFetch(ENDPOINTS.orders.base),
        authFetch(ENDPOINTS.stats.global),
      ]);

      const businessesData = await businessesRes.json();
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      let globalStatsData = null;
      if (globalStatsRes.ok) {
        const gsData = await globalStatsRes.json();
        globalStatsData = gsData.data || gsData;
      }

      const businesses = businessesData.businesses || businessesData.response || businessesData.data || (Array.isArray(businessesData) ? businessesData : []);
      const users = usersData.users || usersData.response || usersData.data || (Array.isArray(usersData) ? usersData : []);
      const orders = ordersData.orders || ordersData.response || ordersData.data || (Array.isArray(ordersData) ? ordersData : []);

      if (globalStatsData) {
        setStats({
          totalBusinesses: businesses.length,
          totalUsers: users.length,
          ordersToday: globalStatsData.today?.orders || 0,
          revenueToday: globalStatsData.today?.revenue || 0,
          ordersGrowth: globalStatsData.today?.ordersGrowth || 0,
          revenueGrowth: globalStatsData.today?.revenueGrowth || 0,
        });
        setGlobalStats(globalStatsData);
      } else {
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = orders.filter(o => {
          const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
          return orderDate === today;
        });
        const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0);

        setStats({
          totalBusinesses: businesses.length,
          totalUsers: users.length,
          ordersToday: ordersToday.length,
          revenueToday: revenueToday,
          ordersGrowth: 0,
          revenueGrowth: 0,
        });
      }

      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 8).map(order => ({
        id: order.orderNumber || order._id?.slice(-6),
        business: order.business?.name || 'Negocio',
        customer: order.customerId?.name || order.customer?.name || 'Cliente',
        total: order.total || 0,
        status: order.status || 'pending',
        time: getTimeAgo(order.createdAt),
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar datos del dashboard');
      setStats({
        totalBusinesses: 0,
        totalUsers: 0,
        ordersToday: 0,
        revenueToday: 0,
        ordersGrowth: 0,
        revenueGrowth: 0,
      });
      setRecentOrders([]);
      setGlobalStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '-';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const chartData = globalStats?.last7Days || [];
  const topBusinesses = globalStats?.topBusinesses || [];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const formatGrowth = (value) => {
    if (value === 0) return null;
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? 'pb-24' : ''}`}>
        <div className="p-4 space-y-4">
          {/* Header skeleton */}
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
        {/* Header - Clean, no gradient */}
        <div className="px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Hola, {user?.name?.split(' ')[0] || 'Admin'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {getCurrentDate()}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats Cards - 2x2 Grid with consistent styling */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Pedidos Hoy */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineShoppingCart className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.ordersToday}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Pedidos hoy</span>
                {stats.ordersGrowth !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${stats.ordersGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats.ordersGrowth > 0 ? <HiOutlineTrendingUp className="w-3 h-3" /> : <HiOutlineTrendingDown className="w-3 h-3" />}
                    {formatGrowth(stats.ordersGrowth)}
                  </span>
                )}
              </div>
            </div>

            {/* Ingresos Hoy */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.revenueToday.toLocaleString()}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-500">Ingresos hoy</span>
                {stats.revenueGrowth !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${stats.revenueGrowth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {stats.revenueGrowth > 0 ? <HiOutlineTrendingUp className="w-3 h-3" /> : <HiOutlineTrendingDown className="w-3 h-3" />}
                    {formatGrowth(stats.revenueGrowth)}
                  </span>
                )}
              </div>
            </div>

            {/* Negocios */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineOfficeBuilding className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBusinesses}
              </p>
              <span className="text-xs text-gray-500">Negocios activos</span>
            </div>

            {/* Usuarios */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineUsers className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <span className="text-xs text-gray-500">Usuarios totales</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Accesos rapidos
          </h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickActionButton
              icon={HiOutlinePlus}
              label="Negocio"
              onClick={() => navigate('/admin/businesses')}
            />
            <QuickActionButton
              icon={HiOutlineUsers}
              label="Usuario"
              onClick={() => navigate('/admin/users')}
            />
            <QuickActionButton
              icon={HiOutlineClipboardList}
              label="Pedidos"
              onClick={() => navigate('/admin/activity')}
            />
            <QuickActionButton
              icon={HiOutlineChartBar}
              label="Reportes"
              onClick={() => navigate('/admin/activity')}
            />
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 0 && (
          <div className="px-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  Ultimos 7 dias
                </h3>
                <span className="text-xs text-gray-500">
                  ${chartData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
                </span>
              </div>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#6366F1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Top Businesses */}
        {topBusinesses.length > 0 && (
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Top Negocios
              </h2>
              <button
                onClick={() => navigate('/admin/businesses')}
                className="text-xs text-indigo-600 font-medium flex items-center gap-1"
              >
                Ver todos
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {topBusinesses.slice(0, 3).map((business, idx) => (
                <MobileBusinessCard key={business.businessId || idx} business={business} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div className="px-4 mt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Pedidos recientes
            </h2>
            <button
              onClick={() => navigate('/admin/activity')}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              Ver todos
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
              <HiOutlineShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay pedidos recientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((order, idx) => (
                <MobileOrderCard key={idx} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  const statsCards = [
    {
      title: 'Pedidos Hoy',
      value: stats.ordersToday,
      change: formatGrowth(stats.ordersGrowth) || '-',
      changeType: stats.ordersGrowth > 0 ? 'positive' : stats.ordersGrowth < 0 ? 'negative' : 'neutral',
      icon: <ShoppingCart size={20} />,
      iconVariant: 'primary',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.revenueToday.toLocaleString()}`,
      change: formatGrowth(stats.revenueGrowth) || '-',
      changeType: stats.revenueGrowth > 0 ? 'positive' : stats.revenueGrowth < 0 ? 'negative' : 'neutral',
      icon: <DollarSign size={20} />,
      iconVariant: 'success',
    },
    {
      title: 'Negocios Activos',
      value: stats.totalBusinesses,
      change: '-',
      changeType: 'neutral',
      icon: <Building2 size={20} />,
      iconVariant: 'purple',
    },
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      change: '-',
      changeType: 'neutral',
      icon: <Users size={20} />,
      iconVariant: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hola, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">
            {getCurrentDate()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button
            onClick={() => navigate('/admin/activity')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <ArrowUpRight size={18} />
            Ver actividad
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Ingresos - Ultimos 7 dias</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#6366F1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Top Businesses */}
        <Card>
          <Card.Header>
            <Card.Title>Top Negocios</Card.Title>
            <Card.Description>Por ventas (30 dias)</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {topBusinesses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay datos</p>
              ) : (
                topBusinesses.slice(0, 5).map((business, i) => (
                  <div
                    key={business.businessId || i}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                          ${i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : ''}
                          ${i === 1 ? 'bg-gray-200 text-gray-600 dark:bg-gray-600' : ''}
                          ${i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' : ''}
                          ${i > 2 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700' : ''}
                        `}
                      >
                        {i + 1}°
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500">{business.totalOrders} ord.</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">
                      ${business.totalRevenue?.toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <Card.Header
          action={
            <button
              onClick={() => navigate('/admin/activity')}
              className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700"
            >
              Ver todos
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          }
        >
          <Card.Title>Pedidos Recientes</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay pedidos recientes</p>
            ) : (
              recentOrders.slice(0, 5).map((order) => {
                const status = orderStatusConfig[order.status] || orderStatusConfig.pending;
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <ShoppingCart size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id} - {order.business}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customer} · Hace {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${order.total?.toLocaleString() || 0}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgClass} ${status.textClass}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;
