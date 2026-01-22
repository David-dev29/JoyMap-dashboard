import { useState, useEffect } from 'react';
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
import { Card, Button, Select, Badge, Table } from '../../components/ui';
import { StatsCard } from '../../components/shared';

// Mock data
const generateMockData = (days) => {
  const data = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      orders: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 5000) + 2000,
    });
  }
  return data;
};

const businessSalesData = [
  { name: 'El Buen Sabor', orders: 156, revenue: 12450, cancelled: 5 },
  { name: 'Pizza Express', orders: 124, revenue: 8230, cancelled: 3 },
  { name: 'Sushi Master', orders: 98, revenue: 6890, cancelled: 8 },
  { name: 'Taqueria Don Jose', orders: 87, revenue: 5120, cancelled: 2 },
  { name: 'Cafe Central', orders: 76, revenue: 4560, cancelled: 4 },
  { name: 'Burger King', orders: 65, revenue: 3890, cancelled: 6 },
  { name: 'Pizzeria Roma', orders: 54, revenue: 2780, cancelled: 1 },
];

const businessComparisonData = businessSalesData.map(b => ({
  name: b.name.length > 12 ? b.name.substring(0, 12) + '...' : b.name,
  Ingresos: b.revenue,
  Ordenes: b.orders * 50, // Scale for visualization
}));

const dateRangeOptions = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'custom', label: 'Personalizado' },
];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [chartData, setChartData] = useState([]);
  const [businesses, setBusinesses] = useState([
    { value: '', label: 'Todos los negocios' },
    { value: '1', label: 'El Buen Sabor' },
    { value: '2', label: 'Pizza Express' },
    { value: '3', label: 'Sushi Master' },
    { value: '4', label: 'Taqueria Don Jose' },
    { value: '5', label: 'Cafe Central' },
  ]);

  // Stats
  const [stats, setStats] = useState({
    totalOrders: 660,
    totalRevenue: 43920,
    avgTicket: 66.55,
    cancelledOrders: 29,
  });

  useEffect(() => {
    // Generate chart data based on date range
    const days = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 90;
    setChartData(generateMockData(days));

    // Simulate loading
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [dateRange, selectedBusiness]);

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Negocio', 'Ordenes', 'Ingresos', 'Canceladas'];
    const rows = businessSalesData.map(b => [b.name, b.orders, `$${b.revenue}`, b.cancelled]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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
      title: 'Ordenes Totales',
      value: stats.totalOrders.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+8%',
      changeType: 'positive',
      icon: <DollarSign size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Ticket Promedio',
      value: `$${stats.avgTicket.toFixed(2)}`,
      change: '+3%',
      changeType: 'positive',
      icon: <TrendingUp size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ordenes Canceladas',
      value: stats.cancelledOrders,
      change: '-5%',
      changeType: 'positive',
      icon: <XCircle size={22} />,
      iconVariant: 'danger',
    },
  ];

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
        <Button leftIcon={<Download size={18} />} onClick={handleExportCSV}>
          Exportar CSV
        </Button>
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
              options={businesses}
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
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
            <Card.Description>Ingresos y ordenes por negocio</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
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
                  <Legend />
                  <Bar dataKey="Ingresos" fill="#4F46E5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Orders Trend */}
        <Card>
          <Card.Header>
            <Card.Title>Tendencia de Ordenes</Card.Title>
            <Card.Description>Evolucion de ordenes en el tiempo</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
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
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <Card.Header
          action={
            <Badge variant="primary">{businessSalesData.length} negocios</Badge>
          }
        >
          <Card.Title>Resumen por Negocio</Card.Title>
          <Card.Description>Detalle de ventas por cada negocio</Card.Description>
        </Card.Header>
        <Card.Content className="-mx-6 -mb-6">
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
              {businessSalesData.map((business, index) => {
                const avgTicket = (business.revenue / business.orders).toFixed(2);
                const cancelRate = ((business.cancelled / business.orders) * 100).toFixed(1);
                return (
                  <Table.Row key={index}>
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
        </Card.Content>
      </Card>

      {/* Totals Row */}
      <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-wrap justify-between gap-6">
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Ordenes</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {businessSalesData.reduce((sum, b) => sum + b.orders, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Ingresos</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              ${businessSalesData.reduce((sum, b) => sum + b.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Ticket Promedio Global</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              ${(businessSalesData.reduce((sum, b) => sum + b.revenue, 0) /
                 businessSalesData.reduce((sum, b) => sum + b.orders, 0)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Canceladas</p>
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {businessSalesData.reduce((sum, b) => sum + b.cancelled, 0)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
