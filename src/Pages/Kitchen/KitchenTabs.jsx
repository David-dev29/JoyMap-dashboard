import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const KitchenTabs = ({ tabs, activeTab, onTabChange }) => {
  const containerRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // 🔹 Revisar overflow y actualizar visibilidad de flechas
  const updateArrows = () => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowLeft(scrollLeft > 0);
    setShowRight(scrollLeft + clientWidth < scrollWidth);
  };

  useEffect(() => {
    updateArrows();
    const handleResize = () => updateArrows();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tabs]);

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;

    if (direction === 'left') {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' }); // ir al inicio
    } else {
      containerRef.current.scrollTo({ left: scrollWidth - clientWidth, behavior: 'smooth' }); // ir al final
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-[500px]  bg-white rounded-lg  overflow-hidden">
      {/* Flecha izquierda */}
      {showLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-30 h-8 px-1 shadow-md flex items-center rounded-full justify-center bg-white bg-opacity-100 hover:bg-opacity-70"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Contenedor de tabs */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-none  w-full"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={updateArrows} // actualizar flechas al hacer scroll
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 font-medium whitespace-nowrap  border-r transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600 border border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`inline-flex items-center justify-center w-5 h-5 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Flecha derecha */}
      {showRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-30 h-8 px-1 shadow-md flex items-center justify-center rounded-full bg-white bg-opacity-100 hover:bg-opacity-70"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default KitchenTabs;
