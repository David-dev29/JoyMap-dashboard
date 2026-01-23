import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, ChevronDown, Search, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar, Dropdown, Badge, Tooltip } from '../ui';
import BusinessSelector from '../../Components/Dashboard/BusinessSelector';

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { selectedBusiness, canChangeBusiness } = useBusiness();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isBusinessManagementRoute = location.pathname.startsWith('/admin/business/');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Toggle sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-400 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search bar - desktop */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-600 transition-all"
              />
            </div>
          </div>

          {/* Business Selector (Admin only) */}
          {canChangeBusiness && (
            <div className="hidden lg:flex items-center gap-3 ml-2">
              <BusinessSelector />
              {/* Business Management Indicator */}
              {isBusinessManagementRoute && selectedBusiness && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Store size={16} className="text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Gestionando: {selectedBusiness.name}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <Tooltip content="Buscar">
            <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-400 transition-colors">
              <Search size={20} />
            </button>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip content={isDark ? 'Modo claro' : 'Modo oscuro'}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-400 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </Tooltip>

          {/* Notifications */}
          <Tooltip content="Notificaciones">
            <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 dark:text-gray-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
            </button>
          </Tooltip>

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 dark:bg-slate-600 mx-2 hidden sm:block" />

          {/* User menu */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <Avatar
                  name={user?.name}
                  size="sm"
                  src={user?.avatar}
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Administrador' : 'Negocio'}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden sm:block" />
              </button>
            }
          >
            {(close) => (
              <>
                <Dropdown.Label>Mi cuenta</Dropdown.Label>
                <Dropdown.Item
                  icon={<User size={16} />}
                  onClick={() => {
                    close();
                    navigate('/profile');
                  }}
                >
                  Mi perfil
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<Settings size={16} />}
                  onClick={() => {
                    close();
                    navigate('/settings');
                  }}
                >
                  Configuracion
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  icon={<LogOut size={16} />}
                  danger
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                >
                  Cerrar sesion
                </Dropdown.Item>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Mobile Business Selector */}
      {canChangeBusiness && (
        <div className="lg:hidden px-4 pb-3">
          <BusinessSelector />
        </div>
      )}
    </header>
  );
};

export default Header;
