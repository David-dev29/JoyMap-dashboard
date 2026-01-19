import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';

const CategoryButton = ({ onAddCategory, categories = [], selectedCategoryId, onSelectCategory }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const buttonRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

  const handleClickOutside = (event) => {
    if (buttonRef.current && !buttonRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const totalProducts = categories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0);

  return (
    <div className="inline-block text-left relative" ref={buttonRef}>
      {/* Botón principal */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center justify-start w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2 4.5h16v1H2v-1zm0 5h16v1H2v-1zm0 5h16v1H2v-1z"
            clipRule="evenodd"
          />
        </svg>
        Categorías
      </button>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto flex flex-col">
          <div className="py-2 flex-shrink-0">
            {/* Nueva categoría */}
            <button
              className="flex items-center w-full text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium"
              onClick={() => {
                onAddCategory();
                setIsDropdownOpen(false);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva categoría
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Cerrar todas las categorías */}
            <button
              className="flex items-center w-full text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium"
              onClick={() => alert('Cerrar todas las categorías')} // ⚠️ luego lo cambiamos por lógica real
            >
              <X className="w-4 h-4 mr-2" /> Cerrar todas
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Abrir todas las categorías */}
            <button
              className="flex items-center w-full text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium"
              onClick={() => alert('Abrir todas las categorías')} // ⚠️ luego lo cambiamos por lógica real
            >
              <ChevronDown className="w-4 h-4 mr-2" /> Abrir todas
            </button>

            <div className="border-t border-gray-200 my-1"></div>
          </div>

          {/* Lista de categorías */}
          <div className="flex-1 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat._id} // 👈 ahora usa el _id de MongoDB
                className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                  selectedCategoryId === cat._id
                    ? "bg-gray-100 font-semibold"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onSelectCategory(cat._id); // 👈 ahora selecciona con _id
                  setIsDropdownOpen(false);
                }}
              >
                {cat.name} ({cat.products?.length || 0})
              </button>
            ))}
          </div>

          {/* Resumen anclado abajo */}
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex justify-between text-xs text-gray-500 flex-shrink-0">
            <span>Total categorías: {categories.length}</span>
            <span>Total productos: {totalProducts}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryButton;
