import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Printer,
  ChefHat,
  HelpCircle,
  Save,
  Check,
  X,
  Mail,
  Smartphone,
  Volume2,
  Receipt,
  Clock,
  MessageSquare,
  Moon,
  Sun,
  LogOut,
  User,
  ChevronRight,
} from 'lucide-react';
import {
  HiOutlineBell,
  HiOutlinePrinter,
  HiOutlineOfficeBuilding,
  HiOutlineQuestionMarkCircle,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLogout,
  HiOutlineUser,
} from 'react-icons/hi';
import { Card, Button, Toggle } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

const BusinessSettings = () => {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth() || {};
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNewOrder: true,
    emailOrderCancelled: true,
    pushNewOrder: true,
    pushOrderCancelled: false,
    soundNewOrder: true,
  });

  // Print settings
  const [printSettings, setPrintSettings] = useState({
    autoPrint: false,
    printTicket: true,
    printKitchenOrder: true,
    copies: 1,
  });

  // Kitchen settings
  const [kitchenSettings, setKitchenSettings] = useState({
    autoAcceptOrders: false,
    defaultPrepTime: 15,
    showOrderTimer: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('business_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.printSettings) setPrintSettings(parsed.printSettings);
        if (parsed.kitchenSettings) setKitchenSettings(parsed.kitchenSettings);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handlePrintChange = (key, value) => {
    setPrintSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleKitchenChange = (key, value) => {
    setKitchenSettings(prev => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Save to localStorage
      const settings = {
        notifications,
        printSettings,
        kitchenSettings,
      };
      localStorage.setItem('business_settings', JSON.stringify(settings));

      setSuccess(true);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
  };

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configuracion</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium text-sm disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiOutlineCheck className="w-5 h-5" />
              )}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {/* Success/Error Toast */}
        {success && (
          <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm">
            <HiOutlineCheck className="w-5 h-5 flex-shrink-0" />
            <span>Configuracion guardada</span>
          </div>
        )}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
            <HiOutlineX className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 space-y-4 pb-24">
          {/* Notifications Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <HiOutlineBell className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email - Nuevo pedido</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recibir email al recibir pedido</p>
                </div>
                <Toggle
                  checked={notifications.emailNewOrder}
                  onChange={(checked) => handleNotificationChange('emailNewOrder', checked)}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Push - Nuevo pedido</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notificacion push al recibir pedido</p>
                </div>
                <Toggle
                  checked={notifications.pushNewOrder}
                  onChange={(checked) => handleNotificationChange('pushNewOrder', checked)}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Sonido de alerta</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reproducir sonido al recibir pedido</p>
                </div>
                <Toggle
                  checked={notifications.soundNewOrder}
                  onChange={(checked) => handleNotificationChange('soundNewOrder', checked)}
                />
              </div>
            </div>
          </div>

          {/* Print Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <HiOutlinePrinter className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Impresion</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Impresion automatica</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir pedidos al recibirlos</p>
                </div>
                <Toggle
                  checked={printSettings.autoPrint}
                  onChange={(checked) => handlePrintChange('autoPrint', checked)}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ticket del cliente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir ticket para el cliente</p>
                </div>
                <Toggle
                  checked={printSettings.printTicket}
                  onChange={(checked) => handlePrintChange('printTicket', checked)}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Comanda de cocina</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir comanda para la cocina</p>
                </div>
                <Toggle
                  checked={printSettings.printKitchenOrder}
                  onChange={(checked) => handlePrintChange('printKitchenOrder', checked)}
                />
              </div>
            </div>
          </div>

          {/* Kitchen Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Cocina</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Aceptar automaticamente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Confirmar pedidos automaticamente</p>
                </div>
                <Toggle
                  checked={kitchenSettings.autoAcceptOrders}
                  onChange={(checked) => handleKitchenChange('autoAcceptOrders', checked)}
                />
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mostrar temporizador</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ver tiempo transcurrido en ordenes</p>
                </div>
                <Toggle
                  checked={kitchenSettings.showOrderTimer}
                  onChange={(checked) => handleKitchenChange('showOrderTimer', checked)}
                />
              </div>
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tiempo de preparacion</p>
                <select
                  value={kitchenSettings.defaultPrepTime}
                  onChange={(e) => handleKitchenChange('defaultPrepTime', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm"
                >
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={25}>25 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  {isDarkMode ? (
                    <HiOutlineMoon className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <HiOutlineSun className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Apariencia</h3>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Modo oscuro</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cambiar tema de la aplicacion</p>
              </div>
              <Toggle checked={isDarkMode} onChange={toggleDarkMode} />
            </div>
          </div>

          {/* Account Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <HiOutlineUser className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Cuenta</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <div className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name || user?.email || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'Sin email'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <HiOutlineLogout className="w-5 h-5" />
                <span className="text-sm font-medium">Cerrar sesion</span>
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <HiOutlineQuestionMarkCircle className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Soporte</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm text-gray-900 dark:text-white">Centro de ayuda</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm text-gray-900 dark:text-white">Contactar soporte</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Version */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2">
            Version 1.0.0
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // DESKTOP VIEW
  // ============================================
  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuracion
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Personaliza las preferencias de tu negocio
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={saving ? null : <Save size={18} />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl">
          <Check size={20} />
          <span>Configuracion guardada exitosamente</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
          <X size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={18} className="text-indigo-500" />
            Notificaciones
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email - Nuevo pedido</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recibir email al recibir un pedido</p>
                </div>
              </div>
              <Toggle
                checked={notifications.emailNewOrder}
                onChange={(checked) => handleNotificationChange('emailNewOrder', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email - Pedido cancelado</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notificar cuando se cancele un pedido</p>
                </div>
              </div>
              <Toggle
                checked={notifications.emailOrderCancelled}
                onChange={(checked) => handleNotificationChange('emailOrderCancelled', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Push - Nuevo pedido</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Notificacion push al recibir pedido</p>
                </div>
              </div>
              <Toggle
                checked={notifications.pushNewOrder}
                onChange={(checked) => handleNotificationChange('pushNewOrder', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Sonido de alerta</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Reproducir sonido al recibir pedido</p>
                </div>
              </div>
              <Toggle
                checked={notifications.soundNewOrder}
                onChange={(checked) => handleNotificationChange('soundNewOrder', checked)}
              />
            </div>
          </div>
        </Card>

        {/* Print Settings */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Printer size={18} className="text-indigo-500" />
            Impresion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Printer size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Impresion automatica</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir pedidos al recibirlos</p>
                </div>
              </div>
              <Toggle
                checked={printSettings.autoPrint}
                onChange={(checked) => handlePrintChange('autoPrint', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Receipt size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ticket del cliente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir ticket para el cliente</p>
                </div>
              </div>
              <Toggle
                checked={printSettings.printTicket}
                onChange={(checked) => handlePrintChange('printTicket', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <ChefHat size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Comanda de cocina</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Imprimir comanda para la cocina</p>
                </div>
              </div>
              <Toggle
                checked={printSettings.printKitchenOrder}
                onChange={(checked) => handlePrintChange('printKitchenOrder', checked)}
              />
            </div>

            <div className="py-2">
              <div className="flex items-center gap-3 mb-2">
                <Receipt size={18} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Copias por pedido</p>
              </div>
              <select
                value={printSettings.copies}
                onChange={(e) => handlePrintChange('copies', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>1 copia</option>
                <option value={2}>2 copias</option>
                <option value={3}>3 copias</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Kitchen Settings */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChefHat size={18} className="text-indigo-500" />
            Cocina
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Check size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Aceptar automaticamente</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Confirmar pedidos automaticamente</p>
                </div>
              </div>
              <Toggle
                checked={kitchenSettings.autoAcceptOrders}
                onChange={(checked) => handleKitchenChange('autoAcceptOrders', checked)}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Mostrar temporizador</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ver tiempo transcurrido en ordenes</p>
                </div>
              </div>
              <Toggle
                checked={kitchenSettings.showOrderTimer}
                onChange={(checked) => handleKitchenChange('showOrderTimer', checked)}
              />
            </div>

            <div className="py-2">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tiempo de preparacion (min)</p>
              </div>
              <select
                value={kitchenSettings.defaultPrepTime}
                onChange={(e) => handleKitchenChange('defaultPrepTime', parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value={10}>10 minutos</option>
                <option value={15}>15 minutos</option>
                <option value={20}>20 minutos</option>
                <option value={25}>25 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Support */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle size={18} className="text-indigo-500" />
            Soporte
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare size={18} className="text-indigo-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Centro de ayuda</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Encuentra respuestas a preguntas frecuentes y tutoriales para usar la plataforma.
              </p>
              <Button variant="ghost" size="sm">
                Ver centro de ayuda
              </Button>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} className="text-indigo-500" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Contactar soporte</p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                ¿Tienes problemas? Contacta a nuestro equipo de soporte.
              </p>
              <Button variant="ghost" size="sm">
                Enviar mensaje
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Version del sistema: 1.0.0
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSettings;
