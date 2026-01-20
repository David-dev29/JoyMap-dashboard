import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMyBusiness } from "../../hooks/useMyBusiness";
import logo from "../../assets/logoTxtuBICA.png";
import { PanelRightOpen, Menu, LogOut, User } from "lucide-react";

const Navbar = ({ isSidebarOpen, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { business } = useMyBusiness();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full shadow-2xl border-b border-gray-700 sticky top-0 left-0 z-30 backdrop-blur-xl">
      <section className="relative mx-auto h-12">
        {/* Navbar */}
        <nav
          className="flex justify-between text-white h-12 items-center px-2 relative overflow-hidden"
          style={{
            background: `
              linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%),
              linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
            `
          }}
        >
          {/* Overlay decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

          <div className="px-1 py-6 flex w-full items-center gap-3 relative z-10">
            {/* Botón toggle sidebar */}
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md hover:bg-orange-400 transition"
            >
              {isSidebarOpen ? <PanelRightOpen size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo */}
            <a className="text-3xl font-bold font-heading" href="#">
              <img
                className="w-28 h-28 object-contain"
                src={logo}
                alt="Logo"
              />
            </a>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Usuario y Logout - SIEMPRE VISIBLE */}
            <div className="flex items-center gap-4">
              {/* Nombre del usuario y negocio */}
              <div className="flex items-center gap-2 text-white">
                <User size={18} className="text-orange-400" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.name || 'Usuario'}
                  </span>
                  {business && (
                    <span className="text-xs text-orange-300">
                      {business.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Separador */}
              <div className="border-l border-white/30 h-6"></div>

              {/* Botón Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white rounded-lg transition-all text-sm font-medium"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </button>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default Navbar;
