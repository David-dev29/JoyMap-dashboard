import { useState, useEffect, useRef } from 'react';
import {
  Store,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Phone,
  Clock,
  DollarSign,
  Truck,
  ShoppingBag,
  X,
  Check,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Palette,
  RotateCcw,
  ChevronRight,
  Edit3,
  Mail,
} from 'lucide-react';
import {
  HiOutlineLocationMarker,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineCreditCard,
  HiOutlineTruck,
  HiOutlineColorSwatch,
  HiOutlinePencil,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import { Card, Button, Input, Toggle, MobileModal } from '../../components/ui';
import { getMyBusiness, updateBusiness } from '../../services/api';

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

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const MyBusiness = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [business, setBusiness] = useState(null);

  // Mobile modal states
  const [editModal, setEditModal] = useState({ open: false, section: null });
  const [tempFormData, setTempFormData] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    deliveryCost: 0,
    deliveryTimeMin: 30,
    deliveryTimeMax: 60,
    minOrderAmount: 0,
    isOpen: true,
  });

  // Images state
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Schedule state
  const [schedule, setSchedule] = useState({
    monday: { isOpen: true, open: '09:00', close: '21:00' },
    tuesday: { isOpen: true, open: '09:00', close: '21:00' },
    wednesday: { isOpen: true, open: '09:00', close: '21:00' },
    thursday: { isOpen: true, open: '09:00', close: '21:00' },
    friday: { isOpen: true, open: '09:00', close: '21:00' },
    saturday: { isOpen: true, open: '10:00', close: '22:00' },
    sunday: { isOpen: false, open: '10:00', close: '18:00' },
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: false,
    transfer: false,
  });

  // Brand color state
  const [brandColor, setBrandColor] = useState('#E53935');

  // Predefined brand colors
  const BRAND_COLORS = ['#E53935', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4', '#795548', '#607D8B'];

  // Load business data
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMyBusiness();
        const businessData = response.business || response.data || response;

        console.log('=== DEBUG MyBusiness ===');
        console.log('Business data:', businessData);

        if (!businessData || !businessData._id) {
          setError('No se encontro un negocio asociado a tu cuenta');
          setLoading(false);
          return;
        }

        setBusiness(businessData);

        setFormData({
          name: businessData.name || '',
          description: businessData.description || '',
          address: businessData.address || '',
          phone: businessData.phone || '',
          email: businessData.email || '',
          deliveryCost: businessData.deliveryCost || 0,
          deliveryTimeMin: businessData.deliveryTimeMin || businessData.deliveryTime?.min || 30,
          deliveryTimeMax: businessData.deliveryTimeMax || businessData.deliveryTime?.max || 60,
          minOrderAmount: businessData.minOrderAmount || 0,
          isOpen: businessData.isOpen !== undefined ? businessData.isOpen : true,
        });

        if (businessData.logo) {
          setLogoPreview(businessData.logo.startsWith('http') ? businessData.logo : `https://${businessData.logo}`);
        }
        if (businessData.banner) {
          setBannerPreview(businessData.banner.startsWith('http') ? businessData.banner : `https://${businessData.banner}`);
        }

        if (businessData.schedule) {
          setSchedule(businessData.schedule);
        }

        // Load payment methods
        if (businessData.paymentMethods) {
          setPaymentMethods({
            cash: businessData.paymentMethods.cash ?? true,
            card: businessData.paymentMethods.card ?? false,
            transfer: businessData.paymentMethods.transfer ?? false,
          });
        }

        // Load brand color
        if (businessData.brandColor) {
          setBrandColor(businessData.brandColor);
        }
      } catch (err) {
        console.error('Error loading business:', err);
        setError('Error al cargar los datos del negocio');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando datos del negocio...</span>
        </div>
      </div>
    );
  }

  // No business found
  if (!business && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sin negocio asignado</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            No tienes un negocio asociado a tu cuenta. Contacta al administrador para que te asigne uno.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError('');
  };

  const handleImageSelect = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') {
        setLogoPreview(reader.result);
        setLogoFile(file);
      } else {
        setBannerPreview(reader.result);
        setBannerFile(file);
      }
    };
    reader.readAsDataURL(file);
    setSuccess(false);
    setError('');
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    setSuccess(false);
  };

  const handlePaymentMethodChange = (method, value) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: value,
    }));
    setSuccess(false);
  };

  const handleBrandColorChange = (color) => {
    setBrandColor(color);
    setSuccess(false);
  };

  // Mobile modal handlers
  const openEditModal = (section) => {
    setTempFormData({ ...formData });
    setEditModal({ open: true, section });
  };

  const closeEditModal = () => {
    setEditModal({ open: false, section: null });
  };

  const saveEditModal = () => {
    setFormData(tempFormData);
    closeEditModal();
  };

  const handleTempInputChange = (field, value) => {
    setTempFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get today's schedule for mobile display
  const getTodaySchedule = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todaySchedule = schedule[today];
    if (!todaySchedule?.isOpen) return 'Cerrado hoy';
    return `${todaySchedule.open} - ${todaySchedule.close}`;
  };

  // Get active payment methods for mobile display
  const getActivePaymentMethods = () => {
    const methods = [];
    if (paymentMethods.cash) methods.push('Efectivo');
    if (paymentMethods.card) methods.push('Tarjeta');
    if (paymentMethods.transfer) methods.push('Transferencia');
    return methods.length > 0 ? methods.join(', ') : 'Ninguno';
  };

  const handleSubmit = async () => {
    if (!business) return;

    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('deliveryCost', formData.deliveryCost);
      formDataToSend.append('deliveryTimeMin', formData.deliveryTimeMin);
      formDataToSend.append('deliveryTimeMax', formData.deliveryTimeMax);
      formDataToSend.append('minOrderAmount', formData.minOrderAmount);
      formDataToSend.append('isOpen', formData.isOpen);
      formDataToSend.append('schedule', JSON.stringify(schedule));
      formDataToSend.append('paymentMethods', JSON.stringify(paymentMethods));
      formDataToSend.append('brandColor', brandColor);

      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (bannerFile) {
        formDataToSend.append('banner', bannerFile);
      }

      const response = await updateBusiness(business._id, formDataToSend);

      if (response.success || response.business) {
        setSuccess(true);
        setLogoFile(null);
        setBannerFile(null);
        if (response.business) {
          setBusiness(response.business);
        }
      } else {
        throw new Error(response.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving business:', err);
      setError(err.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mi Negocio</h1>
            <button
              onClick={handleSubmit}
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
            <span>Cambios guardados exitosamente</span>
          </div>
        )}
        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
            <HiOutlineX className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 space-y-4 pb-24">
          {/* Business Card with Logo */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
            {/* Banner */}
            <div
              className="h-24 bg-gradient-to-r from-primary-500 to-primary-600 relative"
              onClick={() => bannerInputRef.current?.click()}
            >
              {bannerPreview && (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 active:opacity-100">
                <HiOutlinePhotograph className="w-6 h-6 text-white" />
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageSelect('banner', e)}
              />
            </div>

            {/* Logo and Info */}
            <div className="px-4 pb-4 -mt-10">
              <div className="flex items-end gap-3">
                {/* Logo */}
                <div
                  className="relative w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 active:opacity-100">
                    <HiOutlinePhotograph className="w-5 h-5 text-white" />
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageSelect('logo', e)}
                  />
                </div>

                {/* Name and Status */}
                <div className="flex-1 min-w-0 pb-1">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {formData.name || 'Mi Negocio'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {formData.address || 'Sin direccion'}
                  </p>
                </div>
              </div>
            </div>

            {/* Open/Closed Toggle */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${formData.isOpen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formData.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
                <Toggle
                  checked={formData.isOpen}
                  onChange={(checked) => handleInputChange('isOpen', checked)}
                />
              </div>
            </div>
          </div>

          {/* Quick Info Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card divide-y divide-gray-100 dark:divide-gray-800">
            {/* Basic Info */}
            <button
              onClick={() => openEditModal('basic')}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Store className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">Informacion Basica</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {formData.name || 'Configurar nombre y descripcion'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Address */}
            <button
              onClick={() => openEditModal('address')}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineLocationMarker className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">Direccion</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {formData.address || 'Agregar direccion'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* Contact */}
            <button
              onClick={() => openEditModal('contact')}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlinePhone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">Contacto</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {formData.phone || formData.email || 'Agregar telefono o email'}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Schedule Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <button
              onClick={() => openEditModal('schedule')}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineClock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">Horarios</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hoy: {getTodaySchedule()}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Payment Methods Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <HiOutlineCreditCard className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Metodos de Pago</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getActivePaymentMethods()}</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-900 dark:text-white">Efectivo</span>
                </div>
                <Toggle
                  checked={paymentMethods.cash}
                  onChange={(checked) => handlePaymentMethodChange('cash', checked)}
                />
              </label>
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-900 dark:text-white">Tarjeta</span>
                </div>
                <Toggle
                  checked={paymentMethods.card}
                  onChange={(checked) => handlePaymentMethodChange('card', checked)}
                />
              </label>
              <label className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900 dark:text-white">Transferencia</span>
                </div>
                <Toggle
                  checked={paymentMethods.transfer}
                  onChange={(checked) => handlePaymentMethodChange('transfer', checked)}
                />
              </label>
            </div>
          </div>

          {/* Delivery Settings Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <button
              onClick={() => openEditModal('delivery')}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineTruck className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">Configuracion de Entrega</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Costo: ${formData.deliveryCost} | {formData.deliveryTimeMin}-{formData.deliveryTimeMax} min
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Brand Color Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <HiOutlineColorSwatch className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Color de Marca</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Color para tu menu</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleBrandColorChange(color)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all ${
                      brandColor === color
                        ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-300'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => handleBrandColorChange(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modals */}
        {/* Basic Info Modal */}
        <MobileModal
          isOpen={editModal.open && editModal.section === 'basic'}
          onClose={closeEditModal}
          title="Informacion Basica"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Nombre del Negocio"
              value={tempFormData.name || ''}
              onChange={(e) => handleTempInputChange('name', e.target.value)}
              placeholder="Ej: Taqueria El Buen Sabor"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Descripcion
              </label>
              <textarea
                value={tempFormData.description || ''}
                onChange={(e) => handleTempInputChange('description', e.target.value)}
                placeholder="Describe tu negocio..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" onClick={saveEditModal}>Guardar</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Address Modal */}
        <MobileModal
          isOpen={editModal.open && editModal.section === 'address'}
          onClose={closeEditModal}
          title="Direccion"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Direccion Completa"
              value={tempFormData.address || ''}
              onChange={(e) => handleTempInputChange('address', e.target.value)}
              placeholder="Calle 60 #123, Centro"
            />
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" onClick={saveEditModal}>Guardar</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Contact Modal */}
        <MobileModal
          isOpen={editModal.open && editModal.section === 'contact'}
          onClose={closeEditModal}
          title="Contacto"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Telefono"
              value={tempFormData.phone || ''}
              onChange={(e) => handleTempInputChange('phone', e.target.value)}
              placeholder="+52 999 123 4567"
            />
            <Input
              label="Email"
              type="email"
              value={tempFormData.email || ''}
              onChange={(e) => handleTempInputChange('email', e.target.value)}
              placeholder="negocio@ejemplo.com"
            />
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" onClick={saveEditModal}>Guardar</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Schedule Modal */}
        <MobileModal
          isOpen={editModal.open && editModal.section === 'schedule'}
          onClose={closeEditModal}
          title="Horarios de Operacion"
          size="xl"
          fullHeight
        >
          <div className="space-y-2">
            {DAYS_OF_WEEK.map(({ key, label }) => (
              <div
                key={key}
                className={`p-3 rounded-xl transition-colors ${
                  schedule[key]?.isOpen
                    ? 'bg-emerald-50 dark:bg-emerald-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Toggle
                    checked={schedule[key]?.isOpen}
                    onChange={(checked) => handleScheduleChange(key, 'isOpen', checked)}
                    size="sm"
                  />
                  <span className={`text-sm font-medium flex-1 ${
                    schedule[key]?.isOpen
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
                {schedule[key]?.isOpen && (
                  <div className="flex items-center gap-2 pl-10">
                    <input
                      type="time"
                      value={schedule[key]?.open || '09:00'}
                      onChange={(e) => handleScheduleChange(key, 'open', e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                    <span className="text-gray-400 text-sm">a</span>
                    <input
                      type="time"
                      value={schedule[key]?.close || '21:00'}
                      onChange={(e) => handleScheduleChange(key, 'close', e.target.value)}
                      className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeEditModal}>Cerrar</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Delivery Modal */}
        <MobileModal
          isOpen={editModal.open && editModal.section === 'delivery'}
          onClose={closeEditModal}
          title="Configuracion de Entrega"
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label="Costo de Envio"
              type="number"
              value={tempFormData.deliveryCost || 0}
              onChange={(e) => handleTempInputChange('deliveryCost', parseFloat(e.target.value) || 0)}
              min={0}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tiempo Min (min)"
                type="number"
                value={tempFormData.deliveryTimeMin || 30}
                onChange={(e) => handleTempInputChange('deliveryTimeMin', parseInt(e.target.value) || 0)}
                min={0}
              />
              <Input
                label="Tiempo Max (min)"
                type="number"
                value={tempFormData.deliveryTimeMax || 60}
                onChange={(e) => handleTempInputChange('deliveryTimeMax', parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <Input
              label="Monto Minimo de Pedido"
              type="number"
              value={tempFormData.minOrderAmount || 0}
              onChange={(e) => handleTempInputChange('minOrderAmount', parseFloat(e.target.value) || 0)}
              min={0}
            />
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeEditModal}>Cancelar</Button>
            <Button variant="primary" onClick={saveEditModal}>Guardar</Button>
          </MobileModal.Footer>
        </MobileModal>
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
            Mi Negocio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configura la informacion de {business?.name || 'tu negocio'}
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={saving ? null : <Save size={18} />}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl">
          <Check size={20} />
          <span>Cambios guardados exitosamente</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
          <X size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Images */}
        <div className="space-y-6">
          {/* Logo */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon size={18} />
              Logo del Negocio
            </h3>
            <div
              onClick={() => logoInputRef.current?.click()}
              className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer overflow-hidden group"
            >
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={32} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm">Subir logo</span>
                  <span className="text-xs">Recomendado: 200x200px</span>
                </div>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect('logo', e)}
            />
          </Card>

          {/* Banner */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon size={18} />
              Banner del Negocio
            </h3>
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer overflow-hidden group"
            >
              {bannerPreview ? (
                <>
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={32} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm">Subir banner</span>
                  <span className="text-xs">Recomendado: 1200x400px</span>
                </div>
              )}
            </div>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageSelect('banner', e)}
            />
          </Card>
        </div>

        {/* Center column - Basic info */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Store size={18} />
              Informacion Basica
            </h3>
            <div className="space-y-4">
              <Input
                label="Nombre del Negocio"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Taqueria El Buen Sabor"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Descripcion
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu negocio..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>
              <Input
                label="Direccion"
                leftIcon={<MapPin size={18} />}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Calle 60 #123, Centro"
              />
              <Input
                label="Telefono"
                leftIcon={<Phone size={18} />}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+52 999 123 4567"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="negocio@ejemplo.com"
              />
            </div>
          </Card>

          {/* Status */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Estado del Negocio</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formData.isOpen ? 'Activo y recibiendo pedidos' : 'Inactivo temporalmente'}
                </p>
              </div>
              <Toggle
                checked={formData.isOpen}
                onChange={(checked) => handleInputChange('isOpen', checked)}
              />
            </div>
          </Card>

          {/* Payment Methods */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <CreditCard size={18} />
              Metodos de Pago
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Selecciona los metodos de pago que acepta tu negocio
            </p>

            <div className="space-y-3">
              {/* Efectivo */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={paymentMethods.cash}
                  onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Banknote size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Efectivo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pago en efectivo al momento de la entrega</p>
                  </div>
                </div>
              </label>

              {/* Tarjeta */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={paymentMethods.card}
                  onChange={(e) => handlePaymentMethodChange('card', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Tarjeta</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pago con tarjeta de debito o credito</p>
                  </div>
                </div>
              </label>

              {/* Transferencia */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={paymentMethods.transfer}
                  onChange={(e) => handlePaymentMethodChange('transfer', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Smartphone size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Transferencia</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Transferencia bancaria o SPEI</p>
                  </div>
                </div>
              </label>
            </div>
          </Card>

          {/* Brand Color */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Palette size={18} />
              Color de Marca
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Este color se usara en las categorias y botones de tu menu
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {/* Color picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => handleBrandColorChange(e.target.value)}
                    className="w-14 h-14 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-slate-600"
                    style={{ padding: '2px' }}
                  />
                </div>

                {/* Predefined colors */}
                <div className="flex gap-2 flex-wrap flex-1">
                  {BRAND_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleBrandColorChange(color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                        brandColor === color
                          ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-2 ring-gray-400'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={() => handleBrandColorChange('#E53935')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <RotateCcw size={14} />
                Usar color por defecto
              </button>

              {/* Preview */}
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Vista previa:</p>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="px-4 py-1.5 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: brandColor }}
                  >
                    Categoria
                  </span>
                  <button
                    type="button"
                    className="px-4 py-1.5 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: brandColor }}
                  >
                    + Agregar
                  </button>
                  <span
                    className="px-4 py-1.5 rounded-lg text-sm font-medium border-2"
                    style={{ borderColor: brandColor, color: brandColor }}
                  >
                    Seleccionado
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column - Delivery & Schedule */}
        <div className="space-y-6">
          {/* Delivery settings */}
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Truck size={18} />
              Configuracion de Entrega
            </h3>
            <div className="space-y-4">
              <Input
                label="Costo de Envio"
                type="number"
                leftIcon={<DollarSign size={18} />}
                value={formData.deliveryCost}
                onChange={(e) => handleInputChange('deliveryCost', parseFloat(e.target.value) || 0)}
                min={0}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tiempo Min (min)"
                  type="number"
                  value={formData.deliveryTimeMin}
                  onChange={(e) => handleInputChange('deliveryTimeMin', parseInt(e.target.value) || 0)}
                  min={0}
                />
                <Input
                  label="Tiempo Max (min)"
                  type="number"
                  value={formData.deliveryTimeMax}
                  onChange={(e) => handleInputChange('deliveryTimeMax', parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
              <Input
                label="Monto Minimo de Pedido"
                type="number"
                leftIcon={<ShoppingBag size={18} />}
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
          </Card>

          {/* Schedule */}
          <Card className="overflow-hidden">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} />
              Horarios de Operacion
            </h3>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl transition-colors ${
                    schedule[key]?.isOpen
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-gray-50 dark:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Toggle
                      checked={schedule[key]?.isOpen}
                      onChange={(checked) => handleScheduleChange(key, 'isOpen', checked)}
                      size="sm"
                    />
                    <span className={`text-sm font-medium flex-1 ${
                      schedule[key]?.isOpen
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {label}
                    </span>
                  </div>
                  {schedule[key]?.isOpen && (
                    <div className="flex items-center gap-2 pl-8">
                      <input
                        type="time"
                        value={schedule[key]?.open || '09:00'}
                        onChange={(e) => handleScheduleChange(key, 'open', e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg"
                      />
                      <span className="text-gray-400 text-sm">a</span>
                      <input
                        type="time"
                        value={schedule[key]?.close || '21:00'}
                        onChange={(e) => handleScheduleChange(key, 'close', e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1.5 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyBusiness;
