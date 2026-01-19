import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WhatsAppDropdown = ({ phone }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-[145px]">
      {/* Botón principal */}
      <div
        className="flex items-center justify-between border border-green-200 rounded-md px-2 py-0.5 text-[12px] font-semibold text-gray-900 gap-1 cursor-pointer"
        onClick={toggleDropdown}
      >
        <MessageCircle className="w-3 h-3 text-green-500" />
        <span className="truncate text-center">+52 {phone}</span>
        {isDropdownOpen ? (
          <ChevronUp className="w-4 h-4 text-green-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-green-500" />
        )}
      </div>

      {/* Dropdown con animación */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-40 flex flex-col"
          >
            {/* Sección 1 */}
            <div className="py-1">
              <button
                className="flex items-center w-full px-4 py-3 hover:bg-green-50 text-sm text-green-600 font-semibold gap-x-2"
                onClick={() => setIsDropdownOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                Conversar con el cliente
              </button>
            </div>
            <div className="border-t border-gray-200"></div>

            {/* Sección 2 */}
            <div className="py-1">
              <button
                className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-sm font-medium"
                onClick={() => setIsDropdownOpen(false)}
              >
                Enviar resumen del pedido
              </button>
            </div>
            <div className="border-t border-gray-200"></div>

            {/* Sección 3 */}
            <div className="py-1">
              <button
                className="flex items-center w-full px-4 py-3 hover:bg-gray-50 text-sm font-medium"
                onClick={() => setIsDropdownOpen(false)}
              >
                Pedir confirmación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppDropdown;
