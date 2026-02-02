import { useNavigate } from 'react-router-dom';
import {
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineTicket,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineChartPie,
  HiOutlineCollection,
  HiOutlineMoon,
  HiOutlineSun,
  HiChevronRight,
  HiOutlineSupport,
  HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Menu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuSections = [
    {
      title: 'Mi Negocio',
      items: [
        {
          id: 'business',
          icon: HiOutlineOfficeBuilding,
          label: 'Informacion del negocio',
          description: 'Perfil, horarios, contacto',
          path: '/my-business',
        },
        {
          id: 'categories',
          icon: HiOutlineCollection,
          label: 'Categorias de productos',
          description: 'Organiza tu menu',
          path: '/product-categories',
        },
        {
          id: 'coupons',
          icon: HiOutlineTicket,
          label: 'Cupones y promociones',
          description: 'Descuentos para clientes',
          path: '/coupons',
        },
      ],
    },
    {
      title: 'Herramientas',
      items: [
        {
          id: 'kitchen',
          icon: HiOutlineChartPie,
          label: 'Cocina (KDS)',
          description: 'Pantalla de cocina',
          path: '/kitchen',
        },
        {
          id: 'inventory',
          icon: HiOutlineTag,
          label: 'Inventario',
          description: 'Control de stock',
          path: '/inventory',
        },
      ],
    },
    {
      title: 'Configuracion',
      items: [
        {
          id: 'settings',
          icon: HiOutlineCog,
          label: 'Configuracion',
          description: 'Notificaciones, impresion',
          path: '/settings',
        },
        {
          id: 'theme',
          icon: theme === 'dark' ? HiOutlineSun : HiOutlineMoon,
          label: theme === 'dark' ? 'Modo claro' : 'Modo oscuro',
          description: 'Cambiar apariencia',
          action: toggleTheme,
        },
      ],
    },
    {
      title: 'Ayuda',
      items: [
        {
          id: 'help',
          icon: HiOutlineQuestionMarkCircle,
          label: 'Centro de ayuda',
          description: 'Preguntas frecuentes',
          path: '/help',
        },
        {
          id: 'support',
          icon: HiOutlineSupport,
          label: 'Soporte',
          description: 'Contactar soporte',
          path: '/support',
        },
      ],
    },
  ];

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* User Profile Card */}
      <div className="p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'Usuario'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || user?.phone}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full">
                {user?.role === 'admin' ? 'Administrador' : 'Propietario'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 pb-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              {section.title}
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    {item.path && (
                      <HiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <HiOutlineLogout className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-red-600">
                Cerrar sesion
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Salir de tu cuenta
              </p>
            </div>
          </button>
        </div>

        {/* App Version */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
          JoyMap Dashboard v1.0.0
        </p>
      </div>
    </div>
  );
};

export default Menu;
