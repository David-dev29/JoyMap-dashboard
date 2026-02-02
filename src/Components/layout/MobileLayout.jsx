import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import MobileHeader from './MobileHeader';
import BottomNavigation from './BottomNavigation';
import { ThemeProvider } from '../../context/ThemeContext';
import { BusinessProvider } from '../../context/BusinessContext';

// Pages that should show back button instead of menu
const backButtonPages = [
  '/products/new',
  '/products/edit',
  '/orders/',
  '/settings',
  '/my-business',
  '/coupons',
  '/inventory',
  '/admin/business/',
];

// Pages that should hide bottom navigation
const hideNavPages = [
  '/kitchen',
  '/login',
];

const MobileLayout = () => {
  const location = useLocation();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // Determine if current page needs back button
  const showBack = backButtonPages.some(path => location.pathname.includes(path));

  // Determine if bottom nav should be hidden
  const hideBottomNav = hideNavPages.some(path => location.pathname.includes(path));

  return (
    <ThemeProvider>
      <BusinessProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          {/* Mobile Header */}
          <MobileHeader
            showBack={showBack}
            showMenu={!showBack}
            onMenuClick={() => setIsSideMenuOpen(true)}
          />

          {/* Main Content */}
          <main className={`
            pb-20 md:pb-0
            ${hideBottomNav ? 'pb-0' : ''}
          `}>
            <Outlet />
          </main>

          {/* Bottom Navigation - hidden on tablet/desktop */}
          {!hideBottomNav && <BottomNavigation />}

          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            }}
          />
        </div>
      </BusinessProvider>
    </ThemeProvider>
  );
};

export default MobileLayout;
