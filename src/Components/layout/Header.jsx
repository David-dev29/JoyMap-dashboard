import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Toggle sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
              JoyMap
            </span>
          </div>

          {/* Business Selector (Admin only) */}
          {canChangeBusiness && (
            <div className="hidden md:block ml-4">
              <BusinessSelector />
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Tooltip content={isDark ? 'Modo claro' : 'Modo oscuro'}>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </Tooltip>

          {/* Notifications */}
          <Tooltip content="Notificaciones">
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </Tooltip>

          {/* User menu */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Avatar
                  name={user?.name}
                  size="sm"
                  src={user?.avatar}
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'admin' ? 'Administrador' : 'Negocio'}
                  </p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden md:block" />
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
        <div className="md:hidden px-4 pb-3">
          <BusinessSelector />
        </div>
      )}
    </header>
  );
};

export default Header;
