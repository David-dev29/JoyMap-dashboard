import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyBusiness } from '../services/api';

export const useMyBusiness = () => {
  const { user, isAuthenticated } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!isAuthenticated() || user?.role !== 'business_owner') {
        setLoading(false);
        return;
      }

      try {
        const data = await getMyBusiness();
        if (data.success) {
          setBusiness(data.business);
        }
      } catch (err) {
        setError('Error cargando negocio');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [user, isAuthenticated]);

  return { business, loading, error, setBusiness };
};
