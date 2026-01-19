import React, { useState, useEffect, useRef } from "react";
import { Clock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const StatusDropdown = ({ currentStatus, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "preparing", label: "En preparación" },
    { value: "ready", label: "Listo" },
    { value: "onTheWay", label: "En camino" },
    { value: "arrived", label: "Ha llegado" },
    { value: "delivered", label: "Entregado" },
  ];

  return (
    <div ref={dropdownRef} className="relative w-[80px]">
      {/* Botón principal */}
      <div
        className="flex flex-col items-center justify-center px-2 py-1.5 border border-gray-400 rounded-lg text-sm font-bold text-gray-600 cursor-pointer hover:bg-gray-100"
        onClick={toggleDropdown}
      >
        <Clock className="w-5 h-5 text-gray-600" />
        <span className="text-[12px]">Estado</span>
      </div>

      {/* Dropdown con animación */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40 flex flex-col"
          >
            {options.map((opt, index) => {
              const isSelected = currentStatus === opt.value;
              return (
                <React.Fragment key={opt.value}>
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-left hover:bg-gray-50 gap-3"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                    >
                      {/* Círculo numerado */}
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                          isSelected
                            ? "bg-green-500 border-green-500"
                            : "border-green-600 text-green-700"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-[11px] font-medium text-green-600">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <span
                        className={`${
                          isSelected
                            ? "font-semibold text-green-600"
                            : "text-green-700"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  </div>
                  {index < options.length - 1 && (
                    <div className="border-t border-gray-200"></div>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusDropdown;
