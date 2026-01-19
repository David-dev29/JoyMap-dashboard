// DashboardLayout.jsx
import React, { useState } from 'react';
import Navbar from '../Components/Dashboard/Header2';
import SidebarMenu from '../Components/Dashboard/Menu';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="flex-shrink-0">
        <Navbar
          isSidebarOpen={!sidebarCollapsed} // <-- indica si está abierto
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Contenedor principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fijo a la izquierda */}
        <div className="flex-shrink-0 transition-all duration-300">
          <SidebarMenu collapsed={sidebarCollapsed} />
        </div>

        {/* Contenido que ocupa todo el espacio sobrante */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
