import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineOfficeBuilding,
  HiOutlineTag,
  HiOutlineTicket,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineCollection,
  HiOutlineMoon,
  HiOutlineSun,
  HiChevronRight,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineClipboardList,
  HiOutlineStar,
  HiOutlineChartBar,
  HiOutlineCube,
  HiOutlineCheck,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useBusiness } from '../../context/BusinessContext';
import MobileModal from '../../Components/ui/MobileModal';

const AdminMenu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedBusiness, businesses, setSelectedBusiness } = useBusiness();

  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sections that require a selected business
  const businessSection = selectedBusiness ? {
    title: 'Negocio Seleccionado',
    items: [
      {
        id: 'business-profile',
        icon: HiOutlineOfficeBuilding,
        label: 'Perfil del negocio',
        description: selectedBusiness.name,
        path: '/admin/business/profile',
      },
      {
        id: 'business-products',
        icon: HiOutlineCube,
        label: 'Productos',
        description: 'Gestionar productos',
        path: '/admin/business/products',
      },
      {
        id: 'business-categories',
        icon: HiOutlineCollection,
        label: 'Categorias de productos',
        description: 'Organizar menu',
        path: '/admin/business/product-categories',
      },
      {
        id: 'business-orders',
        icon: HiOutlineClipboardList,
        label: 'Pedidos',
        description: 'Ver pedidos del negocio',
        path: '/admin/business/orders',
      },
      {
        id: 'business-coupons',
        icon: HiOutlineTicket,
        label: 'Cupones',
        description: 'Cupones del negocio',
        path: '/admin/business/coupons',
      },
    ],
  } : null;

  const menuSections = [
    {
      title: 'Plataforma',
      items: [
        {
          id: 'categories',
          icon: HiOutlineCollection,
          label: 'Categorias de negocios',
          description: 'Tipos de negocios',
          path: '/admin/categories',
        },
        {
          id: 'customers',
          icon: HiOutlineUsers,
          label: 'Clientes',
          description: 'Usuarios de la plataforma',
          path: '/admin/customers',
        },
        {
          id: 'sales-history',
          icon: HiOutlineShoppingCart,
          label: 'Historial de ventas',
          description: 'Todas las ordenes',
          path: '/admin/sales/history',
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          id: 'discounts',
          icon: HiOutlineTag,
          label: 'Descuentos globales',
          description: 'Promociones de plataforma',
          path: '/admin/marketing/discounts',
        },
        {
          id: 'reviews',
          icon: HiOutlineStar,
          label: 'Resenas',
          description: 'Opiniones de clientes',
          path: '/admin/marketing/reviews',
        },
      ],
    },
    {
      title: 'Configuracion',
      items: [
        {
          id: 'settings',
          icon: HiOutlineCog,
          label: 'Ajustes de plataforma',
          description: 'Configuracion general',
          path: '/admin/settings',
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

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    setShowBusinessSelector(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* User Profile Card */}
      <div className="p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <span className="text-xl font-semibold text-indigo-600">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'Administrador'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email || user?.phone}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full">
                Administrador
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Selector */}
      <div className="px-4 pb-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
          Negocio Activo
        </h3>
        <button
          onClick={() => setShowBusinessSelector(true)}
          className="w-full flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-card hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 transition-colors"
        >
          {selectedBusiness ? (
            <>
              {selectedBusiness.logo ? (
                <img
                  src={selectedBusiness.logo.startsWith('http') ? selectedBusiness.logo : `https://${selectedBusiness.logo}`}
                  alt={selectedBusiness.name}
                  className="w-12 h-12 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <HiOutlineOfficeBuilding className="w-6 h-6 text-indigo-600" />
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedBusiness.name}
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Toca para cambiar
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <HiOutlineOfficeBuilding className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ninguno seleccionado
                </p>
                <p className="text-xs text-indigo-600 dark:text-indigo-400">
                  Toca para seleccionar
                </p>
              </div>
            </>
          )}
          <HiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Menu Sections */}
      <div className="px-4 pb-4 space-y-6">
        {/* Business Section (only if business selected) */}
        {businessSection && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
              {businessSection.title}
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {businessSection.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    <HiChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Sections */}
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
            onClick={() => setShowLogoutConfirm(true)}
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

      {/* Business Selector Modal */}
      <MobileModal
        isOpen={showBusinessSelector}
        onClose={() => setShowBusinessSelector(false)}
        title="Seleccionar Negocio"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {businesses && businesses.length > 0 ? (
            businesses.map((business) => (
              <button
                key={business._id}
                onClick={() => handleSelectBusiness(business)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  selectedBusiness?._id === business._id
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {business.logo ? (
                  <img
                    src={business.logo.startsWith('http') ? business.logo : `https://${business.logo}`}
                    alt={business.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <HiOutlineOfficeBuilding className="w-5 h-5 text-indigo-600" />
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {business.name}
                  </p>
                  {business.category?.name && (
                    <p className="text-xs text-gray-500 truncate">{business.category.name}</p>
                  )}
                </div>
                {selectedBusiness?._id === business._id && (
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <HiOutlineCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay negocios disponibles
            </div>
          )}
        </div>
      </MobileModal>

      {/* Logout Confirmation Modal */}
      <MobileModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Cerrar Sesion"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineLogout className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            ¿Estas seguro de que deseas cerrar sesion?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </MobileModal>
    </div>
  );
};

export default AdminMenu;
