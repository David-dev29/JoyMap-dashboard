import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Building2,
  Settings,
  ChefHat,
  MessageSquare,
  Tag,
  BarChart3,
  Wallet,
  ChevronDown,
  Store,
  FileText,
  Calculator,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Tooltip } from '../ui';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const isAdmin = user?.role === 'admin';

  // Menu items based on role
  const menuItems = isAdmin
    ? [
        { type: 'label', label: 'Principal' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Building2, label: 'Negocios', path: '/admin/businesses' },
        { icon: Users, label: 'Usuarios', path: '/admin/users' },
        { type: 'label', label: 'Operaciones' },
        { icon: MessageSquare, label: 'ChatBot', path: '/admin/chatbot' },
        { icon: Users, label: 'Clientes', path: '/admin/customers' },
        {
          icon: Tag,
          label: 'Marketing',
          children: [
            { label: 'Descuentos', path: '/admin/marketing/discounts' },
            { label: 'Resenas', path: '/admin/marketing/reviews' },
          ],
        },
        { type: 'label', label: 'Configuracion' },
        { icon: Settings, label: 'Plataforma', path: '/admin/settings' },
        { icon: BarChart3, label: 'Reportes', path: '/admin/reports' },
      ]
    : [
        { type: 'label', label: 'Principal' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Pedidos PDV', path: '/orders' },
        { type: 'label', label: 'Catalogo' },
        { icon: Package, label: 'Productos', path: '/products' },
        { icon: ChefHat, label: 'Cocina', path: '/kitchen' },
        { icon: Boxes, label: 'Inventario', path: '/inventory' },
        { type: 'label', label: 'Finanzas' },
        {
          icon: Wallet,
          label: 'Ventas',
          children: [
            { label: 'Historial', path: '/sales/history' },
            { label: 'Reportes', path: '/sales/reports' },
            { label: 'Arqueo', path: '/sales/cash-count' },
          ],
        },
        { type: 'label', label: 'Configuracion' },
        { icon: Store, label: 'Mi Negocio', path: '/my-business' },
        { icon: Settings, label: 'Ajustes', path: '/settings' },
      ];

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isChildActive = (children) => children?.some((child) => isActive(child.path));

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  const renderMenuItem = (item, index) => {
    if (item.type === 'label') {
      return (
        <div
          key={index}
          className={`
            px-3 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider
            text-gray-400 dark:text-gray-500
            ${!isOpen && 'hidden'}
          `}
        >
          {item.label}
        </div>
      );
    }

    const Icon = item.icon;
    const hasChildren = item.children?.length > 0;
    const isMenuOpen = openMenus[item.label];
    const active = isActive(item.path) || isChildActive(item.children);

    if (hasChildren) {
      return (
        <div key={index}>
          <button
            onClick={() => toggleMenu(item.label)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
              transition-colors
              ${active
                ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <Icon size={20} />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {isOpen && isMenuOpen && (
            <div className="ml-9 mt-1 space-y-1">
              {item.children.map((child, childIndex) => (
                <button
                  key={childIndex}
                  onClick={() => handleNavigate(child.path)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm
                    transition-colors
                    ${isActive(child.path)
                      ? 'text-red-600 dark:text-red-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    const button = (
      <button
        key={index}
        onClick={() => handleNavigate(item.path)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-colors
          ${active
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
      >
        <Icon size={20} />
        {isOpen && <span className="text-sm font-medium">{item.label}</span>}
      </button>
    );

    if (!isOpen) {
      return (
        <Tooltip key={index} content={item.label} position="right">
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          flex flex-col
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo area - hidden, logo is in header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-700" />

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className={`
            flex items-center gap-2 px-3 py-2
            bg-gray-100 dark:bg-gray-700 rounded-lg
            ${!isOpen && 'justify-center'}
          `}>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {isOpen && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Conectado
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
