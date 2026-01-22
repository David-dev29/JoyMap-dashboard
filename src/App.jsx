// App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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

// Business Pages
import BusinessDashboard from './pages/business/Dashboard';

// Shared Pages
import NotFound from './pages/shared/NotFound';

// Legacy Pages (will be migrated later)
import Panel from './Pages/Panel';
import OrdersDashboard from './Pages/OrdersPDV/OrdersDashboard';
import KitchenMain from './Pages/Kitchen/MainKitchen';
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
        element: <ClientsPage />,
      },
      {
        path: 'admin/marketing/discounts',
        element: <DiscountCodesPage />,
      },
      {
        path: 'admin/marketing/reviews',
        element: <div className="p-4 text-gray-500">Pagina de resenas (proximamente)</div>,
      },
      {
        path: 'admin/settings',
        element: <AdminSettings />,
      },
      {
        path: 'admin/reports',
        element: <div className="p-4 text-gray-500">Reportes globales (proximamente)</div>,
      },

      // ============================================
      // BUSINESS ROUTES
      // ============================================
      {
        path: 'products',
        element: <Panel />,
      },
      {
        path: 'orders',
        element: <OrdersDashboard />,
      },
      {
        path: 'kitchen',
        element: <KitchenMain />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'sales/history',
        element: <SalesPage />,
      },
      {
        path: 'sales/reports',
        element: <FinancialRecords />,
      },
      {
        path: 'sales/cash-count',
        element: <CashCount />,
      },
      {
        path: 'my-business',
        element: <div className="p-4 text-gray-500">Mi negocio (proximamente)</div>,
      },
      {
        path: 'settings',
        element: <div className="p-4 text-gray-500">Configuracion (proximamente)</div>,
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
        path: 'kitchenMain',
        element: <KitchenMain />,
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
    </AuthProvider>
  );
}
