import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Protege rutas basado en autenticacion y rol
 * @param {React.ReactNode} children - Componentes hijos a renderizar
 * @param {string[]} allowedRoles - Array de roles permitidos (opcional)
 */
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'business_owner'] }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();
  const location = useLocation();

  // Mostrar spinner mientras se verifica auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-orange-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-slate-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // No autenticado - redirigir a login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Autenticado pero rol incorrecto - redirigir a unauthorized
  if (!hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Autorizado - renderizar hijos
  return children;
};

export default ProtectedRoute;
