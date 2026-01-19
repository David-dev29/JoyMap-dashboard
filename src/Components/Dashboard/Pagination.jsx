import React, { useState } from 'react';


const categories = [
  { id: 'frutas-verduras', name: 'Frutas y Verduras' },
  { id: 'panaderia-tortilleria', name: 'Panadería y Tortillería' },
  { id: 'despensa', name: 'Despensa' },
  { id: 'carnes-pescados-mariscos', name: 'Carnes y Pescados' },
  { id: 'carnes-frias-embutidos', name: 'Carnes Frías' },
  { id: 'jugos-bebidas', name: 'Bebidas' },
  { id: 'higiene-belleza', name: 'Cuidado Personal y Limpieza' },
  { id: 'snack-botanas', name: 'Snacks y Botanas' },
  { id: 'articulos-hogar', name: 'Artículos del Hogar' },
  { id: 'mascotas', name: 'Mascotas' },
  { id: 'articulos-varios-fiesta', name: 'Fiesta y Varios' },
];

const Pagination = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <div className="flex items-center gap-4 py-2 px-4 w-full">
      <div
        className="flex gap-4 border-b border-gray-200 flex-grow overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map(category => {
          const isSelected = category.id === selectedCategoryId;
          return (
            <p
              key={category.id}
              className={`text-sm font-medium cursor-pointer border-b-2 pb-2 whitespace-nowrap
                ${isSelected
                  ? 'text-blue-700 border-blue-600'
                  : 'text-gray-600 border-transparent hover:text-blue-700 hover:border-blue-600'
                }`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </p>
          );
        })}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Pagination;






