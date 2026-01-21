import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Check, UtensilsCrossed, Truck, ShoppingBag } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

// Mapeo de tipos de negocio a iconos y etiquetas
const BUSINESS_TYPE_CONFIG = {
  comida: {
    icon: UtensilsCrossed,
    label: 'Comida',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500',
  },
  tienda: {
    icon: ShoppingBag,
    label: 'Tienda',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
  },
  envio: {
    icon: Truck,
    label: 'Envio',
    color: 'text-green-400',
    bgColor: 'bg-green-500',
  },
  default: {
    icon: Store,
    label: 'Negocio',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
  },
};

// Obtener configuracion del tipo de negocio
const getBusinessTypeConfig = (business) => {
  // Intentar obtener el tipo desde diferentes propiedades posibles
  const type = business?.type || business?.businessType || business?.category?.slug || 'default';
  return BUSINESS_TYPE_CONFIG[type.toLowerCase()] || BUSINESS_TYPE_CONFIG.default;
};

// Obtener etiqueta del tipo de negocio
const getBusinessTypeLabel = (business) => {
  // Intentar obtener la etiqueta desde la categoria o tipo
  if (business?.category?.name) return business.category.name;
  if (business?.businessCategory?.name) return business.businessCategory.name;
  if (business?.type) return business.type.charAt(0).toUpperCase() + business.type.slice(1);
  if (business?.businessType) return business.businessType.charAt(0).toUpperCase() + business.businessType.slice(1);
  return getBusinessTypeConfig(business).label;
};

const BusinessSelector = () => {
  const { selectedBusiness, setSelectedBusiness, businesses, loading, canChangeBusiness } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Obtener config del negocio seleccionado
  const selectedConfig = selectedBusiness ? getBusinessTypeConfig(selectedBusiness) : BUSINESS_TYPE_CONFIG.default;
  const SelectedIcon = selectedConfig.icon;

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No mostrar si no puede cambiar de negocio (business_owner)
  if (!canChangeBusiness) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-white/70">Cargando...</span>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
        <Store size={16} className="text-orange-400" />
        <span className="text-sm text-white/70">Sin negocios</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Boton del selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
      >
        <SelectedIcon size={16} className={selectedConfig.color} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white max-w-[150px] truncate">
            {selectedBusiness?.name || 'Seleccionar negocio'}
          </span>
          {selectedBusiness && (
            <span className="text-xs text-white/50">
              {getBusinessTypeLabel(selectedBusiness)}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-[100] overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider">
              Seleccionar negocio ({businesses.length})
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {businesses.map((business) => {
              const config = getBusinessTypeConfig(business);
              const BusinessIcon = config.icon;
              const typeLabel = getBusinessTypeLabel(business);
              const isSelected = selectedBusiness?._id === business._id;

              return (
                <button
                  key={business._id}
                  onClick={() => {
                    setSelectedBusiness(business);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10 transition-colors ${
                    isSelected ? 'bg-orange-500/20' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected ? config.bgColor : 'bg-white/10'
                  }`}>
                    <BusinessIcon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {business.name}
                      </p>
                    </div>
                    <p className={`text-xs ${config.color}`}>
                      {typeLabel}
                    </p>
                  </div>
                  {isSelected && (
                    <Check size={16} className="text-orange-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSelector;
