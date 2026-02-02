import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Star,
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
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'info', icon: Clock },
  preparing: { label: 'Preparando', color: 'info', icon: Clock },
  ready: { label: 'Listo', color: 'primary', icon: CheckCircle },
  delivering: { label: 'En camino', color: 'primary', icon: Clock },
  delivered: { label: 'Entregado', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

// Mobile Quick Action Card
const QuickActionCard = ({ icon: Icon, label, value, onClick, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-card active:scale-95 transition-transform"
    >
      <div className={`w-12 h-12 ${colors[color]} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
      {value !== undefined && (
        <span className="text-xs text-gray-500">{value}</span>
      )}
    </button>
  );
};

// Mobile Order Card
const MobileOrderCard = ({ order, statusConfig }) => {
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
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
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          status.color === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          status.color === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
          status.color === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {status.label}
        </span>
      </div>
    </div>
  );
};

// Mobile Business Card
const MobileBusinessCard = ({ business, rank }) => {
  const rankColors = {
    1: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    2: 'bg-gray-200 text-gray-600 dark:bg-gray-600',
    3: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-card">
      <div className={`w-8 h-8 ${rankColors[rank] || 'bg-gray-100 text-gray-500 dark:bg-gray-700'} rounded-lg flex items-center justify-center text-sm font-bold`}>
        {rank}
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
  const [loading, setLoading] = useState(true);

  // Basic stats (from existing endpoints)
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    ordersToday: 0,
    revenueToday: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
  });

  // Global stats from new endpoint
  const [globalStats, setGlobalStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel (including new global stats endpoint)
      const [businessesRes, usersRes, ordersRes, globalStatsRes] = await Promise.all([
        authFetch(ENDPOINTS.businesses.all),
        authFetch(ENDPOINTS.users.base),
        authFetch(ENDPOINTS.orders.base),
        authFetch(ENDPOINTS.stats.global),
      ]);

      const businessesData = await businessesRes.json();
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      // Handle global stats response
      let globalStatsData = null;
      if (globalStatsRes.ok) {
        const gsData = await globalStatsRes.json();
        globalStatsData = gsData.data || gsData;
      }

      // Extract data with flexible structure
      const businesses = businessesData.businesses || businessesData.response || businessesData.data || (Array.isArray(businessesData) ? businessesData : []);
      const users = usersData.users || usersData.response || usersData.data || (Array.isArray(usersData) ? usersData : []);
      const orders = ordersData.orders || ordersData.response || ordersData.data || (Array.isArray(ordersData) ? ordersData : []);

      // Use global stats if available, otherwise calculate from orders
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
        // Fallback: Calculate stats manually
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

      // Get recent orders (last 8)
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

  // Chart data from global stats
  const chartData = globalStats?.last7Days || [];
  const topBusinesses = globalStats?.topBusinesses || [];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  // Format growth for display
  const formatGrowth = (value) => {
    if (value === 0) return null;
    return value > 0 ? `+${value}%` : `${value}%`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Header */}
        <div className="px-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Bienvenido de vuelta</p>
              <h1 className="text-xl font-bold text-white">Panel Admin</h1>
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Stats Cards - 2x2 Grid */}
        <div className="px-4 -mt-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Negocios */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineOfficeBuilding className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs text-gray-500">Negocios</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBusinesses}
              </p>
              <p className="text-xs text-gray-500 mt-1">activos</p>
            </div>

            {/* Usuarios */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineUsers className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs text-gray-500">Usuarios</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-gray-500 mt-1">registrados</p>
            </div>

            {/* Ordenes Hoy */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineShoppingCart className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Ordenes Hoy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.ordersToday}
              </p>
              {stats.ordersGrowth !== 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${stats.ordersGrowth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stats.ordersGrowth > 0 ? <HiOutlineTrendingUp className="w-3 h-3" /> : <HiOutlineTrendingDown className="w-3 h-3" />}
                  {formatGrowth(stats.ordersGrowth)} vs ayer
                </p>
              )}
            </div>

            {/* Ingresos Hoy */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineCurrencyDollar className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs text-gray-500">Ingresos Hoy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${stats.revenueToday.toLocaleString()}
              </p>
              {stats.revenueGrowth !== 0 && (
                <p className={`text-xs mt-1 flex items-center gap-1 ${stats.revenueGrowth > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stats.revenueGrowth > 0 ? <HiOutlineTrendingUp className="w-3 h-3" /> : <HiOutlineTrendingDown className="w-3 h-3" />}
                  {formatGrowth(stats.revenueGrowth)} vs ayer
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Acceso Rapido
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <QuickActionCard
              icon={HiOutlineOfficeBuilding}
              label="Negocios"
              onClick={() => navigate('/admin/businesses')}
              color="primary"
            />
            <QuickActionCard
              icon={HiOutlineUsers}
              label="Usuarios"
              onClick={() => navigate('/admin/users')}
              color="emerald"
            />
            <QuickActionCard
              icon={HiOutlineShoppingCart}
              label="Ordenes"
              onClick={() => navigate('/admin/sales/history')}
              color="purple"
            />
            <QuickActionCard
              icon={HiOutlineCurrencyDollar}
              label="Reportes"
              onClick={() => navigate('/admin/reports')}
              color="amber"
            />
          </div>
        </div>

        {/* Mini Chart - Real Data */}
        {chartData.length > 0 && (
          <div className="px-4 mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                  Ventas - Ultimos 7 dias
                </h3>
                <span className="text-xs text-gray-500">
                  ${chartData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-end justify-between gap-1 h-24">
                {chartData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-20">
                      <div
                        className="w-full max-w-[24px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all"
                        style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 capitalize">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top Businesses - Real Data */}
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
              Ordenes Recientes
            </h2>
            <button
              onClick={() => navigate('/admin/sales/history')}
              className="text-xs text-indigo-600 font-medium flex items-center gap-1"
            >
              Ver todas
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center">
              <HiOutlineShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No hay ordenes recientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((order, idx) => (
                <MobileOrderCard key={idx} order={order} statusConfig={statusConfig} />
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
      title: 'Negocios Activos',
      value: stats.totalBusinesses,
      change: '-',
      changeType: 'neutral',
      icon: <Building2 size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      change: '-',
      changeType: 'neutral',
      icon: <Users size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Ordenes Hoy',
      value: stats.ordersToday,
      change: formatGrowth(stats.ordersGrowth) || '-',
      changeType: stats.ordersGrowth > 0 ? 'positive' : stats.ordersGrowth < 0 ? 'negative' : 'neutral',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.revenueToday.toLocaleString()}`,
      change: formatGrowth(stats.revenueGrowth) || '-',
      changeType: stats.revenueGrowth > 0 ? 'positive' : stats.revenueGrowth < 0 ? 'negative' : 'neutral',
      icon: <DollarSign size={22} />,
      iconVariant: 'warning',
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Ingresos' || entry.dataKey === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Bienvenido de vuelta. Aqui esta el resumen de la plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25"
          >
            <ArrowUpRight size={18} />
            Ver reportes completos
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row - Real Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Ordenes - Ultimos 7 dias</Card.Title>
            <Card.Description>Cantidad de ordenes por dia</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="orders"
                      name="Ordenes"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      fill="url(#colorOrders)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Ingresos - Ultimos 7 dias</Card.Title>
            <Card.Description>Ingresos totales por dia</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      name="Ingresos"
                      fill="#10B981"
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
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Businesses - Real Data */}
        <Card>
          <Card.Header
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            }
          >
            <Card.Title>Top 5 Negocios</Card.Title>
            <Card.Description>Por ventas acumuladas (ultimos 30 dias)</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {topBusinesses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
              ) : (
                topBusinesses.map((business, i) => (
                  <div
                    key={business.businessId || i}
                    className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                          ${i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                          ${i === 1 ? 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300' : ''}
                          ${i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                          ${i > 2 ? 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400' : ''}
                        `}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {business.name}
                        </p>
                        <p className="text-xs text-gray-500">{business.totalOrders} ordenes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${business.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <Card.Header
            action={
              <Badge variant="primary">{recentOrders.length} ordenes</Badge>
            }
          >
            <Card.Title>Ordenes Recientes</Card.Title>
            <Card.Description>Ultimas ordenes de todos los negocios</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay ordenes recientes</p>
              ) : (
                recentOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                          <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            #{order.id} - {order.business}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {order.customer} · Hace {order.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${order.total?.toLocaleString() || 0}
                        </span>
                        <Badge variant={status.color} size="sm">
                          <span className="flex items-center gap-1">
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
