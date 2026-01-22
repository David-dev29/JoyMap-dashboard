import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';

const AdminDashboard = () => {
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Negocios Activos',
      value: '24',
      change: '+3 este mes',
      changeType: 'positive',
      icon: <Building2 size={20} />,
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Usuarios Totales',
      value: '156',
      change: '+12 esta semana',
      changeType: 'positive',
      icon: <Users size={20} />,
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-500',
    },
    {
      title: 'Pedidos Hoy',
      value: '342',
      change: '+18% vs ayer',
      changeType: 'positive',
      icon: <ShoppingCart size={20} />,
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Ingresos del Mes',
      value: '$45,230',
      change: '+8% vs mes anterior',
      changeType: 'positive',
      icon: <DollarSign size={20} />,
      iconBg: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Bienvenido de vuelta. Aqui esta el resumen de la plataforma.
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
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Actividad Reciente</Card.Title>
            <Card.Description>Ultimos movimientos en la plataforma</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <ShoppingCart size={16} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Nuevo pedido #{1000 + i}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Restaurante El Buen Sabor - Hace {i * 5} min
                    </p>
                  </div>
                  <Badge variant="success" size="sm">Completado</Badge>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Top Businesses */}
        <Card>
          <Card.Header>
            <Card.Title>Top Negocios</Card.Title>
            <Card.Description>Por ventas este mes</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {[
                { name: 'El Buen Sabor', sales: '$12,450', growth: '+15%' },
                { name: 'Pizza Express', sales: '$8,230', growth: '+8%' },
                { name: 'Sushi Master', sales: '$6,890', growth: '+12%' },
                { name: 'Taqueria Don Jose', sales: '$5,120', growth: '+5%' },
                { name: 'Cafe Central', sales: '$4,560', growth: '+3%' },
              ].map((business, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {business.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {business.sales}
                    </p>
                    <p className="text-xs text-green-500">{business.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
