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
  CreditCard,
  Banknote,
  Smartphone,
  Palette,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button, Input, Toggle } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import { updateBusiness, getBusinessById } from '../../../services/api';
import NoBusinessSelected from '../../../Components/Dashboard/NoBusinessSelected';
import { useIsMobile } from '../../../hooks/useIsMobile';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const BusinessProfile = () => {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading, setSelectedBusiness } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState('info');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
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
      if (!selectedBusiness) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBusinessById(selectedBusiness._id);
        const business = response.business || response.data || response;

        setFormData({
          name: business.name || '',
          description: business.description || '',
          address: business.address || '',
          phone: business.phone || '',
          deliveryCost: business.deliveryCost || 0,
          deliveryTimeMin: business.deliveryTimeMin || business.deliveryTime?.min || 30,
          deliveryTimeMax: business.deliveryTimeMax || business.deliveryTime?.max || 60,
          minOrderAmount: business.minOrderAmount || 0,
          isOpen: business.isOpen !== undefined ? business.isOpen : true,
        });

        if (business.logo) {
          setLogoPreview(business.logo.startsWith('http') ? business.logo : `https://${business.logo}`);
        }
        if (business.banner) {
          setBannerPreview(business.banner.startsWith('http') ? business.banner : `https://${business.banner}`);
        }

        if (business.schedule) {
          setSchedule(business.schedule);
        }

        // Load payment methods
        if (business.paymentMethods) {
          setPaymentMethods({
            cash: business.paymentMethods.cash ?? true,
            card: business.paymentMethods.card ?? false,
            transfer: business.paymentMethods.transfer ?? false,
          });
        }

        // Load brand color
        if (business.brandColor) {
          setBrandColor(business.brandColor);
        }
      } catch (err) {
        console.error('Error loading business:', err);
        setError('Error al cargar los datos del negocio');
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [selectedBusiness]);

  // Guard: No business selected
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return (
      <NoBusinessSelected
        icon={Store}
        title="Selecciona un negocio"
        message="Para editar el perfil del negocio, primero selecciona uno desde el selector en la barra superior."
      />
    );
  }

  // Loading state
  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando perfil...</span>
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

  const handleSubmit = async () => {
    if (!selectedBusiness) return;

    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone', formData.phone);
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

      const response = await updateBusiness(selectedBusiness._id, formDataToSend);

      if (response.success || response.business) {
        setSuccess(true);
        setLogoFile(null);
        setBannerFile(null);
        // Update the selected business in context
        if (response.business) {
          setSelectedBusiness(response.business);
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

  // Mobile collapsible section component
  const MobileSection = ({ id, title, icon: Icon, children }) => {
    const isExpanded = expandedSection === id;
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : id)}
          className="w-full px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Perfil del Negocio
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedBusiness?.name}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${formData.isOpen ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Success/Error messages */}
        {(success || error) && (
          <div className="px-4 pt-4">
            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm">
                <Check size={18} />
                <span>Cambios guardados</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                <X size={18} />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Mobile Sections */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {/* Images Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-4">
            <div className="flex gap-4">
              {/* Logo */}
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Upload size={20} />
                    <span className="text-xs mt-1">Logo</span>
                  </div>
                )}
              </div>
              {/* Banner */}
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="flex-1 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Upload size={20} />
                    <span className="text-xs mt-1">Banner</span>
                  </div>
                )}
              </div>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect('logo', e)} />
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect('banner', e)} />
          </div>

          {/* Basic Info Section */}
          <MobileSection id="info" title="Información Básica" icon={Store}>
            <div className="space-y-4">
              <Input
                label="Nombre"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm"
                />
              </div>
              <Input
                label="Dirección"
                leftIcon={<MapPin size={16} />}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
              <Input
                label="Teléfono"
                leftIcon={<Phone size={16} />}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Estado</p>
                  <p className="text-xs text-gray-500">{formData.isOpen ? 'Abierto' : 'Cerrado'}</p>
                </div>
                <Toggle
                  checked={formData.isOpen}
                  onChange={(checked) => handleInputChange('isOpen', checked)}
                />
              </div>
            </div>
          </MobileSection>

          {/* Delivery Section */}
          <MobileSection id="delivery" title="Entrega" icon={Truck}>
            <div className="space-y-4">
              <Input
                label="Costo de Envío"
                type="number"
                leftIcon={<DollarSign size={16} />}
                value={formData.deliveryCost}
                onChange={(e) => handleInputChange('deliveryCost', parseFloat(e.target.value) || 0)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Tiempo Mín (min)"
                  type="number"
                  value={formData.deliveryTimeMin}
                  onChange={(e) => handleInputChange('deliveryTimeMin', parseInt(e.target.value) || 0)}
                />
                <Input
                  label="Tiempo Máx (min)"
                  type="number"
                  value={formData.deliveryTimeMax}
                  onChange={(e) => handleInputChange('deliveryTimeMax', parseInt(e.target.value) || 0)}
                />
              </div>
              <Input
                label="Pedido Mínimo"
                type="number"
                leftIcon={<ShoppingBag size={16} />}
                value={formData.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
          </MobileSection>

          {/* Payment Methods Section */}
          <MobileSection id="payments" title="Métodos de Pago" icon={CreditCard}>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl">
                <input
                  type="checkbox"
                  checked={paymentMethods.cash}
                  onChange={(e) => handlePaymentMethodChange('cash', e.target.checked)}
                  className="w-5 h-5 text-emerald-600 rounded"
                />
                <Banknote size={18} className="text-emerald-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Efectivo</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl">
                <input
                  type="checkbox"
                  checked={paymentMethods.card}
                  onChange={(e) => handlePaymentMethodChange('card', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <CreditCard size={18} className="text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Tarjeta</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl">
                <input
                  type="checkbox"
                  checked={paymentMethods.transfer}
                  onChange={(e) => handlePaymentMethodChange('transfer', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <Smartphone size={18} className="text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">Transferencia</span>
              </label>
            </div>
          </MobileSection>

          {/* Brand Color Section */}
          <MobileSection id="brand" title="Color de Marca" icon={Palette}>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleBrandColorChange(color)}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      brandColor === color ? 'border-gray-900 dark:border-white ring-2 ring-offset-2' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => handleBrandColorChange(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-500">Color personalizado</span>
              </div>
            </div>
          </MobileSection>

          {/* Schedule Section */}
          <MobileSection id="schedule" title="Horarios" icon={Clock}>
            <div className="space-y-2">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl ${
                    schedule[key]?.isOpen ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Toggle
                      checked={schedule[key]?.isOpen}
                      onChange={(checked) => handleScheduleChange(key, 'isOpen', checked)}
                      size="sm"
                    />
                    <span className={`text-sm font-medium ${schedule[key]?.isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
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
                      <span className="text-gray-400 text-xs">a</span>
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
          </MobileSection>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Perfil del Negocio
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configura la informacion de {selectedBusiness?.name}
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
              className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer overflow-hidden group"
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
              className="relative aspect-video rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer overflow-hidden group"
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
              Selecciona los metodos de pago que acepta este negocio
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
              Este color se usara en las categorias y botones del menu
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

export default BusinessProfile;
