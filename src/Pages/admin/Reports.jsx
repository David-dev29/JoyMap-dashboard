import { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Building2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  XCircle,
  Filter,
  Users,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import { Card, Button, Select, Badge, Table } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { useIsMobile } from '../../hooks/useIsMobile';
import { authFetch, ENDPOINTS } from '../../config/api';

const dateRangeOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Este trimestre' },
];

const Reports = () => {
  const isMobile = useIsMobile(768);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [activeTab, setActiveTab] = useState('ventas');

  // Real data from API
  const [businesses, setBusinesses] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [businessesRes, ordersRes] = await Promise.all([
        authFetch(ENDPOINTS.businesses.all),
        authFetch(ENDPOINTS.orders.base),
      ]);

      const businessesData = await businessesRes.json();
      const ordersData = await ordersRes.json();

      const businessList = businessesData.businesses || businessesData.data || businessesData.response || (Array.isArray(businessesData) ? businessesData : []);
      const orderList = ordersData.orders || ordersData.data || ordersData.response || (Array.isArray(ordersData) ? ordersData : []);

      setBusinesses(businessList);
      setOrders(orderList);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Error al cargar datos de reportes');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range
  const getDateRangeFilter = (dateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case 'today':
        return today;
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return monthAgo;
      }
      case 'quarter': {
        const quarterAgo = new Date(today);
        quarterAgo.setDate(quarterAgo.getDate() - 90);
        return quarterAgo;
      }
      default:
        return new Date(0);
    }
  };

  // Filtered orders based on date range and selected business
  const filteredOrders = useMemo(() => {
    const startDate = getDateRangeFilter(dateRange);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const isInDateRange = orderDate >= startDate;
      const isSelectedBusiness = !selectedBusinessId ||
        order.businessId === selectedBusinessId ||
        order.business?._id === selectedBusinessId;

      return isInDateRange && isSelectedBusiness;
    });
  }, [orders, dateRange, selectedBusinessId]);

  // Calculate stats from filtered orders
  const stats = useMemo(() => {
    const completedOrders = filteredOrders.filter(o =>
      o.status === 'delivered' || o.status === 'completed'
    );
    const cancelledOrders = filteredOrders.filter(o => o.status === 'cancelled');

    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    return {
      totalOrders: completedOrders.length,
      totalRevenue,
      avgTicket,
      cancelledOrders: cancelledOrders.length,
    };
  }, [filteredOrders]);

  // Calculate stats per business
  const businessStats = useMemo(() => {
    const statsMap = {};

    filteredOrders.forEach(order => {
      const bizId = order.businessId || order.business?._id;
      const bizName = order.business?.name || businesses.find(b => b._id === bizId)?.name || 'Desconocido';

      if (!statsMap[bizId]) {
        statsMap[bizId] = {
          id: bizId,
          name: bizName,
          orders: 0,
          revenue: 0,
          cancelled: 0,
        };
      }

      if (order.status === 'delivered' || order.status === 'completed') {
        statsMap[bizId].orders++;
        statsMap[bizId].revenue += order.total || 0;
      } else if (order.status === 'cancelled') {
        statsMap[bizId].cancelled++;
      }
    });

    return Object.values(statsMap)
      .filter(b => b.orders > 0 || b.cancelled > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, businesses]);

  // Generate chart data for time series
  const chartData = useMemo(() => {
    const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr && (o.status === 'delivered' || o.status === 'completed');
      });

      data.push({
        date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      });
    }

    return data;
  }, [filteredOrders, dateRange]);

  // Business comparison data for charts
  const businessComparisonData = useMemo(() => {
    return businessStats.slice(0, 7).map(b => ({
      name: b.name.length > 12 ? b.name.substring(0, 12) + '...' : b.name,
      Ingresos: b.revenue,
    }));
  }, [businessStats]);

  // Business options for select
  const businessOptions = useMemo(() => {
    return [
      { value: '', label: 'Todos los negocios' },
      ...businesses.map(b => ({ value: b._id, label: b.name }))
    ];
  }, [businesses]);

  const handleExportCSV = () => {
    if (businessStats.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const headers = ['Negocio', 'Ordenes', 'Ingresos', 'Ticket Promedio', 'Canceladas', '% Cancelacion'];
    const rows = businessStats.map(b => {
      const avgTicket = b.orders > 0 ? (b.revenue / b.orders).toFixed(2) : '0.00';
      const cancelRate = b.orders > 0 ? ((b.cancelled / (b.orders + b.cancelled)) * 100).toFixed(1) : '0.0';
      return [b.name, b.orders, `$${b.revenue}`, `$${avgTicket}`, b.cancelled, `${cancelRate}%`];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Reporte exportado exitosamente');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700">
          <p className="font-medium text-gray-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Ingresos' || entry.dataKey === 'revenue'
                ? `$${entry.value.toLocaleString()}`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statsCards = [
    {
      title: 'Ordenes Completadas',
      value: stats.totalOrders.toLocaleString(),
      change: '-',
      changeType: 'neutral',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '-',
      changeType: 'neutral',
      icon: <DollarSign size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Ticket Promedio',
      value: `$${stats.avgTicket.toFixed(2)}`,
      change: '-',
      changeType: 'neutral',
      icon: <TrendingUp size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ordenes Canceladas',
      value: stats.cancelledOrders,
      change: '-',
      changeType: 'neutral',
      icon: <XCircle size={22} />,
      iconVariant: 'danger',
    },
  ];

  // Mobile tabs
  const reportTabs = [
    { key: 'ventas', label: 'Ventas', icon: DollarSign },
    { key: 'pedidos', label: 'Pedidos', icon: ShoppingCart },
    { key: 'negocios', label: 'Negocios', icon: Building2 },
  ];

  // Mobile date filters
  const mobileDateFilters = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
    { key: 'quarter', label: 'Trimestre' },
  ];

  // Mobile business card component
  const MobileBusinessCard = ({ business, index }) => {
    const avgTicket = business.orders > 0 ? (business.revenue / business.orders).toFixed(2) : '0.00';
    const totalOrders = business.orders + business.cancelled;
    const cancelRate = totalOrders > 0 ? ((business.cancelled / totalOrders) * 100).toFixed(1) : '0.0';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">#{index + 1}</span>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{business.name}</h4>
          </div>
          <ChevronRight size={18} className="text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Ingresos</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">${business.revenue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Ordenes</p>
            <p className="font-bold text-gray-900 dark:text-white">{business.orders}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Ticket Prom.</p>
            <p className="font-bold text-gray-900 dark:text-white">${avgTicket}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Canceladas</p>
            <div className="flex items-center gap-1">
              <p className="font-bold text-red-600 dark:text-red-400">{business.cancelled}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                parseFloat(cancelRate) > 5
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                  : parseFloat(cancelRate) > 3
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
              }`}>
                {cancelRate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Cargando reportes...</span>
        </div>
      </div>
    );
  }

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Reportes</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Analisis de la plataforma
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center"
                >
                  <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center"
                >
                  <Download size={18} className="text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Type Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      activeTab === tab.key
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Filter Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {mobileDateFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setDateRange(filter.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    dateRange === filter.key
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
            <p className="text-xs text-gray-500">Ordenes completadas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <DollarSign size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Ingresos totales</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.avgTicket.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Ticket promedio</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <XCircle size={18} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelledOrders}</p>
            <p className="text-xs text-gray-500">Canceladas</p>
          </div>
        </div>

        {/* Mobile Chart */}
        <div className="px-4 pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tendencia de ventas</h3>
            {chartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Business List */}
        <div className="px-4 pt-4 pb-24">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Top Negocios</h3>
            <span className="text-xs text-gray-500">{businessStats.length} negocios</span>
          </div>
          {businessStats.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay datos de negocios en este periodo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businessStats.map((business, index) => (
                <MobileBusinessCard key={business.id || index} business={business} index={index} />
              ))}
            </div>
          )}

          {/* Mobile Totals */}
          {businessStats.length > 0 && (
            <div className="mt-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-3">Totales Globales</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Ordenes</p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    {stats.totalOrders.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Ingresos</p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Ticket Promedio</p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    ${stats.avgTicket.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">Canceladas</p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                    {stats.cancelledOrders}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reportes Globales
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analisis detallado de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <Button leftIcon={<Download size={18} />} onClick={handleExportCSV}>
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <Filter size={18} />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <Select
              options={dateRangeOptions}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-44"
            />
            <Select
              options={businessOptions}
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-52"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando datos de: <span className="font-medium text-gray-900 dark:text-white">
              {dateRangeOptions.find(d => d.value === dateRange)?.label}
            </span>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Comparison by Business */}
        <Card>
          <Card.Header>
            <Card.Title>Comparativa por Negocio</Card.Title>
            <Card.Description>Ingresos por negocio</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              {businessComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={businessComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Ingresos" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </Card.Content>
        </Card>

        {/* Orders Trend */}
        <Card>
          <Card.Header>
            <Card.Title>Tendencia de Ordenes</Card.Title>
            <Card.Description>Evolucion de ordenes e ingresos</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="date"
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
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      name="Ordenes"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hay datos para mostrar
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <Card.Header
          action={
            <Badge variant="primary">{businessStats.length} negocios</Badge>
          }
        >
          <Card.Title>Resumen por Negocio</Card.Title>
          <Card.Description>Detalle de ventas por cada negocio</Card.Description>
        </Card.Header>
        <Card.Content className="-mx-6 -mb-6">
          {businessStats.length > 0 ? (
            <Table>
              <Table.Head>
                <Table.Row hover={false}>
                  <Table.Header>Negocio</Table.Header>
                  <Table.Header align="right">Ordenes</Table.Header>
                  <Table.Header align="right">Ingresos</Table.Header>
                  <Table.Header align="right">Ticket Prom.</Table.Header>
                  <Table.Header align="right">Canceladas</Table.Header>
                  <Table.Header align="right">% Cancelacion</Table.Header>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {businessStats.map((business, index) => {
                  const avgTicket = business.orders > 0 ? (business.revenue / business.orders).toFixed(2) : '0.00';
                  const totalOrders = business.orders + business.cancelled;
                  const cancelRate = totalOrders > 0 ? ((business.cancelled / totalOrders) * 100).toFixed(1) : '0.0';
                  return (
                    <Table.Row key={business.id || index}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {business.name}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="font-medium">{business.orders}</span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${business.revenue.toLocaleString()}
                        </span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-gray-600 dark:text-gray-300">${avgTicket}</span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <span className="text-red-600 dark:text-red-400">{business.cancelled}</span>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <Badge
                          variant={parseFloat(cancelRate) > 5 ? 'danger' : parseFloat(cancelRate) > 3 ? 'warning' : 'success'}
                          size="sm"
                        >
                          {cancelRate}%
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No hay datos de negocios para el periodo seleccionado
            </div>
          )}
        </Card.Content>
      </Card>

      {/* Totals Row */}
      {businessStats.length > 0 && (
        <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
          <div className="flex flex-wrap justify-between gap-6">
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Ordenes</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {stats.totalOrders.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Ingresos</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ${stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Ticket Promedio Global</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ${stats.avgTicket.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Canceladas</p>
              <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                {stats.cancelledOrders}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;
