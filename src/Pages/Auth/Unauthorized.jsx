import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `
          linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%),
          linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
        `,
      }}
    >
      <div className="text-center">
        {/* Icono */}
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Acceso Denegado</h1>
        <p className="text-slate-400 mb-8 max-w-md">
          No tienes los permisos necesarios para acceder a esta seccion del dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            Volver atras
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
