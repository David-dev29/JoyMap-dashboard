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
} from 'lucide-react';
import { Card, Button, Input, Toggle } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import { updateBusiness, getBusinessById } from '../../../services/api';
import NoBusinessSelected from '../../../Components/Dashboard/NoBusinessSelected';

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
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading, setSelectedBusiness } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-6">
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
          <Card>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={18} />
              Horarios de Operacion
            </h3>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map(({ key, label }) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    schedule[key]?.isOpen
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-gray-50 dark:bg-slate-700/50'
                  }`}
                >
                  <Toggle
                    checked={schedule[key]?.isOpen}
                    onChange={(checked) => handleScheduleChange(key, 'isOpen', checked)}
                    size="sm"
                  />
                  <span className={`w-20 text-sm font-medium ${
                    schedule[key]?.isOpen
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {schedule[key]?.isOpen && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={schedule[key]?.open || '09:00'}
                        onChange={(e) => handleScheduleChange(key, 'open', e.target.value)}
                        className="px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="time"
                        value={schedule[key]?.close || '21:00'}
                        onChange={(e) => handleScheduleChange(key, 'close', e.target.value)}
                        className="px-2 py-1 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg"
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
