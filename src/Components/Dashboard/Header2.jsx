import React from "react";
import Dropdown from "./MenuUser";
import logo from "../../assets/logoTxtuBICA.png";
import { PanelRightOpen, Menu } from "lucide-react";

const Navbar = ({ isSidebarOpen, onToggleSidebar }) => {
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
                alt="EnCorto Logo"
              />
            </a>

            {/* Nav Links */}
            <ul className="hidden md:flex px-2 mr-auto text-sm font-semibold font-heading space-x-12">
              <button className="group relative h-7 w-40 overflow-hidden rounded-lg bg-white text-sm font-bold text-orange-600 py-px flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 mr-2 inline"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                  />
                </svg>
                Actualiza tu plan
                <div className="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30"></div>
              </button>
            </ul>

            {/* Header Icons */}
            <div className="hidden xl:flex items-center space-x-5">
              {/* Notificaciones */}
              <a className="flex items-center hover:text-gray-200" href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </a>

              <div className="border-l border-white-600 h-14 opacity-25"></div>

              {/* Soporte */}
              <a
                className="flex items-center hover:text-gray-200 font-semibold space-x-3 gap-2 text-sm relative"
                href="#"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="24"
                  height="24"
                  strokeWidth="2"
                >
                  <path d="M4 14v-3a8 8 0 1 1 16 0v3"></path>
                  <path d="M18 19c0 1.657 -2.686 3 -6 3"></path>
                  <path d="M4 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3z"></path>
                  <path d="M15 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3z"></path>
                </svg>
                Soporte
                <span className="flex absolute -top-2 left-16">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              </a>

              <div className="border-l border-white-600 h-14 opacity-25"></div>

              {/* Usuario */}
              <a className="flex items-center hover:text-gray-200" href="#">
                <Dropdown />
              </a>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default Navbar;