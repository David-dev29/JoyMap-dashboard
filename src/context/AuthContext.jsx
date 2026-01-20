import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

// Keys de localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  // Inicializar estado desde localStorage
  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Función de login
  const login = useCallback(async (credentials) => {
    try {
      const response = await fetch(ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Validar rol
      const allowedRoles = ['admin', 'business_owner'];
      if (!allowedRoles.includes(data.user?.role)) {
        throw new Error('No tienes permisos para acceder al dashboard');
      }

      // Guardar en localStorage
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      // Actualizar estado
      setToken(data.token);
      setUser(data.user);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Función de logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Verificar si está autenticado
  const isAuthenticated = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  // Verificar si tiene el rol requerido
  const hasRole = useCallback((requiredRoles) => {
    if (!user) return false;
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.includes(user.role);
  }, [user]);

  const value = {
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
