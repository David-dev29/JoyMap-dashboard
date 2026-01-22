import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Users,
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
      change: '+5 vs ayer',
      changeType: 'positive',
      icon: <ShoppingCart size={20} />,
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Ventas Hoy',
      value: '$2,450',
      change: '+12% vs ayer',
      changeType: 'positive',
      icon: <DollarSign size={20} />,
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-500',
    },
    {
      title: 'Productos Activos',
      value: '45',
      change: '3 agotados',
      changeType: 'warning',
      icon: <Package size={20} />,
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Tiempo Promedio',
      value: '18 min',
      change: '-2 min vs ayer',
      changeType: 'positive',
      icon: <Clock size={20} />,
      iconBg: 'bg-orange-100 dark:bg-orange-900',
      iconColor: 'text-orange-500',
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {selectedBusiness?.name || 'Mi Negocio'} - Resumen del dia
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>Pedidos Recientes</Card.Title>
                <Card.Description>Ultimos pedidos del dia</Card.Description>
              </div>
              <Badge variant="primary">{recentOrders.length} pedidos</Badge>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                      <ShoppingCart size={16} className="text-red-500" />
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
          <Card.Header>
            <Card.Title>Rendimiento</Card.Title>
            <Card.Description>Esta semana vs anterior</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pedidos</span>
                  <span className="text-sm font-medium text-green-500">+18%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ingresos</span>
                  <span className="text-sm font-medium text-green-500">+12%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '68%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Clientes Nuevos</span>
                  <span className="text-sm font-medium text-green-500">+8%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Satisfaccion</span>
                  <span className="text-sm font-medium text-yellow-500">-2%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '92%' }} />
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
