import { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { getMyOrders } from '../../services/api';

const Sales = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('week');

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getMyOrders();
      console.log('=== DEBUG Sales ===');
      console.log('Orders response:', response);

      const ordersList = response.orders || response.data || response || [];
      if (Array.isArray(ordersList)) {
        // Only consider completed orders for sales
        const completedOrders = ordersList.filter(o =>
          o.status === 'delivered' || o.status === 'completed'
        );
        setOrders(completedOrders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar los datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const yesterdayOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= yesterday && d < today;
    });

    const thisWeekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
    const lastWeekOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= twoWeeksAgo && d < weekAgo;
    });

    const thisMonthOrders = orders.filter(o => new Date(o.createdAt) >= monthAgo);
    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= twoMonthsAgo && d < monthAgo;
    });

    const sum = (arr) => arr.reduce((acc, o) => acc + (o.total || 0), 0);

    const todayRevenue = sum(todayOrders);
    const yesterdayRevenue = sum(yesterdayOrders);
    const weekRevenue = sum(thisWeekOrders);
    const lastWeekRevenue = sum(lastWeekOrders);
    const monthRevenue = sum(thisMonthOrders);
    const lastMonthRevenue = sum(lastMonthOrders);

    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      today: {
        revenue: todayRevenue,
        orders: todayOrders.length,
        change: calcChange(todayRevenue, yesterdayRevenue),
      },
      week: {
        revenue: weekRevenue,
        orders: thisWeekOrders.length,
        change: calcChange(weekRevenue, lastWeekRevenue),
      },
      month: {
        revenue: monthRevenue,
        orders: thisMonthOrders.length,
        change: calcChange(monthRevenue, lastMonthRevenue),
      },
      avgTicket: orders.length > 0 ? Math.round(sum(orders) / orders.length) : 0,
    };
  }, [orders]);

  // Get recent transactions based on date range
  const recentTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate;

    switch (dateRange) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 7);
    }

    return orders
      .filter(o => new Date(o.createdAt) >= startDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  }, [orders, dateRange]);

  // Daily sales for chart (last 7 days)
  const dailySales = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });

      const revenue = dayOrders.reduce((acc, o) => acc + (o.total || 0), 0);

      days.push({
        date,
        day: date.toLocaleDateString('es-MX', { weekday: 'short' }),
        revenue,
        orders: dayOrders.length,
      });
    }

    return days;
  }, [orders]);

  const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando ventas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ventas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Resumen de ventas y transacciones
          </p>
        </div>
        <Button
          variant="ghost"
          leftIcon={<RefreshCw size={18} />}
          onClick={loadOrders}
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats.today.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stats.today.change >= 0 ? (
                  <ArrowUpRight size={16} className="text-emerald-500" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.today.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(stats.today.change)}%
                </span>
                <span className="text-xs text-gray-500">vs ayer</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ventas Semana</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats.week.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stats.week.change >= 0 ? (
                  <ArrowUpRight size={16} className="text-emerald-500" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.week.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(stats.week.change)}%
                </span>
                <span className="text-xs text-gray-500">vs semana pasada</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ventas Mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats.month.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-2">
                {stats.month.change >= 0 ? (
                  <ArrowUpRight size={16} className="text-emerald-500" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500" />
                )}
                <span className={`text-sm font-medium ${stats.month.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(stats.month.change)}%
                </span>
                <span className="text-xs text-gray-500">vs mes pasado</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ticket Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${stats.avgTicket.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {orders.length} ordenes completadas
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} />
                Ventas Ultimos 7 Dias
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total: ${dailySales.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {dailySales.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-36">
                  <span className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                    ${day.revenue > 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue}
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-500"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs text-gray-500 capitalize">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Resumen Rapido
          </h3>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ordenes hoy</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.today.orders}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ordenes semana</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.week.orders}</span>
              </div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Ordenes mes</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.month.orders}</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700 dark:text-emerald-300">Total historico</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  ${orders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Transacciones Recientes
          </h3>
          <div className="flex gap-2">
            {['today', 'week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  dateRange === range
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay transacciones en este periodo
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <DollarSign size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Orden #{order.orderNumber || order._id?.toString()?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {order.customer?.name || 'Cliente'} - {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +${order.total?.toLocaleString() || 0}
                  </p>
                  <Badge variant="success" size="sm">Completada</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sales;
