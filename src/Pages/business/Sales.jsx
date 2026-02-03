import { useState, useEffect, useMemo } from 'react';
import {
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineShoppingCart,
  HiOutlineCalendar,
  HiOutlineRefresh,
  HiOutlineChartBar,
  HiOutlineCreditCard,
  HiOutlineCash,
  HiOutlineStar,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  CreditCard,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, Button, Badge } from '../../components/ui';
import { getMyOrders } from '../../services/api';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

// Mobile Transaction Card
const TransactionCard = ({ order, formatDate }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <HiOutlineCurrencyDollar className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Orden #{order.orderNumber || order._id?.toString()?.slice(-6)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {order.customerId?.name || order.customer?.name || 'Cliente'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-emerald-600">
              +${order.total?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          {expanded ? (
            <HiOutlineChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-800">
          <div className="pt-3 space-y-2">
            {(order.items || []).slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {item.quantity}x {item.name || item.productId?.name || 'Producto'}
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                </span>
              </div>
            ))}
            {(order.items || []).length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                +{order.items.length - 5} productos mas
              </p>
            )}
            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-500">
                {order.paymentMethod === 'cash' ? 'Efectivo' :
                 order.paymentMethod === 'card' ? 'Tarjeta' :
                 order.paymentMethod === 'transfer' ? 'Transferencia' : 'Otro'}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">
                Completada
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Sales = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState('week');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      const ordersList = response.orders || response.data || response || [];
      if (Array.isArray(ordersList)) {
        const completedOrders = ordersList.filter(o =>
          o.status === 'delivered' || o.status === 'completed'
        );
        setOrders(completedOrders);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      toast.error('Error al cargar los datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Check if date is today
  const isToday = (dateString) => {
    const orderDate = new Date(dateString);
    const today = new Date();
    return orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  };

  // Helper: Check if date is yesterday
  const isYesterday = (dateString) => {
    const orderDate = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate.getDate() === yesterday.getDate() &&
           orderDate.getMonth() === yesterday.getMonth() &&
           orderDate.getFullYear() === yesterday.getFullYear();
  };

  // Helper: Check if date is within last N days
  const isWithinDays = (dateString, days) => {
    const orderDate = new Date(dateString);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return orderDate >= cutoff;
  };

  // Calculate all stats
  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => isToday(o.createdAt));
    const yesterdayOrders = orders.filter(o => isYesterday(o.createdAt));
    const thisWeekOrders = orders.filter(o => isWithinDays(o.createdAt, 7));
    const lastWeekOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      return orderDate >= twoWeeksAgo && orderDate < weekAgo;
    });
    const thisMonthOrders = orders.filter(o => isWithinDays(o.createdAt, 30));
    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);
      return orderDate >= twoMonthsAgo && orderDate < monthAgo;
    });

    const sum = (arr) => arr.reduce((acc, o) => acc + (o.total || 0), 0);
    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      today: { revenue: sum(todayOrders), orders: todayOrders.length, change: calcChange(sum(todayOrders), sum(yesterdayOrders)) },
      week: { revenue: sum(thisWeekOrders), orders: thisWeekOrders.length, change: calcChange(sum(thisWeekOrders), sum(lastWeekOrders)) },
      month: { revenue: sum(thisMonthOrders), orders: thisMonthOrders.length, change: calcChange(sum(thisMonthOrders), sum(lastMonthOrders)) },
      avgTicket: orders.length > 0 ? Math.round(sum(orders) / orders.length) : 0,
      totalRevenue: sum(orders),
    };
  }, [orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productMap = new Map();

    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const name = item.name || item.productId?.name || item.product?.name || 'Producto';
        const qty = item.quantity || 1;
        const revenue = (item.price || 0) * qty;

        if (productMap.has(name)) {
          const existing = productMap.get(name);
          productMap.set(name, {
            name,
            quantity: existing.quantity + qty,
            revenue: existing.revenue + revenue,
          });
        } else {
          productMap.set(name, { name, quantity: qty, revenue });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // Payment methods breakdown
  const paymentMethods = useMemo(() => {
    const methods = { cash: 0, card: 0, transfer: 0, other: 0 };

    orders.forEach(order => {
      const method = order.paymentMethod || 'other';
      if (methods.hasOwnProperty(method)) {
        methods[method]++;
      } else {
        methods.other++;
      }
    });

    const total = orders.length || 1;
    return [
      { name: 'Efectivo', count: methods.cash, percent: Math.round((methods.cash / total) * 100), icon: HiOutlineCash, color: 'emerald' },
      { name: 'Tarjeta', count: methods.card, percent: Math.round((methods.card / total) * 100), icon: HiOutlineCreditCard, color: 'blue' },
      { name: 'Transferencia', count: methods.transfer, percent: Math.round((methods.transfer / total) * 100), icon: HiOutlineCreditCard, color: 'purple' },
    ].filter(m => m.count > 0);
  }, [orders]);

  // Daily sales for chart
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

      days.push({
        date,
        day: date.toLocaleDateString('es-MX', { weekday: 'short' }),
        revenue: dayOrders.reduce((acc, o) => acc + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1);

  // Filtered transactions
  const recentTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate = new Date(today);

    if (dateRange === 'today') startDate = today;
    else if (dateRange === 'week') startDate.setDate(startDate.getDate() - 7);
    else startDate.setMonth(startDate.getMonth() - 1);

    return orders
      .filter(o => new Date(o.createdAt) >= startDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  }, [orders, dateRange]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isToday(dateString)) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Cargando ventas...</span>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Header with refresh */}
        <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Ventas</h1>
              <p className="text-xs text-gray-500">{orders.length} ordenes completadas</p>
            </div>
            <button
              onClick={loadOrders}
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Stats Cards - 2x2 Grid */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Today */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineCurrencyDollar className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs text-gray-500">Hoy</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.today.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.today.change >= 0 ? (
                  <HiOutlineTrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <HiOutlineTrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${stats.today.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.today.change)}%
                </span>
              </div>
            </div>

            {/* Week */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineCalendar className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Semana</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.week.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.week.change >= 0 ? (
                  <HiOutlineTrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <HiOutlineTrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${stats.week.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.week.change)}%
                </span>
              </div>
            </div>

            {/* Month */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineChartBar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">Mes</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.month.revenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {stats.month.change >= 0 ? (
                  <HiOutlineTrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <HiOutlineTrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${stats.month.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(stats.month.change)}%
                </span>
              </div>
            </div>

            {/* Avg Ticket */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <HiOutlineShoppingCart className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-xs text-gray-500">Promedio</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.avgTicket.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">por orden</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="px-4 mb-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                Ultimos 7 dias
              </h3>
              <span className="text-xs text-gray-500">
                ${dailySales.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-end justify-between gap-1 h-32">
              {dailySales.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className="w-full max-w-[28px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t transition-all"
                      style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '4px' : '0' }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 capitalize">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        {topProducts.length > 0 && (
          <div className="px-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                <HiOutlineStar className="w-4 h-4 text-amber-500" />
                Top Productos
              </h3>
              <div className="space-y-2">
                {topProducts.slice(0, 3).map((product, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-xs font-bold text-primary-600">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{product.quantity} uds</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'today', label: 'Hoy' },
              { id: 'week', label: 'Esta semana' },
              { id: 'month', label: 'Este mes' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setDateRange(range.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  dateRange === range.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="px-4 pb-4">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-3">
            Transacciones ({recentTransactions.length})
          </h3>
          {recentTransactions.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center">
              <HiOutlineCurrencyDollar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No hay transacciones en este periodo
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((order) => (
                <TransactionCard
                  key={order._id}
                  order={order}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen de ventas y transacciones</p>
        </div>
        <Button variant="ghost" leftIcon={<RefreshCw size={18} />} onClick={loadOrders}>
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span className="text-xs text-gray-500">vs anterior</span>
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
                <span className="text-xs text-gray-500">vs anterior</span>
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
              <p className="text-xs text-gray-500 mt-2">{orders.length} ordenes completadas</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <ShoppingCart size={20} className="text-amber-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={18} /> Ventas Ultimos 7 Dias
              </h3>
              <p className="text-sm text-gray-500">
                Total: ${dailySales.reduce((acc, d) => acc + d.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {dailySales.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-36">
                  <span className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                    ${day.revenue > 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue}
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-lg transition-all"
                    style={{ height: `${(day.revenue / maxRevenue) * 100}%`, minHeight: day.revenue > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs text-gray-500 capitalize">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} /> Top Productos
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-sm font-bold text-primary-600">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.quantity} vendidos</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">${product.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Payment Methods & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard size={18} /> Metodos de Pago
          </h3>
          {paymentMethods.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <method.icon size={16} className={`text-${method.color}-600`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{method.count} ordenes</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${method.color}-500 rounded-full`}
                      style={{ width: `${method.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">{method.percent}%</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Transacciones Recientes</h3>
            <div className="flex gap-2">
              {['today', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    dateRange === range
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-medium'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay transacciones en este periodo</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recentTransactions.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <DollarSign size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Orden #{order.orderNumber || order._id?.toString()?.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.customerId?.name || order.customer?.name || 'Cliente'} - {formatFullDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">+${order.total?.toLocaleString() || 0}</p>
                    <Badge variant="success" size="sm">Completada</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Sales;
