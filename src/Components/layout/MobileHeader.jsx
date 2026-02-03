import { useNavigate, useLocation } from 'react-router-dom';
import { HiArrowLeft, HiBell, HiMenu } from 'react-icons/hi';

// Page titles mapping
const pageTitles = {
  '/': 'Inicio',
  '/dashboard': 'Dashboard',
  '/orders': 'Pedidos',
  '/products': 'Productos',
  '/product-categories': 'Categorias',
  '/sales': 'Ventas',
  '/kitchen': 'Cocina',
  '/settings': 'Configuracion',
  '/my-business': 'Mi Negocio',
  '/coupons': 'Cupones',
  '/inventory': 'Inventario',
  '/menu': 'Menu',
  // Admin routes
  '/admin': 'Admin',
  '/admin/businesses': 'Negocios',
  '/admin/users': 'Usuarios',
  '/admin/settings': 'Configuracion',
};

const MobileHeader = ({
  title,
  showBack = false,
  showMenu = false,
  rightAction,
  onMenuClick,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get title from props or from path mapping
  const pageTitle = title || pageTitles[location.pathname] || 'JoyMap';

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className={`
      sticky top-0 z-40
      h-14 px-4
      flex items-center justify-between
      bg-white dark:bg-gray-900
      border-b border-gray-100 dark:border-gray-800
      safe-top
      ${className}
    `}>
      {/* Left side */}
      <div className="w-10 flex items-center">
        {showBack ? (
          <button
            onClick={handleBack}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <HiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        ) : showMenu ? (
          <button
            onClick={onMenuClick}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
          >
            <HiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>

      {/* Center - Title */}
      <h1 className="flex-1 text-center text-base font-semibold text-gray-900 dark:text-white truncate px-2">
        {pageTitle}
      </h1>

      {/* Right side */}
      <div className="w-10 flex items-center justify-end">
        {rightAction || (
          <button
            className="w-10 h-10 -mr-2 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all relative"
          >
            <HiBell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
