import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
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
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { authFetch, ENDPOINTS } from '../../config/api';

// Mock data for charts (TODO: Create stats endpoint in API)
const ordersChartData = [
  { day: 'Lun', orders: 45, revenue: 2340 },
  { day: 'Mar', orders: 52, revenue: 2780 },
  { day: 'Mie', orders: 38, revenue: 1950 },
  { day: 'Jue', orders: 65, revenue: 3420 },
  { day: 'Vie', orders: 78, revenue: 4120 },
  { day: 'Sab', orders: 92, revenue: 4890 },
  { day: 'Dom', orders: 68, revenue: 3560 },
];

const recentActivity = [
  { type: 'new_business', message: 'Nuevo negocio registrado: Pizzeria Roma', time: '10 min' },
  { type: 'new_user', message: 'Nuevo usuario: Carlos Rodriguez (business_owner)', time: '25 min' },
  { type: 'order', message: 'Orden #1001 completada en El Buen Sabor', time: '30 min' },
  { type: 'review', message: 'Nueva reseña 5★ para Pizza Express', time: '45 min' },
  { type: 'alert', message: '3 productos agotados en Sushi Master', time: '1 hora' },
];

const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'info', icon: Clock },
  preparing: { label: 'Preparando', color: 'info', icon: Clock },
  ready: { label: 'Listo', color: 'primary', icon: CheckCircle },
  delivering: { label: 'En camino', color: 'primary', icon: Clock },
  delivered: { label: 'Entregado', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'danger', icon: XCircle },
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalUsers: 0,
    ordersToday: 0,
    revenueToday: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topBusinesses, setTopBusinesses] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [businessesRes, usersRes, ordersRes] = await Promise.all([
        authFetch(ENDPOINTS.businesses.all),
        authFetch(ENDPOINTS.users.base),
        authFetch(ENDPOINTS.orders.base),
      ]);

      const businessesData = await businessesRes.json();
      const usersData = await usersRes.json();
      const ordersData = await ordersRes.json();

      console.log('=== DEBUG Dashboard ===');
      console.log('Businesses:', businessesData);
      console.log('Users:', usersData);
      console.log('Orders:', ordersData);

      // Extract data with flexible structure
      const businesses = businessesData.businesses || businessesData.response || businessesData.data || (Array.isArray(businessesData) ? businessesData : []);
      const users = usersData.users || usersData.response || usersData.data || (Array.isArray(usersData) ? usersData : []);
      const orders = ordersData.orders || ordersData.response || ordersData.data || (Array.isArray(ordersData) ? ordersData : []);

      // Calculate stats
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
      });

      // Get recent orders (last 8)
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 8).map(order => ({
        id: order.orderNumber || order._id?.slice(-6),
        business: order.business?.name || 'Negocio',
        customer: order.customer?.name || 'Cliente',
        total: order.total || 0,
        status: order.status || 'pending',
        time: getTimeAgo(order.createdAt),
      })));

      // Calculate top businesses by orders
      const businessOrderCount = {};
      const businessRevenue = {};
      orders.forEach(order => {
        const bizId = order.business?._id || order.businessId;
        const bizName = order.business?.name || 'Desconocido';
        if (bizId) {
          if (!businessOrderCount[bizId]) {
            businessOrderCount[bizId] = { name: bizName, orders: 0, revenue: 0 };
          }
          businessOrderCount[bizId].orders++;
          businessOrderCount[bizId].revenue += order.total || 0;
        }
      });

      const topBiz = Object.values(businessOrderCount)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((biz, i) => ({
          id: i + 1,
          name: biz.name,
          orders: biz.orders,
          revenue: biz.revenue,
          growth: Math.floor(Math.random() * 20) + 1, // TODO: Calculate real growth
        }));

      setTopBusinesses(topBiz.length > 0 ? topBiz : [
        { id: 1, name: 'Sin datos suficientes', orders: 0, revenue: 0, growth: 0 },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalBusinesses: 0,
        totalUsers: 0,
        ordersToday: 0,
        revenueToday: 0,
      });
      setRecentOrders([]);
      setTopBusinesses([]);
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
      change: '-',
      changeType: 'neutral',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats.revenueToday.toLocaleString()}`,
      change: '-',
      changeType: 'neutral',
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
              {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toLocaleString()}` : entry.value}
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
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25">
          <ArrowUpRight size={18} />
          Ver reportes completos
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Ordenes - Ultimos 7 dias</Card.Title>
            <Card.Description>Cantidad de ordenes por dia (datos de ejemplo)</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersChartData}>
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
            </div>
          </Card.Content>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Ingresos - Ultimos 7 dias</Card.Title>
            <Card.Description>Ingresos totales por dia (datos de ejemplo)</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersChartData}>
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
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Businesses */}
        <Card>
          <Card.Header
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            }
          >
            <Card.Title>Top 5 Negocios</Card.Title>
            <Card.Description>Por ventas acumuladas</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24" />
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : topBusinesses.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
              ) : (
                topBusinesses.map((business, i) => (
                  <div
                    key={business.id}
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
                        <p className="text-xs text-gray-500">{business.orders} ordenes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${business.revenue.toLocaleString()}
                      </p>
                      {business.growth > 0 && (
                        <p className="text-xs text-emerald-500 font-medium">+{business.growth}%</p>
                      )}
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
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-slate-600 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-32" />
                        <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-24" />
                      </div>
                    </div>
                  </div>
                ))
              ) : recentOrders.length === 0 ? (
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

      {/* Activity Feed */}
      <Card>
        <Card.Header>
          <Card.Title>Actividad Reciente</Card.Title>
          <Card.Description>Ultimos movimientos en la plataforma (datos de ejemplo)</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${activity.type === 'new_business' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                    ${activity.type === 'new_user' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                    ${activity.type === 'order' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
                    ${activity.type === 'review' ? 'bg-amber-100 dark:bg-amber-900/30' : ''}
                    ${activity.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                  `}
                >
                  {activity.type === 'new_business' && <Building2 size={16} className="text-blue-600 dark:text-blue-400" />}
                  {activity.type === 'new_user' && <Users size={16} className="text-green-600 dark:text-green-400" />}
                  {activity.type === 'order' && <ShoppingCart size={16} className="text-purple-600 dark:text-purple-400" />}
                  {activity.type === 'review' && <TrendingUp size={16} className="text-amber-600 dark:text-amber-400" />}
                  {activity.type === 'alert' && <AlertCircle size={16} className="text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Hace {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;
