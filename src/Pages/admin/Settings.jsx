import { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Upload,
  Palette,
  Globe,
  Mail,
  Phone,
  MapPin,
  Image,
  RefreshCw,
  Check,
  AlertCircle,
  DollarSign,
  Truck,
  Clock,
  Shield,
  Link,
  MessageCircle,
} from 'lucide-react';
import { Card, Button, Input, Toggle, Spinner } from '../../components/ui';
import { ENDPOINTS, authFetch } from '../../config/api';

// Default settings structure matching backend
const defaultSettings = {
  appName: 'JoyMap',
  logo: '',
  logoText: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#7C3AED',
  slogan: 'Tu plataforma de delivery favorita',
  contactEmail: '',
  contactPhone: '',
  contactWhatsApp: '',
  address: '',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
  },
  deliveryFee: 0,
  minOrderAmount: 0,
  maxDeliveryRadius: 10,
  currency: 'MXN',
  currencySymbol: '$',
  timezone: 'America/Mexico_City',
  isMaintenanceMode: false,
  maintenanceMessage: '',
  termsUrl: '',
  privacyUrl: '',
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingLogo, setUploadingLogo] = useState(null);

  const logoInputRef = useRef(null);
  const logoTextInputRef = useRef(null);

  // Load settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authFetch(ENDPOINTS.settings.full);
        const data = await response.json();

        console.log('=== DEBUG Settings: Loaded ===');
        console.log('Response:', data);

        if (data.success && data.settings) {
          // Merge with defaults to ensure all fields exist
          setSettings({
            ...defaultSettings,
            ...data.settings,
            socialMedia: {
              ...defaultSettings.socialMedia,
              ...(data.settings.socialMedia || {}),
            },
          });
        } else if (data.settings) {
          setSettings({
            ...defaultSettings,
            ...data.settings,
            socialMedia: {
              ...defaultSettings.socialMedia,
              ...(data.settings.socialMedia || {}),
            },
          });
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Error al cargar la configuracion');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Save settings to API
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      console.log('=== DEBUG Settings: Saving ===');
      console.log('Settings:', settings);

      const response = await authFetch(ENDPOINTS.settings.base, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (data.success || response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Error al guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (file, type) => {
    if (!file) return;

    setUploadingLogo(type);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type); // 'logo' or 'logoText'

      console.log('=== DEBUG Settings: Uploading logo ===');
      console.log('Type:', type);

      const response = await authFetch(ENDPOINTS.settings.uploadLogo, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success && data.url) {
        setSettings(prev => ({
          ...prev,
          [type]: data.url,
        }));
      } else {
        throw new Error(data.message || 'Error al subir imagen');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingLogo(null);
    }
  };

  // Handle file input change
  const handleFileChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      handleLogoUpload(file, type);
    }
  };

  // Update nested socialMedia fields
  const updateSocialMedia = (field, value) => {
    setSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value,
      },
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'branding', label: 'Marca', icon: Palette },
    { id: 'contact', label: 'Contacto', icon: Mail },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'advanced', label: 'Avanzado', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <span className="text-slate-500 dark:text-slate-400">
            Cargando configuracion...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuracion de Plataforma
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Personaliza la configuracion general de {settings.appName || 'la plataforma'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            leftIcon={saved ? <Check size={18} /> : <Save size={18} />}
            onClick={handleSave}
            loading={saving}
            variant={saved ? 'success' : 'primary'}
          >
            {saved ? 'Guardado!' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-4 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }
                `}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <Card>
              <Card.Header>
                <Card.Title>Informacion General</Card.Title>
                <Card.Description>Configura el nombre y descripcion de tu plataforma</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <Input
                    label="Nombre de la plataforma"
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                    placeholder="JoyMap"
                  />
                  <Input
                    label="Slogan / Tagline"
                    value={settings.slogan}
                    onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                    placeholder="Tu plataforma de delivery favorita"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Moneda"
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      placeholder="MXN"
                    />
                    <Input
                      label="Simbolo de moneda"
                      value={settings.currencySymbol}
                      onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                      placeholder="$"
                    />
                  </div>
                  <Input
                    label="Zona horaria"
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    placeholder="America/Mexico_City"
                    leftIcon={<Clock size={18} />}
                  />
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <>
              <Card>
                <Card.Header>
                  <Card.Title>Logos</Card.Title>
                  <Card.Description>Sube el logo y logo tipografico de tu plataforma</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo principal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo Principal
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                        {uploadingLogo === 'logo' ? (
                          <div className="py-4">
                            <Spinner size="md" className="mx-auto" />
                            <p className="text-sm text-gray-500 mt-2">Subiendo...</p>
                          </div>
                        ) : settings.logo ? (
                          <div className="space-y-3">
                            <img
                              src={settings.logo}
                              alt="Logo"
                              className="h-20 mx-auto object-contain"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => logoInputRef.current?.click()}
                              >
                                Cambiar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSettings({ ...settings, logo: '' })}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block" onClick={() => logoInputRef.current?.click()}>
                            <Image size={40} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Haz clic para subir
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG hasta 2MB</p>
                          </label>
                        )}
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange('logo')}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Logo tipografico */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo Tipografico
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                        {uploadingLogo === 'logoText' ? (
                          <div className="py-4">
                            <Spinner size="md" className="mx-auto" />
                            <p className="text-sm text-gray-500 mt-2">Subiendo...</p>
                          </div>
                        ) : settings.logoText ? (
                          <div className="space-y-3">
                            <img
                              src={settings.logoText}
                              alt="Logo Tipografico"
                              className="h-20 mx-auto object-contain"
                            />
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => logoTextInputRef.current?.click()}
                              >
                                Cambiar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSettings({ ...settings, logoText: '' })}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer block" onClick={() => logoTextInputRef.current?.click()}>
                            <Image size={40} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Haz clic para subir
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG hasta 2MB</p>
                          </label>
                        )}
                        <input
                          ref={logoTextInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange('logoText')}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Colores</Card.Title>
                  <Card.Description>Define los colores principales de tu marca</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color Primario
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="flex-1"
                          placeholder="#4F46E5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color Secundario
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
                        />
                        <Input
                          value={settings.secondaryColor}
                          onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                          className="flex-1"
                          placeholder="#7C3AED"
                        />
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <>
              <Card>
                <Card.Header>
                  <Card.Title>Informacion de Contacto</Card.Title>
                  <Card.Description>Datos de contacto de tu plataforma</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <Input
                      label="Email de contacto"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="contacto@joymap.com"
                      leftIcon={<Mail size={18} />}
                    />
                    <Input
                      label="Telefono"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="+52 999 123 4567"
                      leftIcon={<Phone size={18} />}
                    />
                    <Input
                      label="WhatsApp"
                      value={settings.contactWhatsApp}
                      onChange={(e) => setSettings({ ...settings, contactWhatsApp: e.target.value })}
                      placeholder="+52 999 123 4567"
                      leftIcon={<MessageCircle size={18} />}
                    />
                    <Input
                      label="Direccion"
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="Merida, Yucatan, Mexico"
                      leftIcon={<MapPin size={18} />}
                    />
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Redes Sociales</Card.Title>
                  <Card.Description>Enlaces a tus redes sociales</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <Input
                      label="Facebook"
                      value={settings.socialMedia?.facebook || ''}
                      onChange={(e) => updateSocialMedia('facebook', e.target.value)}
                      placeholder="https://facebook.com/joymap"
                    />
                    <Input
                      label="Instagram"
                      value={settings.socialMedia?.instagram || ''}
                      onChange={(e) => updateSocialMedia('instagram', e.target.value)}
                      placeholder="https://instagram.com/joymap"
                    />
                    <Input
                      label="Twitter / X"
                      value={settings.socialMedia?.twitter || ''}
                      onChange={(e) => updateSocialMedia('twitter', e.target.value)}
                      placeholder="https://twitter.com/joymap"
                    />
                    <Input
                      label="TikTok"
                      value={settings.socialMedia?.tiktok || ''}
                      onChange={(e) => updateSocialMedia('tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@joymap"
                    />
                  </div>
                </Card.Content>
              </Card>
            </>
          )}

          {/* Delivery Tab */}
          {activeTab === 'delivery' && (
            <Card>
              <Card.Header>
                <Card.Title>Configuracion de Delivery</Card.Title>
                <Card.Description>Ajusta los parametros de envio predeterminados</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  <Input
                    label="Costo de envio predeterminado"
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    leftIcon={<DollarSign size={18} />}
                    helperText="Costo base de envio en tu moneda"
                  />
                  <Input
                    label="Monto minimo de orden"
                    type="number"
                    value={settings.minOrderAmount}
                    onChange={(e) => setSettings({ ...settings, minOrderAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    leftIcon={<DollarSign size={18} />}
                    helperText="Monto minimo requerido para realizar un pedido"
                  />
                  <Input
                    label="Radio maximo de entrega (km)"
                    type="number"
                    value={settings.maxDeliveryRadius}
                    onChange={(e) => setSettings({ ...settings, maxDeliveryRadius: parseFloat(e.target.value) || 0 })}
                    placeholder="10"
                    leftIcon={<Truck size={18} />}
                    helperText="Radio maximo para entregas en kilometros"
                  />
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <>
              <Card>
                <Card.Header>
                  <Card.Title>Modo Mantenimiento</Card.Title>
                  <Card.Description>Activa el modo mantenimiento cuando necesites realizar cambios</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Modo Mantenimiento
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          La plataforma mostrara un mensaje de mantenimiento a los usuarios
                        </p>
                      </div>
                      <Toggle
                        checked={settings.isMaintenanceMode}
                        onChange={(checked) => setSettings({ ...settings, isMaintenanceMode: checked })}
                      />
                    </div>
                    {settings.isMaintenanceMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Mensaje de mantenimiento
                        </label>
                        <textarea
                          value={settings.maintenanceMessage}
                          onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                          placeholder="Estamos realizando mejoras. Volvemos pronto!"
                          rows={3}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Enlaces Legales</Card.Title>
                  <Card.Description>URLs a tus documentos legales</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <Input
                      label="URL de Terminos y Condiciones"
                      value={settings.termsUrl}
                      onChange={(e) => setSettings({ ...settings, termsUrl: e.target.value })}
                      placeholder="https://joymap.com/terminos"
                      leftIcon={<Link size={18} />}
                    />
                    <Input
                      label="URL de Politica de Privacidad"
                      value={settings.privacyUrl}
                      onChange={(e) => setSettings({ ...settings, privacyUrl: e.target.value })}
                      placeholder="https://joymap.com/privacidad"
                      leftIcon={<Link size={18} />}
                    />
                  </div>
                </Card.Content>
              </Card>
            </>
          )}
        </div>

        {/* Preview Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <Card.Header>
              <Card.Title>Vista Previa</Card.Title>
              <Card.Description>Asi se vera tu marca</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                {/* Logo preview */}
                <div className="text-center p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                  {settings.logo ? (
                    <img
                      src={settings.logo}
                      alt="Logo Preview"
                      className="h-16 mx-auto object-contain"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      {(settings.appName || 'J').charAt(0)}
                    </div>
                  )}
                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    {settings.appName || 'JoyMap'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.slogan || 'Tu plataforma de delivery'}
                  </p>
                </div>

                {/* Colors preview */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Colores
                  </p>
                  <div className="flex gap-2">
                    <div
                      className="flex-1 h-12 rounded-lg"
                      style={{ backgroundColor: settings.primaryColor }}
                    />
                    <div
                      className="flex-1 h-12 rounded-lg"
                      style={{ backgroundColor: settings.secondaryColor }}
                    />
                  </div>
                </div>

                {/* Button preview */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Boton de ejemplo
                  </p>
                  <button
                    className="w-full py-2.5 px-4 rounded-xl text-white font-medium transition-all hover:opacity-90"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Pedir ahora
                  </button>
                </div>

                {/* Contact preview */}
                {(settings.contactEmail || settings.contactPhone) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contacto
                    </p>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {settings.contactEmail && <p>{settings.contactEmail}</p>}
                      {settings.contactPhone && <p>{settings.contactPhone}</p>}
                    </div>
                  </div>
                )}

                {/* Delivery info preview */}
                {(settings.deliveryFee > 0 || settings.minOrderAmount > 0) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery
                    </p>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {settings.deliveryFee > 0 && (
                        <p>Envio: {settings.currencySymbol}{settings.deliveryFee}</p>
                      )}
                      {settings.minOrderAmount > 0 && (
                        <p>Min: {settings.currencySymbol}{settings.minOrderAmount}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Maintenance mode indicator */}
                {settings.isMaintenanceMode && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Modo Mantenimiento Activo
                    </p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
