import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Star,
  ChevronRight,
} from 'lucide-react';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineRefresh,
  HiOutlineDotsVertical,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUserAdd,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineStar,
  HiOutlineOfficeBuilding,
} from 'react-icons/hi';
import { Card, Button, Input, Select, Badge, Table, Modal, Avatar, Dropdown } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';

// Custom hook for detecting mobile
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

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

// Mobile Business Card
const MobileBusinessCard = ({ business, onView, onEdit, onAssignOwner, onToggleStatus, onDelete, getBusinessCategory, getBusinessStatus }) => {
  const category = getBusinessCategory(business);
  const status = getBusinessStatus(business);
  const [showActions, setShowActions] = useState(false);
  const CategoryIcon = categoryIcons[category] || Store;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
      {/* Header with Logo and Status */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar/Logo */}
          <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
            ) : business.emoji ? (
              <span className="text-2xl">{business.emoji}</span>
            ) : (
              <HiOutlineOfficeBuilding className="w-7 h-7 text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {business.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                category === 'food' || category === 'comida'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : category === 'store' || category === 'tienda'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                <CategoryIcon size={12} />
                {categoryLabels[category] || business.category?.name || 'Otro'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Actions Menu */}
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <HiOutlineDotsVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Owner Info */}
        {business.owner ? (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-medium text-indigo-600">
              {business.owner.name?.charAt(0) || 'O'}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {business.owner.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 italic">Sin owner asignado</span>
          </div>
        )}

        {/* Address */}
        {business.address && (
          <div className="flex items-start gap-1.5 mt-2">
            <HiOutlineLocationMarker className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {business.address}
            </span>
          </div>
        )}
      </div>

      {/* Actions Drawer */}
      {showActions && (
        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-2 grid grid-cols-4 gap-1">
          <button
            onClick={() => { setShowActions(false); onView(business); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineEye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Ver</span>
          </button>
          <button
            onClick={() => { setShowActions(false); onEdit(business); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlinePencil className="w-5 h-5 text-indigo-600" />
            <span className="text-xs text-indigo-600">Editar</span>
          </button>
          <button
            onClick={() => { setShowActions(false); onAssignOwner(business); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineUserAdd className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600">Owner</span>
          </button>
          <button
            onClick={() => { setShowActions(false); onDelete(business); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
            <span className="text-xs text-red-500">Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
};

const Businesses = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
  const [iconType, setIconType] = useState('emoji');
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
      const data = await response.json();

      if (data.success !== false) {
        const businessList = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
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
      const data = await response.json();
      const categories = data.categories || data.response || data.data || (Array.isArray(data) ? data : []);
      setBusinessCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Error fetching business categories:', error);
    }
  };

  const fetchAvailableOwners = async () => {
    try {
      const response = await authFetch(`${ENDPOINTS.users.base}?role=business_owner`);
      const data = await response.json();
      const users = data.users || data.response || data.data || (Array.isArray(data) ? data : []);
      const available = users.filter(u => !u.businessId && !u.business);
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

    if (!code.trim()) return;

    if (code.length > MAX_SVG_SIZE) {
      setSvgError(`El codigo SVG no puede superar los ${MAX_SVG_SIZE / 1024}KB`);
      return;
    }

    const trimmedCode = code.trim();
    if (!trimmedCode.toLowerCase().startsWith('<svg') || !trimmedCode.toLowerCase().endsWith('</svg>')) {
      setSvgError('El codigo debe comenzar con <svg y terminar con </svg>');
      return;
    }
  };

  const isValidSvg = (code) => {
    if (!code || !code.trim()) return false;
    const trimmed = code.trim().toLowerCase();
    return trimmed.startsWith('<svg') && trimmed.endsWith('</svg>') && code.length <= MAX_SVG_SIZE;
  };

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
      const lng = parseFloat(formData.longitude);
      const lat = parseFloat(formData.latitude);

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

      if (iconType === 'svg' && isValidSvg(svgCode)) {
        requestBody.iconType = 'svg';
        requestBody.iconSvg = svgCode.trim();
      } else if (iconType === 'emoji' && selectedEmoji) {
        requestBody.iconType = 'emoji';
        requestBody.emoji = selectedEmoji;
      }

      const response = await authFetch(ENDPOINTS.businesses.create, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

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
      const lng = parseFloat(formData.longitude);
      const lat = parseFloat(formData.latitude);
      const hasValidCoords = !isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0);

      const requestBody = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
      };

      if (hasValidCoords) {
        requestBody.coordinates = [lng, lat];
        requestBody.location = {
          type: 'Point',
          coordinates: [lng, lat]
        };
      }

      if (iconType === 'svg' && isValidSvg(svgCode)) {
        requestBody.iconType = 'svg';
        requestBody.iconSvg = svgCode.trim();
      } else if (iconType === 'emoji' && selectedEmoji) {
        requestBody.iconType = 'emoji';
        requestBody.emoji = selectedEmoji;
      } else {
        requestBody.iconType = null;
        requestBody.emoji = null;
        requestBody.iconSvg = null;
      }

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

    let coords = [];
    if (business.coordinates && Array.isArray(business.coordinates)) {
      coords = business.coordinates;
    } else if (business.location?.coordinates && Array.isArray(business.location.coordinates)) {
      coords = business.location.coordinates;
    }

    setFormData({
      name: business.name || '',
      category: business.category?._id || business.categoryId || '',
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || '',
      latitude: coords[1]?.toString() || '',
      longitude: coords[0]?.toString() || '',
    });

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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Cargando negocios...</span>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Search Bar */}
        <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar negocios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchBusinesses}
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="sticky top-[65px] z-20 bg-gray-50 dark:bg-gray-950">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setStatusFilter('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
              }`}
            >
              Todos ({businesses.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'active'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
              }`}
            >
              Activos ({businesses.filter(b => getBusinessStatus(b) === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === 'inactive'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
              }`}
            >
              Inactivos ({businesses.filter(b => getBusinessStatus(b) === 'inactive').length})
            </button>
          </div>
        </div>

        {/* Businesses Grid */}
        <div className="px-4 py-4">
          {filteredBusinesses.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center">
              <HiOutlineOfficeBuilding className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || statusFilter
                  ? 'No hay negocios que coincidan'
                  : 'No hay negocios registrados'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBusinesses.map((business) => (
                <MobileBusinessCard
                  key={business._id}
                  business={business}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onAssignOwner={openAssignOwnerModal}
                  onToggleStatus={handleToggleStatus}
                  onDelete={openDeleteModal}
                  getBusinessCategory={getBusinessCategory}
                  getBusinessStatus={getBusinessStatus}
                />
              ))}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredBusinesses.length} de {businesses.length} negocios
          </p>
        </div>

        {/* FAB */}
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all z-40"
        >
          <HiOutlinePlus className="w-7 h-7" />
        </button>

        {/* Create Modal */}
        <MobileModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Negocio"
          size="xl"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                placeholder="Ej: Restaurante El Buen Sabor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${formErrors.name ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white`}
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${formErrors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white`}
              >
                <option value="">Seleccionar categoria</option>
                {businessCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Direccion *
              </label>
              <input
                type="text"
                placeholder="Direccion del negocio"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border ${formErrors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white`}
              />
              {formErrors.address && <p className="text-xs text-red-500 mt-1">{formErrors.address}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coordenadas *
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="text-sm text-indigo-600 font-medium flex items-center gap-1"
                >
                  <Navigation size={14} />
                  {gettingLocation ? 'Obteniendo...' : 'Usar mi ubicacion'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Latitud"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  step="any"
                />
                <input
                  type="number"
                  placeholder="Longitud"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                  step="any"
                />
              </div>
              {formErrors.coordinates && <p className="text-xs text-red-500 mt-1">{formErrors.coordinates}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  placeholder="+52 999 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@negocio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Emoji Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icono del negocio
              </label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl max-h-32 overflow-y-auto">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${
                      selectedEmoji === emoji
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {selectedEmoji && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>Seleccionado: {selectedEmoji}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedEmoji('')}
                    className="text-red-500 underline text-xs"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>
          </div>

          <MobileModal.Footer>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateBusiness}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Creando...' : 'Crear Negocio'}
            </button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Delete Modal */}
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Eliminar Negocio"
          size="sm"
        >
          <p className="text-gray-600 dark:text-gray-300 text-center py-4">
            ¿Estas seguro de eliminar <strong>{selectedBusiness?.name}</strong>?
            <br />
            <span className="text-sm text-gray-500">Esta accion no se puede deshacer.</span>
          </p>
          <MobileModal.Footer>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteBusiness}
              disabled={submitting}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Assign Owner Modal */}
        <MobileModal
          isOpen={isAssignOwnerModalOpen}
          onClose={() => setIsAssignOwnerModalOpen(false)}
          title="Asignar Owner"
          description={selectedBusiness?.name}
          size="md"
        >
          <div className="space-y-2">
            {availableOwners.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500">No hay owners disponibles</p>
                <p className="text-sm text-gray-400">Crea un usuario con rol "business_owner" primero</p>
              </div>
            ) : (
              availableOwners.map((owner) => (
                <button
                  key={owner._id}
                  onClick={() => handleAssignOwner(owner._id)}
                  disabled={submitting}
                  className="w-full flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-semibold">
                    {owner.name?.charAt(0) || 'O'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{owner.name}</p>
                    <p className="text-sm text-gray-500">{owner.email}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              ))
            )}
          </div>
        </MobileModal>

        {/* View Modal */}
        <MobileModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Detalles del Negocio"
          size="lg"
        >
          {selectedBusiness && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {selectedBusiness.logo ? (
                    <img src={selectedBusiness.logo} alt={selectedBusiness.name} className="w-full h-full object-cover" />
                  ) : selectedBusiness.emoji ? (
                    <span className="text-3xl">{selectedBusiness.emoji}</span>
                  ) : (
                    <HiOutlineOfficeBuilding className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBusiness.name}
                  </h3>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    getBusinessStatus(selectedBusiness) === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {getBusinessStatus(selectedBusiness) === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                {selectedBusiness.description && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Descripcion</label>
                    <p className="text-gray-900 dark:text-white">{selectedBusiness.description}</p>
                  </div>
                )}
                {selectedBusiness.address && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Direccion</label>
                    <p className="text-gray-900 dark:text-white flex items-start gap-2">
                      <MapPin size={16} className="text-gray-400 mt-0.5" />
                      {selectedBusiness.address}
                    </p>
                  </div>
                )}
                {selectedBusiness.phone && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Telefono</label>
                    <p className="text-gray-900 dark:text-white">{selectedBusiness.phone}</p>
                  </div>
                )}
                {selectedBusiness.email && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedBusiness.email}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Owner Asignado</label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedBusiness.owner?.name || 'Sin asignar'}
                  </p>
                </div>
              </div>
            </div>
          )}
          <MobileModal.Footer>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                setIsViewModalOpen(false);
                openEditModal(selectedBusiness);
              }}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
            >
              Editar
            </button>
          </MobileModal.Footer>
        </MobileModal>
      </div>
    );
  }

  // Desktop Layout (Original - kept unchanged)
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
              {filteredBusinesses.length === 0 ? (
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
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredBusinesses.length} de {businesses.length} negocios
      </p>

      {/* Desktop Create Modal */}
      <Modal
        isOpen={isCreateModalOpen && !isMobile}
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
            label="Direccion"
            placeholder="Direccion del negocio"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            error={formErrors.address}
            leftIcon={<MapPin size={18} />}
          />
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

          {/* Emoji Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icono del negocio (para el mapa)
            </label>
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

      {/* Desktop Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen && !isMobile}
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

      {/* Desktop Assign Owner Modal */}
      <Modal
        isOpen={isAssignOwnerModalOpen && !isMobile}
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

      {/* Desktop View Modal */}
      <Modal
        isOpen={isViewModalOpen && !isMobile}
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
