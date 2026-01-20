import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir al destino original o al dashboard
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validacion basica
    if (!identifier.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    const result = await login({ identifier, password });

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }

    setIsLoading(false);
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="text-4xl font-bold text-white">
            <span className="text-orange-500">Joy</span>Map
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Bienvenido</h1>
            <p className="text-slate-500 mt-2">Ingresa a tu cuenta</p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Email/Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo electronico o telefono
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Link Forgot Password */}
            <div className="text-right">
              <a href="#" className="text-sm text-orange-500 hover:text-orange-600">
                Olvidaste tu contrasena?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Iniciando sesion...
                </span>
              ) : (
                'Iniciar sesion'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          2025 JoyMap. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
