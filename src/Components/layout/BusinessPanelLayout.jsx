import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  HiOutlineArrowLeft,
  HiOutlineDotsVertical,
  HiOutlineOfficeBuilding,
  HiOutlinePencil,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import { useBusiness } from '../../context/BusinessContext';
import MobileModal from '../ui/MobileModal';
import { useIsMobile } from '../../hooks/useIsMobile';

// Tab configuration for business panel navigation
const BUSINESS_TABS = [
  { id: 'profile', label: 'Perfil', path: '/admin/business/profile' },
  { id: 'products', label: 'Productos', path: '/admin/business/products' },
  { id: 'orders', label: 'Pedidos', path: '/admin/business/orders' },
  { id: 'coupons', label: 'Cupones', path: '/admin/business/coupons' },
  { id: 'categories', label: 'Categorias', path: '/admin/business/product-categories' },
];

const BusinessPanelLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile(768);
  const { selectedBusiness } = useBusiness();
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  // Get active tab based on current path
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const tab = BUSINESS_TABS.find(t => currentPath.startsWith(t.path));
    return tab?.id || 'profile';
  };

  const activeTab = getActiveTab();

  // Handle back navigation
  const handleBack = () => {
    navigate('/admin/businesses');
  };

  // Handle quick actions
  const handleEditInfo = () => {
    setShowActionsMenu(false);
    navigate('/admin/business/profile');
  };

  const handleToggleStatus = () => {
    setShowActionsMenu(false);
    // This would typically call an API to toggle the status
    // For now, we'll just close the menu
  };

  // No business selected state
  if (!selectedBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineOfficeBuilding className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Selecciona un negocio para gestionar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Para acceder al panel de gestion, primero debes seleccionar un negocio desde la lista.
          </p>
          <button
            onClick={() => navigate('/admin/businesses')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <HiOutlineOfficeBuilding className="w-5 h-5" />
            Ir a Negocios
          </button>
        </div>
      </div>
    );
  }

  // Mobile layout with special header and tabs
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Special Header for Business Panel */}
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
          {/* Main Header Row */}
          <div className="flex items-center justify-between px-4 py-3">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Business Name */}
            <div className="flex-1 text-center min-w-0 px-2">
              <h1 className="font-semibold text-gray-900 dark:text-white truncate">
                {selectedBusiness.name}
              </h1>
            </div>

            {/* Actions Menu Button */}
            <button
              onClick={() => setShowActionsMenu(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <HiOutlineDotsVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Horizontal Scrollable Tabs */}
          <div className="border-t border-gray-100 dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              {BUSINESS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`
                    flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors relative
                    ${activeTab === tab.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {/* Active Indicator */}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="pb-20">
          {children}
        </div>

        {/* Quick Actions Modal */}
        <MobileModal
          isOpen={showActionsMenu}
          onClose={() => setShowActionsMenu(false)}
          title="Acciones Rapidas"
        >
          <div className="space-y-2">
            <button
              onClick={handleEditInfo}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <HiOutlinePencil className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">Editar Informacion</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre, direccion, contacto</p>
              </div>
            </button>

            <button
              onClick={handleToggleStatus}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedBusiness.isOpen !== false
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-emerald-100 dark:bg-emerald-900/30'
              }`}>
                <HiOutlineLightningBolt className={`w-5 h-5 ${
                  selectedBusiness.isOpen !== false
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedBusiness.isOpen !== false ? 'Desactivar Negocio' : 'Activar Negocio'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedBusiness.isOpen !== false ? 'Pausar temporalmente' : 'Reanudar operaciones'}
                </p>
              </div>
            </button>
          </div>
        </MobileModal>
      </div>
    );
  }

  // Desktop layout - simpler, just adds a back button context
  return (
    <div className="min-h-screen">
      {/* Desktop Header with Back */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span className="text-sm">Volver a Negocios</span>
        </button>
        <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-2">
          {selectedBusiness.logo ? (
            <img
              src={selectedBusiness.logo.startsWith('http') ? selectedBusiness.logo : `https://${selectedBusiness.logo}`}
              alt={selectedBusiness.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <HiOutlineOfficeBuilding className="w-4 h-4 text-indigo-600" />
            </div>
          )}
          <span className="font-medium text-gray-900 dark:text-white">{selectedBusiness.name}</span>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {BUSINESS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`
                px-4 py-3 text-sm font-medium transition-colors relative rounded-t-lg
                ${activeTab === tab.id
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};

export default BusinessPanelLayout;
