import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Users,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';
import { useBusiness } from '../../context/BusinessContext';

const BusinessDashboard = () => {
  const { selectedBusiness } = useBusiness();

  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Pedidos Hoy',
      value: '28',
      change: '+18%',
      changeType: 'positive',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Ventas Hoy',
      value: '$2,450',
      change: '+12%',
      changeType: 'positive',
      icon: <DollarSign size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Productos Activos',
      value: '45',
      change: '-3',
      changeType: 'negative',
      icon: <Package size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Tiempo Promedio',
      value: '18 min',
      change: '-11%',
      changeType: 'positive',
      icon: <Clock size={22} />,
      iconVariant: 'warning',
    },
  ];

  const recentOrders = [
    { id: '1234', customer: 'Juan Perez', total: '$185', status: 'preparing', time: '5 min' },
    { id: '1233', customer: 'Maria Garcia', total: '$92', status: 'ready', time: '12 min' },
    { id: '1232', customer: 'Carlos Lopez', total: '$156', status: 'delivered', time: '25 min' },
    { id: '1231', customer: 'Ana Martinez', total: '$78', status: 'delivered', time: '35 min' },
    { id: '1230', customer: 'Pedro Sanchez', total: '$210', status: 'delivered', time: '45 min' },
  ];

  const statusColors = {
    pending: 'warning',
    preparing: 'info',
    ready: 'success',
    delivered: 'default',
  };

  const statusLabels = {
    pending: 'Pendiente',
    preparing: 'Preparando',
    ready: 'Listo',
    delivered: 'Entregado',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {selectedBusiness?.name || 'Mi Negocio'} - Resumen del dia
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={18} />
          Nuevo pedido
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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
                <Badge variant="primary">{recentOrders.length} pedidos</Badge>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreHorizontal size={18} className="text-gray-400" />
                </button>
              </div>
            }
          >
            <Card.Title>Pedidos Recientes</Card.Title>
            <Card.Description>Ultimos pedidos del dia</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                      <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Pedido #{order.id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {order.customer} - Hace {order.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {order.total}
                    </span>
                    <Badge variant={statusColors[order.status]} size="sm">
                      {statusLabels[order.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
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
            <Card.Title>Rendimiento</Card.Title>
            <Card.Description>Esta semana vs anterior</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pedidos</span>
                  <span className="text-sm font-semibold text-emerald-500">+18%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
                  <span className="text-sm font-semibold text-indigo-500">+12%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-indigo-500 rounded-full transition-all" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clientes Nuevos</span>
                  <span className="text-sm font-semibold text-purple-500">+8%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-purple-500 rounded-full transition-all" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaccion</span>
                  <span className="text-sm font-semibold text-amber-500">-2%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2 bg-amber-500 rounded-full transition-all" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboard;
