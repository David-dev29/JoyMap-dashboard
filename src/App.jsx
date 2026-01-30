// App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './Components/ProtectedRoute';

// Layouts
import { MainLayout } from './components/layout';

// Auth Pages
import Login from './Pages/Auth/Login';
import Unauthorized from './Pages/Auth/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBusinesses from './pages/admin/Businesses';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';
import AdminCustomers from './pages/admin/Customers';
import AdminDiscounts from './pages/admin/Discounts';
import AdminReviews from './pages/admin/Reviews';
import AdminSalesHistory from './pages/admin/SalesHistory';

// Admin Business Management Pages
import AdminBusinessProfile from './pages/admin/business/BusinessProfile';
import AdminBusinessProducts from './pages/admin/business/BusinessProducts';
import AdminProductCategories from './pages/admin/business/ProductCategories';
import AdminBusinessOrders from './pages/admin/business/BusinessOrders';
import AdminBusinessCoupons from './pages/admin/business/Coupons';

// Business Pages
import BusinessDashboard from './pages/business/Dashboard';
import MyBusiness from './pages/business/MyBusiness';
import BusinessSettings from './pages/business/Settings';
import BusinessProducts from './pages/business/Products';
import BusinessProductCategories from './pages/business/ProductCategories';
import BusinessOrders from './pages/business/Orders';
import BusinessInventory from './pages/business/Inventory';
import BusinessSales from './pages/business/Sales';
import BusinessCoupons from './pages/business/Coupons';

// Shared Pages
import NotFound from './pages/shared/NotFound';

// Legacy Pages (will be migrated later)
import Panel from './Pages/Panel';
import OrdersDashboard from './Pages/OrdersPDV/OrdersDashboard';
import InventoryPage from './Pages/Inventory/Inventory';
import ClientsPage from './Pages/Customers/Customers';
import DiscountCodesPage from './Pages/Marketing/Discounts';
import SalesPage from './Pages/Sales/OrderHistory';
import FinancialRecords from './Pages/Sales/FinalcialRecords';
import CashCount from './Pages/Sales/Cashcount';
import WhatsAppChatbotRecovery from './Pages/ChatBot/WhatsAppChatbotRecovery';
import BusinessesManager from './Pages/Businesses/BusinessesManager';

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  return <BusinessDashboard />;
};

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Root - redirect based on role
      {
        index: true,
        element: <RoleBasedRedirect />,
      },

      // ============================================
      // ADMIN ROUTES
      // ============================================
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'admin/businesses',
        element: <AdminBusinesses />,
      },
      {
        path: 'admin/users',
        element: <AdminUsers />,
      },
      {
        path: 'admin/categories',
        element: <AdminCategories />,
      },
      {
        path: 'admin/chatbot',
        element: <WhatsAppChatbotRecovery />,
      },
      {
        path: 'admin/customers',
        element: <AdminCustomers />,
      },
      {
        path: 'admin/marketing/discounts',
        element: <AdminDiscounts />,
      },
      {
        path: 'admin/marketing/reviews',
        element: <AdminReviews />,
      },
      {
        path: 'admin/settings',
        element: <AdminSettings />,
      },
      {
        path: 'admin/reports',
        element: <AdminReports />,
      },
      {
        path: 'admin/sales/history',
        element: <AdminSalesHistory />,
      },

      // ============================================
      // ADMIN BUSINESS MANAGEMENT ROUTES
      // ============================================
      {
        path: 'admin/business/profile',
        element: <AdminBusinessProfile />,
      },
      {
        path: 'admin/business/products',
        element: <AdminBusinessProducts />,
      },
      {
        path: 'admin/business/product-categories',
        element: <AdminProductCategories />,
      },
      {
        path: 'admin/business/orders',
        element: <AdminBusinessOrders />,
      },
      {
        path: 'admin/business/coupons',
        element: <AdminBusinessCoupons />,
      },

      // ============================================
      // BUSINESS OWNER ROUTES
      // ============================================
      {
        path: 'my-business',
        element: <MyBusiness />,
      },
      {
        path: 'products',
        element: <BusinessProducts />,
      },
      {
        path: 'products/categories',
        element: <BusinessProductCategories />,
      },
      {
        path: 'orders',
        element: <BusinessOrders />,
      },
      {
        path: 'inventory',
        element: <BusinessInventory />,
      },
      {
        path: 'sales',
        element: <BusinessSales />,
      },
      {
        path: 'settings',
        element: <BusinessSettings />,
      },
      {
        path: 'coupons',
        element: <BusinessCoupons />,
      },
      // Legacy sales routes (redirect to new sales page)
      {
        path: 'sales/history',
        element: <BusinessSales />,
      },
      {
        path: 'sales/reports',
        element: <BusinessSales />,
      },
      {
        path: 'sales/cash-count',
        element: <CashCount />,
      },

      // ============================================
      // LEGACY ROUTES (for backwards compatibility)
      // ============================================
      {
        path: 'panel',
        element: <Panel />,
      },
      {
        path: 'businesses',
        element: <BusinessesManager />,
      },
      {
        path: 'ordersDashboard',
        element: <OrdersDashboard />,
      },
      {
        path: 'clients',
        element: <ClientsPage />,
      },
      {
        path: 'discounts',
        element: <DiscountCodesPage />,
      },
      {
        path: 'Orderhistory',
        element: <SalesPage />,
      },
      {
        path: 'Financialrecords',
        element: <FinancialRecords />,
      },
      {
        path: 'cashCount',
        element: <CashCount />,
      },
      {
        path: 'chatbot',
        element: <WhatsAppChatbotRecovery />,
      },

      // 404
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
