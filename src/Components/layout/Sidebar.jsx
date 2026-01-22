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
  Sparkles,
  X,
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
        { type: 'label', label: 'MENU' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Building2, label: 'Negocios', path: '/admin/businesses' },
        { icon: Users, label: 'Usuarios', path: '/admin/users' },
        { icon: Tag, label: 'Categorias', path: '/admin/categories' },
        { type: 'label', label: 'OPERACIONES' },
        { icon: MessageSquare, label: 'ChatBot', path: '/admin/chatbot' },
        {
          icon: Tag,
          label: 'Marketing',
          children: [
            { label: 'Descuentos', path: '/admin/marketing/discounts' },
            { label: 'Resenas', path: '/admin/marketing/reviews' },
          ],
        },
        { type: 'label', label: 'CONFIGURACION' },
        { icon: Settings, label: 'Plataforma', path: '/admin/settings' },
        { icon: BarChart3, label: 'Reportes', path: '/admin/reports' },
      ]
    : [
        { type: 'label', label: 'MENU' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: ShoppingCart, label: 'Pedidos PDV', path: '/orders' },
        { type: 'label', label: 'CATALOGO' },
        { icon: Package, label: 'Productos', path: '/products' },
        { icon: ChefHat, label: 'Cocina', path: '/kitchen' },
        { icon: Boxes, label: 'Inventario', path: '/inventory' },
        { type: 'label', label: 'FINANZAS' },
        {
          icon: Wallet,
          label: 'Ventas',
          children: [
            { label: 'Historial', path: '/sales/history' },
            { label: 'Reportes', path: '/sales/reports' },
            { label: 'Arqueo', path: '/sales/cash-count' },
          ],
        },
        { type: 'label', label: 'CONFIGURACION' },
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
            px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider
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
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200
              ${active
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
              }
            `}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {isOpen && (
              <>
                <span className="flex-1 text-left text-sm">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
                />
              </>
            )}
          </button>

          {isOpen && isMenuOpen && (
            <div className="ml-9 mt-1 space-y-0.5">
              {item.children.map((child, childIndex) => (
                <button
                  key={childIndex}
                  onClick={() => handleNavigate(child.path)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm
                    transition-colors
                    ${isActive(child.path)
                      ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
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
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          transition-all duration-200
          ${active
            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
          }
        `}
      >
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
        {isOpen && <span className="text-sm">{item.label}</span>}
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
          bg-white dark:bg-slate-800
          border-r border-gray-100 dark:border-slate-700
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-700">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-bold text-lg">J</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                JoyMap
              </span>
            </div>
          )}
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Upgrade Card */}
        {isOpen && (
          <div className="p-4">
            <div className="upgrade-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Sparkles size={20} className="text-white" />
                </div>
                <h4 className="font-semibold text-white mb-1">Upgrade a Pro</h4>
                <p className="text-sm text-white/80 mb-3">
                  Desbloquea todas las funciones premium
                </p>
                <button className="w-full py-2 px-4 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">
                  Actualizar ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Connection status (collapsed view) */}
        {!isOpen && (
          <div className="p-3 border-t border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
