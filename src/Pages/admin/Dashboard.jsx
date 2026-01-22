import {
  Building2,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Package,
  ArrowUpRight,
  MoreHorizontal,
} from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { StatsCard } from '../../components/shared';

const AdminDashboard = () => {
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Negocios Activos',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: <Building2 size={22} />,
      iconVariant: 'primary',
    },
    {
      title: 'Usuarios Totales',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: <Users size={22} />,
      iconVariant: 'success',
    },
    {
      title: 'Pedidos Hoy',
      value: '342',
      change: '+18%',
      changeType: 'positive',
      icon: <ShoppingCart size={22} />,
      iconVariant: 'purple',
    },
    {
      title: 'Ingresos del Mes',
      value: '$45,230',
      change: '+8%',
      changeType: 'positive',
      icon: <DollarSign size={22} />,
      iconVariant: 'warning',
    },
  ];

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
          Ver reportes
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
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <Card.Header
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            }
          >
            <Card.Title>Actividad Reciente</Card.Title>
            <Card.Description>Ultimos movimientos en la plataforma</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <ShoppingCart size={18} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
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
          <Card.Header
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-gray-400" />
              </button>
            }
          >
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
                <div key={i} className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                      ${i === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${i === 1 ? 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300' : ''}
                      ${i === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                      ${i > 2 ? 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400' : ''}
                    `}>
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
                    <p className="text-xs text-emerald-500 font-medium">{business.growth}</p>
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
