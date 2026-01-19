import React from "react";
import TemplateItem from "./TemplateItem";
import { ChevronRight } from "lucide-react";
import OrderUpdatesComponent from "./OrderUpdatesComponent";

export default function TemplateList({
  templates,
  templateConfig,
  activeTemplate,
  setActiveTemplate,
  toggleTemplate,
  orderStatuses,
  toggleOrderStatus,
}) {
  return (
    <div className="w-1/3 max-w-sm bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      {/* --- Header --- */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Recuperador de Ventas
        </h1>
      </div>

      {/* --- Carrito abandonado destacado con toggle --- */}
      <div
        className={`flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer ${
          activeTemplate === "abandoned-cart" ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={() => setActiveTemplate("abandoned-cart")}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{templateConfig["abandoned-cart"].icon}</span>
          <div>
            <h3 className="font-medium text-gray-900">
              {templateConfig["abandoned-cart"].title}
            </h3>
            <p className="text-sm text-gray-500 truncate max-w-[180px]">
              {templateConfig["abandoned-cart"].subtitle}
            </p>
          </div>
        </div>

        {/* Toggle + Flecha */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTemplate("abandoned-cart");
            }}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
              templates["abandoned-cart"].enabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                templates["abandoned-cart"].enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* --- Lista de plantillas --- */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resuelve las preguntas de tus clientes
        </h2>
        <div className="space-y-1">
          {Object.entries(templates)
            .filter(([id]) => id !== "abandoned-cart")
            .map(([templateId, template]) => (
              <TemplateItem
                key={templateId}
                templateId={templateId}
                config={templateConfig[templateId]}
                template={template}
                activeTemplate={activeTemplate}
                setActiveTemplate={setActiveTemplate}
                toggleTemplate={toggleTemplate}
              />
            ))}
        </div>
      </div>

      {/* --- Order Updates integrado --- */}
      <OrderUpdatesComponent
        orderStatuses={orderStatuses}
        activeTemplate={activeTemplate}
        setActiveTemplate={setActiveTemplate}
        toggleOrderStatus={toggleOrderStatus}
      />
    </div>
  );
}
