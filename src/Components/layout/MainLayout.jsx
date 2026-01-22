import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { BusinessProvider } from '../../context/BusinessContext';
import { ThemeProvider } from '../../context/ThemeContext';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('sidebar_open');
    if (saved !== null) return JSON.parse(saved);
    // Default to open on desktop, closed on mobile
    return window.innerWidth >= 768;
  });

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar_open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ThemeProvider>
      <BusinessProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
              {/* Header */}
              <Header
                onToggleSidebar={toggleSidebar}
                isSidebarOpen={sidebarOpen}
              />

              {/* Page content */}
              <main className="flex-1 p-4 md:p-6 overflow-auto">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </BusinessProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
