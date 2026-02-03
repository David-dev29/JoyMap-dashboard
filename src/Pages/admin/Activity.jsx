import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';
import { useIsMobile } from '../../hooks/useIsMobile';

// Status configuration with semantic colors
const statusConfig = {
  pending: { label: 'Pendiente', color: 'warning', bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  confirmed: { label: 'Confirmado', color: 'info', bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  preparing: { label: 'Preparando', color: 'info', bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  ready: { label: 'Listo', color: 'primary', bgClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  delivering: { label: 'En camino', color: 'primary', bgClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  delivered: { label: 'Entregado', color: 'success', bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelado', color: 'danger', bgClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

// Time ago helper
const timeAgo = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

// Order Card Component
const OrderCard = ({ order, onClick }) => {
  const status = statusConfig[order.status] || statusConfig.pending;
  const businessName = order.business?.name || order.businessId?.name || 'Negocio';
  const customerName = order.customer?.name || order.customerId?.name || 'Cliente';

  return (
    <button
      onClick={() => onClick(order)}
      className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            #{order.orderNumber || order._id?.slice(-6)}
          </span>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <Building2 size={12} />
            {businessName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bgClass}`}>
            {status.label}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(order.createdAt)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <User size={14} className="text-gray-400" />
          {customerName}
        </div>
        <span className="font-bold text-indigo-600 dark:text-indigo-400">
          {formatCurrency(order.total)}
        </span>
      </div>
    </button>
  );
};

// Stat Card Component
const StatCard = ({ title, value, trend, trendLabel, icon: Icon, iconColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
    <div className="flex items-start justify-between mb-2">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon size={20} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{title}</p>
    {trendLabel && <p className="text-xs text-gray-400 mt-0.5">{trendLabel}</p>}
  </div>
);

const Activity = () => {
  const isMobile = useIsMobile(768);

  // Main tab state
  const [activeTab, setActiveTab] = useState('orders');

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Businesses state (for reports filter)
  const [businesses, setBusinesses] = useState([]);

  // Reports state
  const [reportPeriod, setReportPeriod] = useState('week');
  const [reportBusinessFilter, setReportBusinessFilter] = useState('');

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        const response = await authFetch(ENDPOINTS.orders.base);
        const data = await response.json();
        if (response.ok) {
          const ordersList = data.orders || data.response || data.data || (Array.isArray(data) ? data : []);
          ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(ordersList);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await authFetch(ENDPOINTS.businesses.all);
        const data = await response.json();
        if (response.ok) {
          const list = data.businesses || data.response || data.data || [];
          setBusinesses(list);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };
    fetchBusinesses();
  }, []);

  // Order counts by status
  const orderCounts = useMemo(() => {
    const activeStatuses = ['pending', 'confirmed', 'preparing', 'delivering'];
    return {
      all: orders.length,
      active: orders.filter(o => activeStatuses.includes(o.status)).length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filtered orders based on status
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    if (orderStatusFilter === 'active') {
      return orders.filter(o => ['pending', 'confirmed', 'preparing', 'delivering'].includes(o.status));
    }
    return orders.filter(o => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Sales calculations
  const salesStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const completedOrders = orders.filter(o => o.status === 'delivered');

    const todaySales = completedOrders
      .filter(o => new Date(o.createdAt) >= todayStart)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const weekSales = completedOrders
      .filter(o => new Date(o.createdAt) >= weekStart)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const monthSales = completedOrders
      .filter(o => new Date(o.createdAt) >= monthStart)
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const lastWeekSales = completedOrders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d >= lastWeekStart && d < weekStart;
      })
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const weekTrend = lastWeekSales > 0
      ? Math.round(((weekSales - lastWeekSales) / lastWeekSales) * 100)
      : 0;

    const avgTicket = completedOrders.length > 0
      ? Math.round(completedOrders.reduce((sum, o) => sum + (o.total || 0), 0) / completedOrders.length)
      : 0;

    return { todaySales, weekSales, monthSales, weekTrend, avgTicket };
  }, [orders]);

  // Chart data for last 7 days
  const chartData = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTotal = completedOrders
        .filter(o => {
          const d = new Date(o.createdAt);
          return d >= dayStart && d < dayEnd;
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);

      days.push({
        label: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        value: dayTotal,
      });
    }

    const maxValue = Math.max(...days.map(d => d.value), 1);
    return days.map(d => ({ ...d, height: (d.value / maxValue) * 100 }));
  }, [orders]);

  // Reports filtered data
  const reportData = useMemo(() => {
    const now = new Date();
    let startDate;

    switch (reportPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
    }

    let filteredOrders = orders.filter(o => new Date(o.createdAt) >= startDate);

    if (reportBusinessFilter) {
      filteredOrders = filteredOrders.filter(o =>
        (o.business?._id || o.businessId) === reportBusinessFilter
      );
    }

    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'delivered');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled').length;
    const avgTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    // Business breakdown
    const businessStats = {};
    filteredOrders.forEach(order => {
      const bizId = order.business?._id || order.businessId;
      const bizName = order.business?.name || 'Sin negocio';
      if (!businessStats[bizId]) {
        businessStats[bizId] = { name: bizName, orders: 0, revenue: 0 };
      }
      businessStats[bizId].orders++;
      if (order.status === 'delivered') {
        businessStats[bizId].revenue += order.total || 0;
      }
    });

    return {
      totalOrders,
      completedOrders: completedOrders.length,
      totalRevenue,
      cancelledOrders,
      avgTicket,
      businessStats: Object.values(businessStats).sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders, reportPeriod, reportBusinessFilter]);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Fecha', 'Orden', 'Negocio', 'Cliente', 'Total', 'Estado'];
    const rows = filteredOrders.map(o => [
      new Date(o.createdAt).toLocaleDateString('es-ES'),
      o.orderNumber || o._id?.slice(-6),
      o.business?.name || 'N/A',
      o.customer?.name || 'N/A',
      o.total || 0,
      statusConfig[o.status]?.label || o.status,
    ]);

    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${reportPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Order detail modal
  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  // Main tabs
  const mainTabs = [
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'sales', label: 'Ventas', icon: DollarSign },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
  ];

  // Order status tabs
  const orderTabs = [
    { id: 'all', label: 'Todos', count: orderCounts.all },
    { id: 'active', label: 'Activos', count: orderCounts.active },
    { id: 'delivered', label: 'Entregados', count: orderCounts.delivered },
    { id: 'cancelled', label: 'Cancelados', count: orderCounts.cancelled },
  ];

  // Period options
  const periodOptions = [
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'quarter', label: 'Trimestre' },
  ];

  // ========== RENDER ==========
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${isMobile ? '-m-4' : ''}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Actividad</h1>
          <p className="text-sm text-gray-500">Centro de control de la plataforma</p>
        </div>

        {/* Main Tabs */}
        <div className="px-4 pb-3 flex gap-2">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========== ORDERS TAB ========== */}
      {activeTab === 'orders' && (
        <div>
          {/* Status sub-tabs */}
          <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {orderTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    orderStatusFilter === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    orderStatusFilter === tab.id
                      ? 'bg-indigo-200 dark:bg-indigo-800'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="px-4 pb-24 space-y-3">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500">No hay pedidos</p>
              </div>
            ) : (
              filteredOrders.map(order => (
                <OrderCard key={order._id} order={order} onClick={openOrderModal} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ========== SALES TAB ========== */}
      {activeTab === 'sales' && (
        <div className="px-4 py-4 space-y-4 pb-24">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Ventas hoy"
              value={formatCurrency(salesStats.todaySales)}
              icon={DollarSign}
              iconColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
            />
            <StatCard
              title="Esta semana"
              value={formatCurrency(salesStats.weekSales)}
              trend={salesStats.weekTrend}
              trendLabel="vs semana anterior"
              icon={TrendingUp}
              iconColor="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
            />
            <StatCard
              title="Este mes"
              value={formatCurrency(salesStats.monthSales)}
              icon={Calendar}
              iconColor="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
            />
            <StatCard
              title="Ticket promedio"
              value={formatCurrency(salesStats.avgTicket)}
              icon={ShoppingCart}
              iconColor="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
            />
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ultimos 7 dias</h3>
            <div className="flex items-end justify-between h-32 gap-2">
              {chartData.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${Math.max(day.height, 4)}%` }}
                  />
                  <span className="text-xs text-gray-500">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Transacciones recientes</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {orders
                .filter(o => o.status === 'delivered')
                .slice(0, 5)
                .map(order => (
                  <div key={order._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber || order._id?.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">{order.business?.name}</p>
                    </div>
                    <span className="font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                  </div>
                ))}
              {orders.filter(o => o.status === 'delivered').length === 0 && (
                <p className="p-4 text-center text-gray-500">Sin transacciones</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========== REPORTS TAB ========== */}
      {activeTab === 'reports' && (
        <div className="px-4 py-4 space-y-4 pb-24">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="flex-1">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
              >
                {periodOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <select
                value={reportBusinessFilter}
                onChange={(e) => setReportBusinessFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
              >
                <option value="">Todos los negocios</option>
                {businesses.map(b => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.totalOrders}</p>
              <p className="text-xs text-gray-500">Total pedidos</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(reportData.totalRevenue)}</p>
              <p className="text-xs text-gray-500">Ingresos</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{reportData.completedOrders}</p>
              <p className="text-xs text-gray-500">Completados</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(reportData.avgTicket)}</p>
              <p className="text-xs text-gray-500">Ticket promedio</p>
            </div>
          </div>

          {/* Business Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Por negocio</h3>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1 text-sm text-indigo-600 font-medium"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {reportData.businessStats.slice(0, 5).map((biz, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{biz.name}</p>
                    <p className="text-sm text-gray-500">{biz.orders} pedidos</p>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(biz.revenue)}</span>
                </div>
              ))}
              {reportData.businessStats.length === 0 && (
                <p className="p-4 text-center text-gray-500">Sin datos</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <MobileModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title={`Orden #${selectedOrder?.orderNumber || selectedOrder?._id?.slice(-6)}`}
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status and Business */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Building2 size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedOrder.business?.name || 'Negocio'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(selectedOrder.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusConfig[selectedOrder.status]?.bgClass}`}>
                {statusConfig[selectedOrder.status]?.label}
              </span>
            </div>

            {/* Customer */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {selectedOrder.customer?.name || selectedOrder.customerId?.name || 'Cliente'}
              </p>
              {selectedOrder.customer?.phone && (
                <p className="text-xs text-gray-500 mt-1">{selectedOrder.customer.phone}</p>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Productos</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {item.quantity}x {item.product?.name || item.name}
                    </span>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-indigo-600 text-lg">{formatCurrency(selectedOrder.total)}</span>
            </div>
          </div>
        )}
      </MobileModal>
    </div>
  );
};

export default Activity;
