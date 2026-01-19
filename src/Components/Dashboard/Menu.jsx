import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  DollarSign,
  Menu,
  Coffee,
  Box,
  MessageCircle,
  Users,
  Tag,
  Settings,
  Eye,
  QrCode,
  MapPin,
  Store,
} from "lucide-react";

const SidebarMenu = ({ collapsed }) => {
  const [openMenu, setOpenMenu] = useState("menu");
  const navigate = useNavigate();
  const location = useLocation();

  const renderArrow = (menu) =>
    openMenu === menu ? <ChevronUp size={16} /> : <ChevronDown size={16} />;

  const menuItemClass = `
    flex items-center space-x-3 w-full px-3 py-3 text-sm font-medium transition-all duration-300 ease-out
    hover:bg-gradient-to-r hover:from-white/30 hover:to-transparent hover:shadow-inner hover:scale-[1.01]
    text-white/90 border-l-2 border-transparent
  `;

  const isActive = (path) =>
    location.pathname === path
      ? "bg-gradient-to-r from-white/30 to-transparent shadow-inner scale-[1.01] border-l-4 border-yellow-50"
      : "";

  const isSectionActive = (menuKey, paths = []) => {
    return openMenu === menuKey || paths.some((p) => location.pathname.startsWith(p));
  };

  const menuOpenClass = "bg-orange-500/90 shadow-inner";

  const renderSubMenu = (items) => (
    <div className="relative pl-1">
      <div className="absolute left-5 top-0 bottom-0 w-[1px] bg-orange-400 rounded-full"></div>
      <div className="flex flex-col relative ml-4">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => item.path && navigate(item.path)}
            className={`w-full text-left px-4 py-2 text-sm transition-all duration-300 hover:bg-black/30 hover:text-white text-white/80 relative ${
              item.path && location.pathname === item.path
                ? "after:absolute after:left-0 after:top-0 after:bottom-0 after:w-[2px] after:bg-white/90 after:rounded-full"
                : ""
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex items-center justify-start p-4 bg-slate-50">
      <div
        className={`h-full flex flex-col z-50 transition-all duration-500 ease-in-out
          ${collapsed ? "w-16 md:w-20" : "w-48 md:w-56"}
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          shadow-2xl backdrop-blur-xl
          border border-white/10
          overflow-hidden
          rounded-3xl
        `}
        style={{
          background: `
            linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, transparent 50%, rgba(139, 92, 246, 0.1) 100%),
            linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
          `,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

        <div className="flex-1 overflow-y-auto p-4 pb-6 relative z-10">
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {!collapsed && (
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
              Principal
            </div>
          )}

          {/* Pedidos PDV */}
          <button
            onClick={() => navigate("/ordersDashboard")}
            className={`${menuItemClass} rounded-xl ${isActive("/ordersDashboard")}`}
          >
            <ShoppingCart size={16} className="text-white" />
            {!collapsed && <span className="font-semibold text-white">Pedidos PDV</span>}
          </button>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div
                className="w-2 h-2 bg-orange-500 rounded-full shadow-lg"
                style={{ boxShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}
              ></div>
            </div>
          </div>

          {!collapsed && (
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
              Operaciones
            </div>
          )}

          {/* 🏪 NEGOCIOS - NUEVA SECCIÓN */}
          <button
            onClick={() => navigate("/businesses")}
            className={`${menuItemClass} rounded-xl ${isActive("/businesses")} relative`}
          >
            <MapPin size={16} className="text-white" />
            {!collapsed && <span className="font-semibold text-white">Negocios</span>}
            {!collapsed && (
              <div className="absolute top-3 right-4">
                <span className="inline-flex rounded-full h-2 w-2 bg-blue-400 shadow-lg border border-blue-200"></span>
              </div>
            )}
          </button>

          {/* Ventas */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenMenu(openMenu === "ventas" ? null : "ventas")}
              className={`${menuItemClass} justify-between rounded-xl ${
                isSectionActive("ventas", ["/Orderhistory", "/Financialrecords", "/cashCount"])
                  ? menuOpenClass + " rounded-b-none"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <DollarSign size={16} className="text-white" />
                {!collapsed && <span>Ventas</span>}
              </div>
              {!collapsed && <div className="text-white/80">{renderArrow("ventas")}</div>}
            </button>
            <div
              className={`transition-all duration-500 overflow-hidden bg-slate-800/50 ${
                openMenu === "ventas" && !collapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {renderSubMenu([
                { label: "Historial de pedidos", path: "/Orderhistory" },
                { label: "Reportes" },
                { label: "Registros financieros", path: "/Financialrecords" },
                { label: "Arqueo de caja", path: "/cashCount" },
              ])}
            </div>
          </div>

          {/* Menú */}
          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenMenu(openMenu === "menu" ? null : "menu")}
              className={`${menuItemClass} justify-between rounded-xl ${
                isSectionActive("menu", ["/panel", "/welcomePage", "/orderConfiguration"])
                  ? menuOpenClass + " rounded-b-none"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Menu size={16} className="text-white" />
                {!collapsed && <span>Menú</span>}
              </div>
              {!collapsed && <div className="text-white/80">{renderArrow("menu")}</div>}
            </button>
            <div
              className={`transition-all duration-500 overflow-hidden bg-slate-800/50 ${
                openMenu === "menu" && !collapsed ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {renderSubMenu([
                { label: "Página de productos", path: "/panel" },
                { label: "Página de bienvenida", path: "/welcomePage" },
                { label: "Configuración de pedidos", path: "/orderConfiguration" },
              ])}
            </div>
          </div>

          <button
            onClick={() => navigate("/kitchenMain")}
            className={`${menuItemClass} rounded-xl ${isActive("/kitchenMain")}`}
          >
            <Coffee size={16} className="text-white" />
            {!collapsed && <span>Cocina</span>}
          </button>

          <button
            onClick={() => navigate("/inventory")}
            className={`${menuItemClass} rounded-xl ${isActive("/inventory")}`}
          >
            <Box size={16} className="text-white" />
            {!collapsed && <span>Inventario</span>}
          </button>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div
                className="w-2 h-2 bg-purple-500 rounded-full shadow-lg"
                style={{ boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
              ></div>
            </div>
          </div>

          {!collapsed && (
            <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-3">
              Gestión
            </div>
          )}

          <button 
            onClick={() => navigate("/chatbot")}
            className={menuItemClass + " relative rounded-xl"}>
            <MessageCircle size={16} className="text-white" />
            {!collapsed && <span>Chatbot</span>}
            {!collapsed && (
              <div className="absolute top-3 right-4 flex">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-yellow-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400 shadow-lg border border-yellow-200"></span>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate("/clients")}
            className={`${menuItemClass} rounded-xl ${isActive("/clients")}`}
          >
            <Users size={16} className="text-white" />
            {!collapsed && <span>Clientes</span>}
          </button>

          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenMenu(openMenu === "promociones" ? null : "promociones")}
              className={`${menuItemClass} justify-between rounded-xl ${
                isSectionActive("promociones", ["/discounts"])
                  ? menuOpenClass + " rounded-b-none"
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Tag size={16} className="text-white" />
                {!collapsed && <span>Marketing</span>}
              </div>
              {!collapsed && <div className="text-white/80">{renderArrow("promociones")}</div>}
            </button>
            <div
              className={`transition-all duration-500 overflow-hidden bg-slate-800/50 ${
                openMenu === "promociones" && !collapsed ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {renderSubMenu([
                { label: "Códigos de descuento", path: "/discounts" },
                { label: "Reseñas" },
              ])}
            </div>
          </div>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            <div className="relative flex justify-center">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full shadow-lg"
                style={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
              ></div>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden">
            <button
              onClick={() =>
                setOpenMenu(openMenu === "configuraciones" ? null : "configuraciones")
              }
              className={`${menuItemClass} justify-between rounded-xl ${
                isSectionActive("configuraciones") ? menuOpenClass : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <Settings size={16} className="text-white" />
                {!collapsed && <span>Configuraciones</span>}
              </div>
              {!collapsed && <div className="text-white/80">{renderArrow("configuraciones")}</div>}
            </button>
          </div>
        </div>

        <div className="px-3 py-3 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent border-t border-white/20">
          <div className="flex overflow-hidden rounded-xl shadow-xl border border-white/20 bg-black/40 backdrop-blur-sm">
            <button
              onClick={() => navigate("/preview")}
              className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black/30 hover:scale-105 border-r border-white/20"
            >
              <Eye size={16} />
              {!collapsed && <span className="text-xs">Vista previa</span>}
            </button>
            <button
              onClick={() => navigate("/qr-links")}
              className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-black/30 hover:scale-105"
            >
              <QrCode size={16} />
              {!collapsed && <span className="text-xs">QR y enlaces</span>}
            </button>
          </div>
        </div>

        <div className="py-2 text-center text-[10px] text-white/80 bg-slate-900 border-t border-white/20">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm"
              style={{ boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)" }}
            ></div>
            <span>Conectado 10 Mbps(4g) / 50ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;