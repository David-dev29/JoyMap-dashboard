import { useLocation, useNavigate } from 'react-router-dom';
import {
  HiHome,
  HiClipboardList,
  HiShoppingBag,
  HiChartBar,
  HiMenu,
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineShoppingBag,
  HiOutlineChartBar,
  HiOutlineMenu,
  HiUsers,
  HiOutlineUsers,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Navigation tabs for business owner
  const businessTabs = [
    {
      id: 'home',
      icon: HiOutlineHome,
      activeIcon: HiHome,
      label: 'Inicio',
      path: '/'
    },
    {
      id: 'orders',
      icon: HiOutlineClipboardList,
      activeIcon: HiClipboardList,
      label: 'Pedidos',
      path: '/orders'
    },
    {
      id: 'products',
      icon: HiOutlineShoppingBag,
      activeIcon: HiShoppingBag,
      label: 'Productos',
      path: '/products'
    },
    {
      id: 'sales',
      icon: HiOutlineChartBar,
      activeIcon: HiChartBar,
      label: 'Ventas',
      path: '/sales'
    },
    {
      id: 'menu',
      icon: HiOutlineMenu,
      activeIcon: HiMenu,
      label: 'Mas',
      path: '/menu'
    },
  ];

  // Navigation tabs for admin
  const adminTabs = [
    {
      id: 'home',
      icon: HiOutlineHome,
      activeIcon: HiHome,
      label: 'Inicio',
      path: '/admin'
    },
    {
      id: 'businesses',
      icon: HiOutlineShoppingBag,
      activeIcon: HiShoppingBag,
      label: 'Negocios',
      path: '/admin/businesses'
    },
    {
      id: 'users',
      icon: HiOutlineUsers,
      activeIcon: HiUsers,
      label: 'Usuarios',
      path: '/admin/users'
    },
    {
      id: 'stats',
      icon: HiOutlineChartBar,
      activeIcon: HiChartBar,
      label: 'Reportes',
      path: '/admin/reports'
    },
    {
      id: 'menu',
      icon: HiOutlineMenu,
      activeIcon: HiMenu,
      label: 'Mas',
      path: '/admin/menu'
    },
  ];

  const tabs = isAdmin ? adminTabs : businessTabs;

  const isActive = (path) => {
    if (path === '/' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 z-50
      bg-white dark:bg-gray-900
      border-t border-gray-100 dark:border-gray-800
      shadow-nav
      safe-bottom
      md:hidden
    ">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = active ? tab.activeIcon : tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                flex flex-col items-center justify-center
                w-full h-full
                transition-all duration-200
                active:scale-95
                ${active ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}
              `}
            >
              <Icon className={`
                w-6 h-6 mb-0.5
                transition-transform duration-200
                ${active ? 'scale-110' : ''}
              `} />
              <span className={`
                text-[10px] font-medium
                ${active ? 'text-primary-600' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {tab.label}
              </span>
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1 w-1 h-1 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
