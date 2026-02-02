import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import { BusinessProvider } from '../../context/BusinessContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

// Desktop Layout Component
const DesktopLayout = ({ sidebarOpen, toggleSidebar, closeSidebar }) => {
  return (
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
  );
};

// Mobile Layout Component
const MobileLayoutWrapper = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
        }}
      />
    </div>
  );
};

const MainLayout = () => {
  const isMobile = useIsMobile(768);

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('sidebar_open');
    if (saved !== null) return JSON.parse(saved);
    // Default to open on desktop
    return true;
  });

  // Save sidebar state to localStorage (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar_open', JSON.stringify(sidebarOpen));
    }
  }, [sidebarOpen, isMobile]);

  // Close sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ThemeProvider>
      <BusinessProvider>
        {isMobile ? (
          <MobileLayoutWrapper />
        ) : (
          <DesktopLayout
            sidebarOpen={sidebarOpen}
            toggleSidebar={toggleSidebar}
            closeSidebar={closeSidebar}
          />
        )}
      </BusinessProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
