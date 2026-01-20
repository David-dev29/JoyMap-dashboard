import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Store, Check } from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

const BusinessSelector = () => {
  const { selectedBusiness, setSelectedBusiness, businesses, loading, canChangeBusiness } = useBusiness();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

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
        <Store size={16} className="text-orange-400" />
        <span className="text-sm font-medium text-white max-w-[150px] truncate">
          {selectedBusiness?.name || 'Seleccionar negocio'}
        </span>
        <ChevronDown
          size={16}
          className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/10">
            <span className="text-xs text-white/50 uppercase tracking-wider">
              Seleccionar negocio
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {businesses.map((business) => (
              <button
                key={business._id}
                onClick={() => {
                  setSelectedBusiness(business);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10 transition-colors ${
                  selectedBusiness?._id === business._id ? 'bg-orange-500/20' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedBusiness?._id === business._id
                    ? 'bg-orange-500'
                    : 'bg-white/10'
                }`}>
                  <Store size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {business.name}
                  </p>
                  {business.address && (
                    <p className="text-xs text-white/50 truncate">
                      {business.address}
                    </p>
                  )}
                </div>
                {selectedBusiness?._id === business._id && (
                  <Check size={16} className="text-orange-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessSelector;
