import React, { useState } from "react";
import { Bike, ShoppingBag, HandPlatter, Utensils, SlidersHorizontal, Grip } from "lucide-react";

const ServiceTypeTabs = ({ serviceTypes }) => {
  // "domicilio" activo por defecto
  const [activeTab, setActiveTab] = useState("domicilio");

  const iconsMap = {
    delivery: Bike,
    pickup: ShoppingBag,
    dinein: Utensils,
  };

  return (
    <div className="flex items-center">
      <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden shadow-md">
        {serviceTypes.map((service, index) => {
          const Icon = iconsMap[service.id] || HandPlatter;
          const isActive = activeTab === service.id;

          // Bordes redondeados en los extremos
          const borderRadius =
            index === 0
              ? "rounded-l-lg"
              : index === serviceTypes.length - 1
              ? "rounded-r-lg"
              : "";

          return (
            <button
              key={service.id}
              onClick={() => setActiveTab(service.id)}
              className={`
                flex items-center flex-1 space-x-2 px-4 py-2 cursor-pointer focus:outline-none
                transition-colors 
                ${borderRadius}
                ${isActive
                  ? "bg-orange-50 text-orange-600 border border-orange-500"
                  : "text-gray-700 hover:bg-gray-50 border-r border-gray-200"}
              `}
            >
              <Grip className={`w-3 h-3 ${isActive ? "text-orange-600" : "text-gray-600"}`} />
              <Icon className={`w-6 h-6 ${isActive ? "text-orange-600" : "text-gray-600"}`} />
              <span className={`font-bold  ${isActive ? "text-orange-600" : "text-gray-700"}`}>
                {service.label}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full 
                  ${isActive ? "bg-white shadow-md text-orange-600" : "bg-gray-100 text-gray-600"}`}
              >
                {service.count}
              </span>
            </button>
          );
        })}

        {/* Botón de filtro al final */}
        <button className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50 border-l border-gray-200">
          <SlidersHorizontal className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ServiceTypeTabs;
