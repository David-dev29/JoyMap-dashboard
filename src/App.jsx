// App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from './Layouts/DashboardLayout';

import OrderAcceptance from './Pages/Menu/OrderConfiguration';
import Profile from './Pages/Menu/Profile';
import WelcomePage from './Pages/Menu/Welcome';
import Panel from './Pages/Panel';
import OrdersDashboard from './Pages/OrdersPDV/OrdersDashboard';
import KitchenMain from './Pages/Kitchen/MainKitchen';
import InventoryPage from './Pages/Inventory/Inventory';
import ClientsPage from './Pages/Customers/Customers';
import DiscountCodesPage from './Pages/Marketing/Discounts';
import SalesPage from './Pages/Sales/OrderHistory.jsx';
import FinancialRecords from './Pages/Sales/FinalcialRecords.jsx';
import CashCount from './Pages/Sales/CashCount.jsx';
import WhatsAppChatbotRecovery from './Pages/ChatBot/WhatsAppChatbotRecovery.jsx';
import BusinessesManager from './Pages/Businesses/BusinessesManager.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />, // Layout con Navbar + Sidebar
    children: [
      {
        index: true,
        element: <Panel />, // Ruta principal
      },
      {
        path: "panel",
        element: <Panel />,
      },
      {
        path: "businesses",
        element: <BusinessesManager />,
      },
      {
        path: "welcomePage",
        element: <WelcomePage />,
      },
      {
        path: "orderConfiguration",
        element: <OrderAcceptance />,
      },
      {
        path: "ordersDashboard",
        element: <OrdersDashboard />,
      },
      {
        path: "kitchenMain",
        element: <KitchenMain />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "discounts",
        element: <DiscountCodesPage />,
      },
      {
        path: "Orderhistory",
        element: <SalesPage />,
      },
      {
        path: "Financialrecords",
        element: <FinancialRecords />,
      },
      {
        path: "cashCount",
        element: <CashCount />,
      },
      {
        path: "chatbot",
        element: <WhatsAppChatbotRecovery />,
      },
      // Agrega más rutas según necesites
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

