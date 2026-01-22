import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Card, Button, Input } from '../../components/ui';

const STORAGE_KEY = 'joymap_platform_settings';

const defaultSettings = {
  platformName: 'JoyMap',
  tagline: 'Tu plataforma de delivery favorita',
  logo: '',
  logoTypographic: '',
  primaryColor: '#4F46E5',
  secondaryColor: '#7C3AED',
  contactEmail: 'contacto@joymap.com',
  contactPhone: '+52 999 123 4567',
  address: 'Merida, Yucatan, Mexico',
  website: 'https://joymap.com',
  facebook: '',
  instagram: '',
  twitter: '',
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    setSaving(false);
    setSaved(true);

    // Reset saved indicator after 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  // Reset to defaults
  const handleReset = () => {
    if (window.confirm('Estas seguro de restaurar la configuracion por defecto?')) {
      setSettings(defaultSettings);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Handle file upload (mock - just stores base64)
  const handleFileUpload = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'branding', label: 'Marca', icon: Palette },
    { id: 'contact', label: 'Contacto', icon: Mail },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configuracion de Plataforma
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Personaliza la configuracion general de JoyMap
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" leftIcon={<RefreshCw size={18} />} onClick={handleReset}>
            Restaurar
          </Button>
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
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
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    placeholder="JoyMap"
                  />
                  <Input
                    label="Slogan / Tagline"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="Tu plataforma de delivery favorita"
                  />
                  <Input
                    label="Sitio web"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    placeholder="https://joymap.com"
                    leftIcon={<Globe size={18} />}
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
                        {settings.logo ? (
                          <div className="space-y-3">
                            <img
                              src={settings.logo}
                              alt="Logo"
                              className="h-20 mx-auto object-contain"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSettings({ ...settings, logo: '' })}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Image size={40} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Arrastra o haz clic para subir
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG hasta 2MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload('logo')}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Logo tipografico */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Logo Tipografico
                      </label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                        {settings.logoTypographic ? (
                          <div className="space-y-3">
                            <img
                              src={settings.logoTypographic}
                              alt="Logo Tipografico"
                              className="h-20 mx-auto object-contain"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSettings({ ...settings, logoTypographic: '' })}
                            >
                              Eliminar
                            </Button>
                          </div>
                        ) : (
                          <label className="cursor-pointer block">
                            <Image size={40} className="mx-auto mb-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              Arrastra o haz clic para subir
                            </p>
                            <p className="text-xs text-gray-400">PNG, JPG hasta 2MB</p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload('logoTypographic')}
                              className="hidden"
                            />
                          </label>
                        )}
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
                      value={settings.facebook}
                      onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                      placeholder="https://facebook.com/joymap"
                    />
                    <Input
                      label="Instagram"
                      value={settings.instagram}
                      onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                      placeholder="https://instagram.com/joymap"
                    />
                    <Input
                      label="Twitter / X"
                      value={settings.twitter}
                      onChange={(e) => setSettings({ ...settings, twitter: e.target.value })}
                      placeholder="https://twitter.com/joymap"
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
                      {settings.platformName.charAt(0)}
                    </div>
                  )}
                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    {settings.platformName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {settings.tagline}
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
                {settings.contactEmail && (
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
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
