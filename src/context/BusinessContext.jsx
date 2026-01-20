import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authFetch, ENDPOINTS } from '../config/api';

const BusinessContext = createContext(null);

const SELECTED_BUSINESS_KEY = 'selected_business';

export const BusinessProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [selectedBusiness, setSelectedBusinessState] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar negocios segun rol
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        if (user?.role === 'admin') {
          // Admin: cargar todos los negocios
          const res = await authFetch(ENDPOINTS.businesses.base);
          const data = await res.json();
          const businessList = data.businesses || data.response || [];
          setBusinesses(businessList);

          // Restaurar seleccion de localStorage o seleccionar el primero
          const savedBusinessId = localStorage.getItem(SELECTED_BUSINESS_KEY);
          if (savedBusinessId) {
            const savedBusiness = businessList.find(b => b._id === savedBusinessId);
            if (savedBusiness) {
              setSelectedBusinessState(savedBusiness);
            } else if (businessList.length > 0) {
              setSelectedBusinessState(businessList[0]);
            }
          } else if (businessList.length > 0) {
            setSelectedBusinessState(businessList[0]);
          }
        } else if (user?.role === 'business_owner') {
          // Business owner: cargar solo su negocio
          const res = await authFetch(ENDPOINTS.me.business);
          const data = await res.json();
          if (data.success && data.business) {
            setBusinesses([data.business]);
            setSelectedBusinessState(data.business);
          }
        }
      } catch (err) {
        setError('Error cargando negocios');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [user, isAuthenticated]);

  // Funcion para cambiar negocio seleccionado (solo admin)
  const setSelectedBusiness = useCallback((business) => {
    if (user?.role !== 'admin') return;

    setSelectedBusinessState(business);
    if (business?._id) {
      localStorage.setItem(SELECTED_BUSINESS_KEY, business._id);
    } else {
      localStorage.removeItem(SELECTED_BUSINESS_KEY);
    }
  }, [user]);

  // Limpiar al cerrar sesion
  const clearSelectedBusiness = useCallback(() => {
    setSelectedBusinessState(null);
    setBusinesses([]);
    localStorage.removeItem(SELECTED_BUSINESS_KEY);
  }, []);

  // Verificar si el usuario puede cambiar de negocio
  const canChangeBusiness = user?.role === 'admin';

  const value = {
    selectedBusiness,
    setSelectedBusiness,
    businesses,
    loading,
    error,
    canChangeBusiness,
    clearSelectedBusiness,
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

// Hook para usar el contexto
export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness debe usarse dentro de un BusinessProvider');
  }
  return context;
};

export default BusinessContext;
