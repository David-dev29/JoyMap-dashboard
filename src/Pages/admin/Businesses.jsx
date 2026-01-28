import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit2,
  UserPlus,
  Power,
  Trash2,
  Store,
  Truck,
  UtensilsCrossed,
  Check,
  X,
  AlertCircle,
  MapPin,
  Navigation,
  Smile,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import { authFetch, ENDPOINTS } from '../../config/api';

const categoryIcons = {
  food: UtensilsCrossed,
  comida: UtensilsCrossed,
  store: Store,
  tienda: Store,
  delivery: Truck,
  envio: Truck,
};

const categoryLabels = {
  food: 'Comida',
  comida: 'Comida',
  store: 'Tienda',
  tienda: 'Tienda',
  delivery: 'Envio',
  envio: 'Envio',
};

const categoryColors = {
  food: 'warning',
  comida: 'warning',
  store: 'primary',
  tienda: 'primary',
  delivery: 'info',
  envio: 'info',
};

const Businesses = () => {
  // State
  const [businesses, setBusinesses] = useState([]);
  const [businessCategories, setBusinessCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignOwnerModalOpen, setIsAssignOwnerModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [availableOwners, setAvailableOwners] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    latitude: '',
    longitude: '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Icon state (emoji or SVG)
  const [iconType, setIconType] = useState('emoji'); // 'emoji' or 'svg'
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [svgCode, setSvgCode] = useState('');
  const [svgError, setSvgError] = useState('');

  // Common emojis for businesses
  const COMMON_EMOJIS = [
    '🍔', '🍕', '🌮', '🍜', '🍣', '🍰', '☕', '🍺',
    '🛒', '🏪', '🏬', '💊', '🏥', '💇', '🔧', '🚗',
    '📚', '🎮', '👕', '👟', '💻', '📱', '🏋️', '🎬',
    '🌸', '🐕', '🎂', '🍦', '🥗', '🍱', '🥐', '🧁',
  ];

  // Max SVG code size (50KB)
  const MAX_SVG_SIZE = 50 * 1024;

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch businesses and categories
  useEffect(() => {
    fetchBusinesses();
    fetchBusinessCategories();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.businesses.all);
      console.log('=== DEBUG Businesses ===');
      console.log('Endpoint:', ENDPOINTS.businesses.all);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const data = await response.json();
      console.log('API Response (raw):', data);
      console.log('Type of data:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      console.log('data.businesses:', data.businesses);
      console.log('data.response:', data.response);
      console.log('data.data:', data.data);
      console.log('data.success:', data.success);
      if (data && typeof data === 'object') {
        console.log('Object.keys(data):', Object.keys(data));
      }

      if (data.success !== false) {
        const businessList = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
        console.log('Final businessList:', businessList);
        console.log('businessList length:', businessList.length);
        setBusinesses(Array.isArray(businessList) ? businessList : []);
      } else {
        throw new Error(data.message || 'Error al cargar negocios');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      showToast('Error al cargar los negocios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessCategories = async () => {
    try {
      const response = await authFetch(ENDPOINTS.businessCategories.base);
      console.log('=== DEBUG Business Categories ===');
      console.log('Endpoint:', ENDPOINTS.businessCategories.base);

      const data = await response.json();
      console.log('Categories API Response:', data);

      const categories = data.categories || data.response || data.data || (Array.isArray(data) ? data : []);
      console.log('Final categories:', categories);
      setBusinessCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Error fetching business categories:', error);
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      const response = await authFetch(`${ENDPOINTS.users.base}?role=business_owner`);
      console.log('=== DEBUG Available Owners ===');

      const data = await response.json();
      console.log('Owners API Response:', data);

      const users = data.users || data.response || data.data || (Array.isArray(data) ? data : []);
      console.log('Users extracted:', users);
      // Filter users that don't have a business assigned
      const available = users.filter(u => !u.businessId && !u.business);
      console.log('Available owners:', available);
      setAvailableOwners(Array.isArray(available) ? available : []);
    } catch (error) {
      console.error('Error fetching available owners:', error);
      setAvailableOwners([]);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = business.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const businessCategory = business.category?.slug || business.category?.name || business.type || '';
    const matchesCategory = !categoryFilter || businessCategory.toLowerCase() === categoryFilter.toLowerCase();
    const businessStatus = business.isOpen !== undefined ? (business.isOpen ? 'active' : 'inactive') : business.status;
    const matchesStatus = !statusFilter || businessStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get business category for display
  const getBusinessCategory = (business) => {
    return business.category?.slug || business.category?.name || business.type || 'store';
  };

  // Get business status
  const getBusinessStatus = (business) => {
    if (business.isOpen !== undefined) {
      return business.isOpen ? 'active' : 'inactive';
    }
    return business.status || 'active';
  };

  // Validate and handle SVG code input
  const handleSvgCodeChange = (code) => {
    setSvgCode(code);
    setSvgError('');

    if (!code.trim()) {
      return;
    }

    // Validate size
    if (code.length > MAX_SVG_SIZE) {
      setSvgError(`El codigo SVG no puede superar los ${MAX_SVG_SIZE / 1024}KB`);
      return;
    }

    // Validate SVG format
    const trimmedCode = code.trim();
    if (!trimmedCode.toLowerCase().startsWith('<svg') || !trimmedCode.toLowerCase().endsWith('</svg>')) {
      setSvgError('El codigo debe comenzar con <svg y terminar con </svg>');
      return;
    }
  };

  // Check if SVG code is valid for preview
  const isValidSvg = (code) => {
    if (!code || !code.trim()) return false;
    const trimmed = code.trim().toLowerCase();
    return trimmed.startsWith('<svg') && trimmed.endsWith('</svg>') && code.length <= MAX_SVG_SIZE;
  };

  // Reset icon state
  const resetIconState = () => {
    setIconType('emoji');
    setSelectedEmoji('');
    setSvgCode('');
    setSvgError('');
  };

  // Get current location using Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalizacion no soportada en este navegador', 'error');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGettingLocation(false);
        showToast('Ubicacion obtenida correctamente');
      },
      (error) => {
        setGettingLocation(false);
        let message = 'Error al obtener ubicacion';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Permiso de ubicacion denegado';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Ubicacion no disponible';
        }
        showToast(message, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handlers
  const handleCreateBusiness = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.category) errors.category = 'La categoria es requerida';
    if (!formData.address.trim()) errors.address = 'La direccion es requerida';
    if (!formData.latitude || !formData.longitude) errors.coordinates = 'Las coordenadas son requeridas';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // Parse coordinates
      const lng = parseFloat(formData.longitude);
      const lat = parseFloat(formData.latitude);

      // Build request body with location in GeoJSON format
      const requestBody = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        coordinates: [lng || 0, lat || 0],
        location: {
          type: 'Point',
          coordinates: [lng || 0, lat || 0]
        },
        phone: formData.phone,
        email: formData.email,
        isOpen: true,
      };

      // Add icon data based on type
      if (iconType === 'svg' && isValidSvg(svgCode)) {
        requestBody.iconType = 'svg';
        requestBody.iconSvg = svgCode.trim();
      } else if (iconType === 'emoji' && selectedEmoji) {
        requestBody.iconType = 'emoji';
        requestBody.emoji = selectedEmoji;
      }

      console.log('=== DEBUG Create Business ===');
      console.log('Endpoint:', ENDPOINTS.businesses.create);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await authFetch(ENDPOINTS.businesses.create, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (response.ok && data.success !== false) {
        showToast('Negocio creado exitosamente');
        await fetchBusinesses();
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        throw new Error(data.message || data.error || 'Error al crear negocio');
      }
    } catch (error) {
      console.error('Error creating business:', error);
      showToast(error.message || 'Error al crear el negocio', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBusiness = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.address.trim()) errors.address = 'La direccion es requerida';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      // Parse coordinates
      const lng = parseFloat(formData.longitude);
      const lat = parseFloat(formData.latitude);
      const hasValidCoords = !isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0);

      // Build request body
      const requestBody = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      // Add coordinates in both formats for compatibility
      if (hasValidCoords) {
        requestBody.coordinates = [lng, lat];
        requestBody.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }

      // Add icon data based on type
      if (iconType === 'svg' && isValidSvg(svgCode)) {
        requestBody.iconType = 'svg';
        requestBody.iconSvg = svgCode.trim();
      } else if (iconType === 'emoji' && selectedEmoji) {
        requestBody.iconType = 'emoji';
        requestBody.emoji = selectedEmoji;
      } else {
        // Clear icon if nothing selected
        requestBody.iconType = null;
        requestBody.emoji = null;
        requestBody.iconSvg = null;
      }

      console.log('=== DEBUG Edit Business ===');
      console.log('formData.latitude:', formData.latitude);
      console.log('formData.longitude:', formData.longitude);
      console.log('hasValidCoords:', hasValidCoords);
      console.log('Full request body:', JSON.stringify(requestBody, null, 2));

      const response = await authFetch(ENDPOINTS.businesses.byId(selectedBusiness._id), {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Negocio actualizado exitosamente');
        await fetchBusinesses();
        setIsEditModalOpen(false);
        setSelectedBusiness(null);
        resetForm();
      } else {
        throw new Error(data.message || 'Error al actualizar negocio');
      }
    } catch (error) {
      console.error('Error updating business:', error);
      showToast(error.message || 'Error al actualizar el negocio', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.businesses.byId(selectedBusiness._id), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Negocio eliminado exitosamente');
        await fetchBusinesses();
        setIsDeleteModalOpen(false);
        setSelectedBusiness(null);
      } else {
        throw new Error(data.message || 'Error al eliminar negocio');
      }
    } catch (error) {
      console.error('Error deleting business:', error);
      showToast(error.message || 'Error al eliminar el negocio', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignOwner = async (ownerId) => {
    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.admin.assignBusiness, {
        method: 'POST',
        body: JSON.stringify({
          businessId: selectedBusiness._id,
          userId: ownerId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Owner asignado exitosamente');
        await fetchBusinesses();
        setIsAssignOwnerModalOpen(false);
        setSelectedBusiness(null);
      } else {
        throw new Error(data.message || 'Error al asignar owner');
      }
    } catch (error) {
      console.error('Error assigning owner:', error);
      showToast(error.message || 'Error al asignar owner', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (business) => {
    const newStatus = getBusinessStatus(business) === 'active' ? false : true;
    try {
      const response = await authFetch(ENDPOINTS.businesses.byId(business._id), {
        method: 'PUT',
        body: JSON.stringify({ isOpen: newStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast(`Negocio ${newStatus ? 'activado' : 'desactivado'}`);
        await fetchBusinesses();
      } else {
        throw new Error(data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      latitude: '',
      longitude: '',
    });
    setFormErrors({});
    resetIconState();
  };

  const openEditModal = (business) => {
    setSelectedBusiness(business);

    // Handle different coordinate formats:
    // 1. coordinates: [lng, lat] - direct array
    // 2. location: { type: 'Point', coordinates: [lng, lat] } - GeoJSON
    let coords = [];
    if (business.coordinates && Array.isArray(business.coordinates)) {
      coords = business.coordinates;
    } else if (business.location?.coordinates && Array.isArray(business.location.coordinates)) {
      coords = business.location.coordinates;
    }

    console.log('=== DEBUG openEditModal ===');
    console.log('Business:', business.name);
    console.log('business.coordinates:', business.coordinates);
    console.log('business.location:', business.location);
    console.log('Extracted coords:', coords);

    setFormData({
      name: business.name || '',
      category: business.category?._id || business.categoryId || '',
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      latitude: coords[1]?.toString() || '',   // lat is second element
      longitude: coords[0]?.toString() || '',  // lng is first element
    });

    // Load icon state
    if (business.iconType === 'svg' && business.iconSvg) {
      setIconType('svg');
      setSvgCode(business.iconSvg);
      setSvgError('');
      setSelectedEmoji('');
    } else if (business.emoji) {
      setIconType('emoji');
      setSelectedEmoji(business.emoji);
      setSvgCode('');
      setSvgError('');
    } else {
      resetIconState();
    }

    setIsEditModalOpen(true);
  };

  const openAssignOwnerModal = (business) => {
    setSelectedBusiness(business);
    fetchAvailableOwners();
    setIsAssignOwnerModalOpen(true);
  };

  const openViewModal = (business) => {
    setSelectedBusiness(business);
    setIsViewModalOpen(true);
  };

  const openDeleteModal = (business) => {
    setSelectedBusiness(business);
    setIsDeleteModalOpen(true);
  };

  const CategoryIcon = ({ category }) => {
    const Icon = categoryIcons[category] || Store;
    return <Icon size={16} />;
  };

  // Build category options for filter
  const categoryOptions = [
    { value: '', label: 'Todas las categorias' },
    ...businessCategories.map(cat => ({
      value: cat.slug || cat.name,
      label: cat.name,
    })),
  ];

  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
            : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion de Negocios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra todos los negocios de la plataforma
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          Nuevo Negocio
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-44"
            />
            <Select
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder=""
              fullWidth={false}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row hover={false}>
                <Table.Header>Negocio</Table.Header>
                <Table.Header>Categoria</Table.Header>
                <Table.Header>Owner Asignado</Table.Header>
                <Table.Header>Estado</Table.Header>
                <Table.Header align="right">Acciones</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Loading colSpan={5} />
              ) : filteredBusinesses.length === 0 ? (
                <Table.Empty
                  colSpan={5}
                  message={searchQuery || categoryFilter || statusFilter
                    ? 'No se encontraron negocios con los filtros aplicados'
                    : 'No hay negocios registrados'
                  }
                />
              ) : (
                filteredBusinesses.map((business) => {
                  const category = getBusinessCategory(business);
                  const status = getBusinessStatus(business);

                  return (
                    <Table.Row key={business._id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={business.name}
                            src={business.logo}
                            size="md"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {business.name}
                            </p>
                            {business.email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {business.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={categoryColors[category] || 'secondary'} size="sm">
                          <span className="flex items-center gap-1.5">
                            <CategoryIcon category={category} />
                            {categoryLabels[category] || business.category?.name || category}
                          </span>
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {business.owner ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={business.owner.name} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {business.owner.name}
                              </p>
                              <p className="text-xs text-gray-500">{business.owner.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Sin asignar</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          variant={status === 'active' ? 'success' : 'default'}
                          dot
                          size="sm"
                        >
                          {status === 'active' ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell align="right">
                        <Dropdown
                          align="right"
                          trigger={
                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                              <MoreHorizontal size={18} className="text-gray-500" />
                            </button>
                          }
                        >
                          {(close) => (
                            <>
                              <Dropdown.Item
                                icon={<Eye size={16} />}
                                onClick={() => {
                                  close();
                                  openViewModal(business);
                                }}
                              >
                                Ver detalles
                              </Dropdown.Item>
                              <Dropdown.Item
                                icon={<Edit2 size={16} />}
                                onClick={() => {
                                  close();
                                  openEditModal(business);
                                }}
                              >
                                Editar
                              </Dropdown.Item>
                              <Dropdown.Item
                                icon={<UserPlus size={16} />}
                                onClick={() => {
                                  close();
                                  openAssignOwnerModal(business);
                                }}
                              >
                                Asignar Owner
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                icon={<Power size={16} />}
                                onClick={() => {
                                  close();
                                  handleToggleStatus(business);
                                }}
                              >
                                {status === 'active' ? 'Desactivar' : 'Activar'}
                              </Dropdown.Item>
                              <Dropdown.Item
                                icon={<Trash2 size={16} />}
                                danger
                                onClick={() => {
                                  close();
                                  openDeleteModal(business);
                                }}
                              >
                                Eliminar
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  );
                })
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {filteredBusinesses.length} de {businesses.length} negocios
        </p>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Negocio"
        description="Agrega un nuevo negocio a la plataforma"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del negocio"
              placeholder="Ej: Restaurante El Buen Sabor"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Select
              label="Categoria"
              options={businessCategories.map(cat => ({
                value: cat._id,
                label: cat.name,
              }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              error={formErrors.category}
              placeholder="Seleccionar categoria"
            />
          </div>
          <Input
            label="Descripcion"
            placeholder="Descripcion breve del negocio..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Direccion"
            placeholder="Direccion del negocio"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={formErrors.address}
            leftIcon={<MapPin size={18} />}
          />
          {/* Coordinates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Coordenadas
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Navigation size={16} />}
                onClick={getCurrentLocation}
                loading={gettingLocation}
              >
                Obtener mi ubicacion
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Latitud (ej: 20.9674)"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitud (ej: -89.6235)"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                type="number"
                step="any"
              />
            </div>
            {formErrors.coordinates && (
              <p className="text-sm text-red-500">{formErrors.coordinates}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefono"
              placeholder="+52 999 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="contacto@negocio.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icono del negocio (para el mapa)
            </label>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => setIconType('emoji')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  iconType === 'emoji'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smile size={16} />
                Emoji
              </button>
              <button
                type="button"
                onClick={() => setIconType('svg')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  iconType === 'svg'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon size={16} />
                SVG Personalizado
              </button>
            </div>

            {/* Emoji Selector */}
            {iconType === 'emoji' && (
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg max-h-32 overflow-y-auto">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-slate-600 ${
                        selectedEmoji === emoji
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                          : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {selectedEmoji && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Seleccionado:</span>
                    <span className="text-2xl">{selectedEmoji}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEmoji('')}
                      className="text-red-500 hover:text-red-600 text-xs underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SVG Code Input */}
            {iconType === 'svg' && (
              <div className="space-y-3">
                <textarea
                  value={svgCode}
                  onChange={(e) => handleSvgCodeChange(e.target.value)}
                  placeholder="Pega aqui el codigo SVG...&#10;&#10;Ejemplo:&#10;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
                  className={`w-full h-32 px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-slate-700 border rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    svgError
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-600'
                  } text-gray-900 dark:text-white placeholder-gray-400`}
                />
                {svgError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {svgError}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Puedes copiar SVGs de sitios como Heroicons, Lucide, FontAwesome, etc.
                </p>

                {/* Preview */}
                {isValidSvg(svgCode) && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa:</p>
                    <div className="flex items-center justify-center">
                      <div
                        className="w-16 h-16 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                        dangerouslySetInnerHTML={{ __html: svgCode }}
                      />
                    </div>
                  </div>
                )}

                {svgCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSvgCode('');
                      setSvgError('');
                    }}
                    className="text-sm text-red-500 hover:text-red-600 underline"
                  >
                    Limpiar codigo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateBusiness} loading={submitting}>
            Crear Negocio
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedBusiness(null);
          resetForm();
        }}
        title="Editar Negocio"
        description={`Editando: ${selectedBusiness?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre del negocio"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={formErrors.name}
            />
            <Select
              label="Categoria"
              options={businessCategories.map(cat => ({
                value: cat._id,
                label: cat.name,
              }))}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>
          <Input
            label="Descripcion"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Direccion"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={formErrors.address}
            leftIcon={<MapPin size={18} />}
          />
          {/* Coordinates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Coordenadas
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<Navigation size={16} />}
                onClick={getCurrentLocation}
                loading={gettingLocation}
              >
                Obtener mi ubicacion
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Latitud"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitud"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                type="number"
                step="any"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Telefono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icono del negocio (para el mapa)
            </label>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => setIconType('emoji')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  iconType === 'emoji'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Smile size={16} />
                Emoji
              </button>
              <button
                type="button"
                onClick={() => setIconType('svg')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  iconType === 'svg'
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon size={16} />
                SVG Personalizado
              </button>
            </div>

            {/* Emoji Selector */}
            {iconType === 'emoji' && (
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg max-h-32 overflow-y-auto">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all hover:bg-gray-200 dark:hover:bg-slate-600 ${
                        selectedEmoji === emoji
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                          : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {selectedEmoji && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Seleccionado:</span>
                    <span className="text-2xl">{selectedEmoji}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedEmoji('')}
                      className="text-red-500 hover:text-red-600 text-xs underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SVG Code Input */}
            {iconType === 'svg' && (
              <div className="space-y-3">
                <textarea
                  value={svgCode}
                  onChange={(e) => handleSvgCodeChange(e.target.value)}
                  placeholder="Pega aqui el codigo SVG...&#10;&#10;Ejemplo:&#10;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>...</svg>"
                  className={`w-full h-32 px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-slate-700 border rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    svgError
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-200 dark:border-slate-600'
                  } text-gray-900 dark:text-white placeholder-gray-400`}
                />
                {svgError && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {svgError}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Puedes copiar SVGs de sitios como Heroicons, Lucide, FontAwesome, etc.
                </p>

                {/* Preview */}
                {isValidSvg(svgCode) && (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa:</p>
                    <div className="flex items-center justify-center">
                      <div
                        className="w-16 h-16 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
                        dangerouslySetInnerHTML={{ __html: svgCode }}
                      />
                    </div>
                  </div>
                )}

                {svgCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setSvgCode('');
                      setSvgError('');
                    }}
                    className="text-sm text-red-500 hover:text-red-600 underline"
                  >
                    Limpiar codigo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsEditModalOpen(false);
            setSelectedBusiness(null);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleEditBusiness} loading={submitting}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBusiness(null);
        }}
        title="Eliminar Negocio"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300">
          ¿Estas seguro de eliminar <strong>{selectedBusiness?.name}</strong>? Esta accion no se puede deshacer.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedBusiness(null);
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteBusiness} loading={submitting}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Assign Owner Modal */}
      <Modal
        isOpen={isAssignOwnerModalOpen}
        onClose={() => {
          setIsAssignOwnerModalOpen(false);
          setSelectedBusiness(null);
        }}
        title="Asignar Owner"
        description={`Selecciona un owner para: ${selectedBusiness?.name}`}
      >
        <div className="space-y-2">
          {availableOwners.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus size={40} className="mx-auto mb-3 opacity-50" />
              <p>No hay owners disponibles</p>
              <p className="text-sm">Crea un usuario con rol "business_owner" primero</p>
            </div>
          ) : (
            availableOwners.map((owner) => (
              <button
                key={owner._id}
                onClick={() => handleAssignOwner(owner._id)}
                disabled={submitting}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
              >
                <Avatar name={owner.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{owner.name}</p>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedBusiness(null);
        }}
        title="Detalles del Negocio"
        size="lg"
      >
        {selectedBusiness && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar name={selectedBusiness.name} size="xl" src={selectedBusiness.logo} />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBusiness.name}
                </h3>
                <Badge variant={categoryColors[getBusinessCategory(selectedBusiness)] || 'secondary'} className="mt-1">
                  <span className="flex items-center gap-1.5">
                    <CategoryIcon category={getBusinessCategory(selectedBusiness)} />
                    {categoryLabels[getBusinessCategory(selectedBusiness)] || selectedBusiness.category?.name}
                  </span>
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Estado</label>
                <p className="mt-1">
                  <Badge
                    variant={getBusinessStatus(selectedBusiness) === 'active' ? 'success' : 'default'}
                    dot
                  >
                    {getBusinessStatus(selectedBusiness) === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">Owner</label>
                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {selectedBusiness.owner?.name || 'Sin asignar'}
                </p>
              </div>
              {selectedBusiness.description && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Descripcion</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.description}</p>
                </div>
              )}
              {selectedBusiness.address && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Direccion</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.address}</p>
                </div>
              )}
              {selectedBusiness.coordinates && selectedBusiness.coordinates.length >= 2 && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-500 dark:text-gray-400">Coordenadas</label>
                  <p className="mt-1 text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {selectedBusiness.coordinates[1]}, {selectedBusiness.coordinates[0]}
                  </p>
                </div>
              )}
              {selectedBusiness.phone && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Telefono</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.phone}</p>
                </div>
              )}
              {selectedBusiness.email && (
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{selectedBusiness.email}</p>
                </div>
              )}
            </div>
          </div>
        )}
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsViewModalOpen(false);
            setSelectedBusiness(null);
          }}>
            Cerrar
          </Button>
          <Button onClick={() => {
            setIsViewModalOpen(false);
            openEditModal(selectedBusiness);
          }}>
            Editar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Businesses;
