import React from 'react';

const HeaderNav = () => {
  return (
    <nav className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between shadow-xl">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Logo */}
        <a href="/" className="text-xl font-bold flex items-center space-x-1">
          <span className="text-2xl"><img src="https://panel.olaclick.app/assets/olaclick-logo-zNyrFYA-.svg" alt="logo" /></span>
        </a>
        
        {/* Update plan button */}
        <button className="bg-blue-500 hover:bg-blue-700 px-4 py-1.5 rounded-md text-sm flex items-center">
          <span className="mr-2">⚡</span>
          Actualiza tu plan
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-6">
        {/* Notification bell */}
        <button className="hover:bg-blue-700 p-2 rounded-full">
          <span className="text-xl">🔔</span>
        </button>

        {/* Support */}
        <button className="flex items-center space-x-2 hover:bg-blue-700 p-2 rounded-lg">
          <span className="text-xl">🎮</span>
          <span>Soporte</span>
        </button>

        {/* Store selector */}
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">Air York Store</span>
          </div>
          <button className="flex items-center space-x-2 hover:bg-blue-700 p-1 rounded-lg">
            <img 
              src="/api/placeholder/32/32" 
              alt="Store avatar" 
              className="w-8 h-8 rounded-full"
            />
            <span className="text-lg">▼</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default HeaderNav;