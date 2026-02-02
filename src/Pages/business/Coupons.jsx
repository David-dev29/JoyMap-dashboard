import { useState, useEffect } from 'react';
import {
  Ticket,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Power,
  Check,
  X,
  AlertCircle,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Copy,
} from 'lucide-react';
import {
  HiOutlineTicket,
  HiOutlinePlus,
  HiOutlineClipboardCopy,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBan,
  HiOutlineCheck,
  HiOutlineSearch,
} from 'react-icons/hi';
import { toast } from 'sonner';
import { Card, Button, Input, Badge, Table, Modal, Dropdown, MobileModal } from '../../components/ui';
import { authFetch, ENDPOINTS } from '../../config/api';

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

const Coupons = () => {
  const isMobile = useIsMobile();

  // State
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [mobileTab, setMobileTab] = useState('active'); // active, inactive, expired

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discount: '',
    description: '',
    minOrder: '',
    maxUses: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Toast helper
  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  // Fetch coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.coupons.my);
      const data = await response.json();

      if (data.success !== false) {
        const couponList = data.coupons || data.data || (Array.isArray(data) ? data : []);
        setCoupons(Array.isArray(couponList) ? couponList : []);
      } else {
        throw new Error(data.message || 'Error al cargar cupones');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      showToast('Error al cargar los cupones', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch = coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter ||
      (statusFilter === 'active' && coupon.isActive) ||
      (statusFilter === 'inactive' && !coupon.isActive);
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreateCoupon = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.code.trim()) errors.code = 'El codigo es requerido';
    if (!formData.discount || formData.discount <= 0) errors.discount = 'El descuento es requerido';
    if (formData.discountType === 'percentage' && formData.discount > 100) {
      errors.discount = 'El porcentaje no puede ser mayor a 100';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discount: Number(formData.discount),
        description: formData.description || undefined,
        minOrder: formData.minOrder ? Number(formData.minOrder) : undefined,
        maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
        startsAt: formData.startsAt || undefined,
        expiresAt: formData.expiresAt || undefined,
        isActive: formData.isActive,
      };

      const response = await authFetch(ENDPOINTS.coupons.base, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Cupon creado exitosamente');
        await fetchCoupons();
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        throw new Error(data.message || 'Error al crear cupon');
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      showToast(error.message || 'Error al crear el cupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCoupon = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.code.trim()) errors.code = 'El codigo es requerido';
    if (!formData.discount || formData.discount <= 0) errors.discount = 'El descuento es requerido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discount: Number(formData.discount),
        description: formData.description || undefined,
        minOrder: formData.minOrder ? Number(formData.minOrder) : null,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        startsAt: formData.startsAt || null,
        expiresAt: formData.expiresAt || null,
        isActive: formData.isActive,
      };

      const response = await authFetch(ENDPOINTS.coupons.byId(selectedCoupon._id), {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Cupon actualizado exitosamente');
        await fetchCoupons();
        setIsEditModalOpen(false);
        setSelectedCoupon(null);
        resetForm();
      } else {
        throw new Error(data.message || 'Error al actualizar cupon');
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      showToast(error.message || 'Error al actualizar el cupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!selectedCoupon) return;

    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.coupons.byId(selectedCoupon._id), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Cupon eliminado exitosamente');
        await fetchCoupons();
        setIsDeleteModalOpen(false);
        setSelectedCoupon(null);
      } else {
        throw new Error(data.message || 'Error al eliminar cupon');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      showToast(error.message || 'Error al eliminar el cupon', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const response = await authFetch(ENDPOINTS.coupons.byId(coupon._id), {
        method: 'PUT',
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast(`Cupon ${!coupon.isActive ? 'activado' : 'desactivado'}`);
        await fetchCoupons();
      } else {
        throw new Error(data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Codigo copiado al portapapeles');
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discount: '',
      description: '',
      minOrder: '',
      maxUses: '',
      startsAt: '',
      expiresAt: '',
      isActive: true,
    });
    setFormErrors({});
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discount: coupon.discount || '',
      description: coupon.description || '',
      minOrder: coupon.minOrder || '',
      maxUses: coupon.maxUses || '',
      startsAt: coupon.startsAt ? coupon.startsAt.split('T')[0] : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDeleteModalOpen(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Check if coupon is expired
  const isExpired = (coupon) => {
    if (!coupon.expiresAt) return false;
    return new Date(coupon.expiresAt) < new Date();
  };

  // Check if coupon has reached max uses
  const isMaxUsesReached = (coupon) => {
    if (!coupon.maxUses) return false;
    return (coupon.usedCount || 0) >= coupon.maxUses;
  };

  // Get coupon status
  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { label: 'Inactivo', variant: 'default' };
    if (isExpired(coupon)) return { label: 'Expirado', variant: 'danger' };
    if (isMaxUsesReached(coupon)) return { label: 'Agotado', variant: 'warning' };
    return { label: 'Activo', variant: 'success' };
  };

  // Mobile tab filtering
  const getMobileFilteredCoupons = () => {
    let filtered = coupons;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((coupon) =>
        coupon.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    switch (mobileTab) {
      case 'active':
        return filtered.filter(c => c.isActive && !isExpired(c) && !isMaxUsesReached(c));
      case 'inactive':
        return filtered.filter(c => !c.isActive);
      case 'expired':
        return filtered.filter(c => isExpired(c) || isMaxUsesReached(c));
      default:
        return filtered;
    }
  };

  // Mobile tab counts
  const getTabCounts = () => ({
    active: coupons.filter(c => c.isActive && !isExpired(c) && !isMaxUsesReached(c)).length,
    inactive: coupons.filter(c => !c.isActive).length,
    expired: coupons.filter(c => isExpired(c) || isMaxUsesReached(c)).length,
  });

  // Form component (reused for create/edit)
  const CouponForm = () => (
    <div className="space-y-4">
      {/* Code */}
      <Input
        label="Codigo del cupon *"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        placeholder="Ej: DESCUENTO20"
        error={formErrors.code}
        className="uppercase"
      />

      {/* Discount type and value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Tipo de descuento
          </label>
          <select
            value={formData.discountType}
            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="percentage">Porcentaje (%)</option>
            <option value="fixed">Monto fijo ($)</option>
          </select>
        </div>
        <Input
          label="Valor del descuento *"
          type="number"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
          placeholder={formData.discountType === 'percentage' ? '20' : '50'}
          error={formErrors.discount}
          leftIcon={formData.discountType === 'percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
        />
      </div>

      {/* Description */}
      <Input
        label="Descripcion (se muestra al cliente)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Ej: 20% de descuento en tu primer pedido"
      />

      {/* Min order and max uses */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pedido minimo (opcional)"
          type="number"
          value={formData.minOrder}
          onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
          placeholder="Sin minimo"
          leftIcon={<DollarSign size={18} />}
        />
        <Input
          label="Usos maximos (opcional)"
          type="number"
          value={formData.maxUses}
          onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
          placeholder="Ilimitado"
          leftIcon={<Users size={18} />}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Fecha de inicio
          </label>
          <input
            type="date"
            value={formData.startsAt}
            onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Fecha de expiracion
          </label>
          <input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        <input
          type="checkbox"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">Cupon activo</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Los clientes podran usar este cupon inmediatamente
          </p>
        </div>
      </label>
    </div>
  );

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    const mobileFilteredCoupons = getMobileFilteredCoupons();
    const tabCounts = getTabCounts();

    const MobileCouponCard = ({ coupon }) => {
      const status = getCouponStatus(coupon);

      return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4">
          {/* Header with code and status */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-lg font-bold font-mono text-primary-600 dark:text-primary-400">
                  {coupon.code}
                </code>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <HiOutlineClipboardCopy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {coupon.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                  {coupon.description}
                </p>
              )}
            </div>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>

          {/* Discount display */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                de descuento
              </span>
            </div>
          </div>

          {/* Info row */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users size={14} />
              <span>
                {coupon.usedCount || 0}{coupon.maxUses && ` / ${coupon.maxUses}`} usos
              </span>
            </div>
            {coupon.expiresAt && (
              <div className={`flex items-center gap-1 ${isExpired(coupon) ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>
                <Calendar size={14} />
                <span>{formatDate(coupon.expiresAt)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(coupon)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <HiOutlinePencil className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={() => handleToggleStatus(coupon)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                coupon.isActive
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {coupon.isActive ? (
                <>
                  <HiOutlineBan className="w-4 h-4" />
                  Desactivar
                </>
              ) : (
                <>
                  <HiOutlineCheck className="w-4 h-4" />
                  Activar
                </>
              )}
            </button>
            <button
              onClick={() => openDeleteModal(coupon)}
              className="p-2.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-colors"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cupones</h1>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cupones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-2">
            <button
              onClick={() => setMobileTab('active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                mobileTab === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>Activos</span>
              <span className="px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded-full text-xs">
                {tabCounts.active}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('inactive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                mobileTab === 'inactive'
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>Inactivos</span>
              <span className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-600 rounded-full text-xs">
                {tabCounts.inactive}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('expired')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                mobileTab === 'expired'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>Expirados</span>
              <span className="px-1.5 py-0.5 bg-red-200 dark:bg-red-800 rounded-full text-xs">
                {tabCounts.expired}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : mobileFilteredCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <HiOutlineTicket className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchQuery ? 'No se encontraron cupones' : 'No hay cupones en esta categoria'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {!searchQuery && mobileTab === 'active' && 'Crea tu primer cupon con el boton +'}
              </p>
            </div>
          ) : (
            mobileFilteredCoupons.map((coupon) => (
              <MobileCouponCard key={coupon._id} coupon={coupon} />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
        >
          <HiOutlinePlus className="w-7 h-7" />
        </button>

        {/* Mobile Create Modal */}
        <MobileModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Cupon"
          size="xl"
          fullHeight
        >
          <div className="space-y-4">
            <Input
              label="Codigo del cupon *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ej: DESCUENTO20"
              error={formErrors.code}
              className="uppercase"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tipo
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </select>
              </div>
              <Input
                label="Descuento *"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                error={formErrors.discount}
              />
            </div>

            <Input
              label="Descripcion"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="20% de descuento en tu primer pedido"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pedido minimo"
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Usos maximos"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Sin limite"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Inicio
                </label>
                <input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Expira
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Cupon activo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Disponible para usar inmediatamente
                </p>
              </div>
            </label>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCoupon} loading={submitting}>Crear</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Mobile Edit Modal */}
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCoupon(null);
            resetForm();
          }}
          title="Editar Cupon"
          description={selectedCoupon?.code}
          size="xl"
          fullHeight
        >
          <div className="space-y-4">
            <Input
              label="Codigo del cupon *"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ej: DESCUENTO20"
              error={formErrors.code}
              className="uppercase"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tipo
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                >
                  <option value="percentage">Porcentaje</option>
                  <option value="fixed">Monto fijo</option>
                </select>
              </div>
              <Input
                label="Descuento *"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder={formData.discountType === 'percentage' ? '20' : '50'}
                error={formErrors.discount}
              />
            </div>

            <Input
              label="Descripcion"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="20% de descuento en tu primer pedido"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Pedido minimo"
                type="number"
                value={formData.minOrder}
                onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Usos maximos"
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                placeholder="Sin limite"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Inicio
                </label>
                <input
                  type="date"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Expira
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Cupon activo</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Disponible para usar inmediatamente
                </p>
              </div>
            </label>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedCoupon(null);
              resetForm();
            }}>Cancelar</Button>
            <Button onClick={handleEditCoupon} loading={submitting}>Guardar</Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Mobile Delete Modal */}
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCoupon(null);
          }}
          title="Eliminar Cupon"
          size="sm"
        >
          <p className="text-gray-600 dark:text-gray-300">
            ¿Estas seguro de eliminar el cupon <strong className="text-gray-900 dark:text-white">{selectedCoupon?.code}</strong>? Esta accion no se puede deshacer.
          </p>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedCoupon(null);
            }}>Cancelar</Button>
            <Button variant="danger" onClick={handleDeleteCoupon} loading={submitting}>Eliminar</Button>
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
            Cupones de Descuento
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra los cupones promocionales de tu negocio
          </p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
        >
          Nuevo Cupon
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <Ticket size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{coupons.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total cupones</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Check size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coupons.filter(c => c.isActive && !isExpired(c) && !isMaxUsesReached(c)).length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Usos totales</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por codigo o descripcion..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 w-full md:w-44"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row hover={false}>
                <Table.Header>Codigo</Table.Header>
                <Table.Header>Descuento</Table.Header>
                <Table.Header>Usos</Table.Header>
                <Table.Header>Pedido Min.</Table.Header>
                <Table.Header>Expira</Table.Header>
                <Table.Header>Estado</Table.Header>
                <Table.Header align="right">Acciones</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {loading ? (
                <Table.Loading colSpan={7} />
              ) : filteredCoupons.length === 0 ? (
                <Table.Empty
                  colSpan={7}
                  message={searchQuery || statusFilter
                    ? 'No se encontraron cupones con los filtros aplicados'
                    : 'No hay cupones creados. Crea tu primer cupon!'
                  }
                />
              ) : (
                filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon);

                  return (
                    <Table.Row key={coupon._id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {coupon.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Copiar codigo"
                          >
                            <Copy size={14} className="text-gray-400" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs truncate">
                            {coupon.description}
                          </p>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discount}%`
                            : `$${coupon.discount}`
                          }
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-gray-600 dark:text-gray-300">
                          {coupon.usedCount || 0}
                          {coupon.maxUses && ` / ${coupon.maxUses}`}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {coupon.minOrder ? `$${coupon.minOrder}` : '-'}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={14} className="text-gray-400" />
                          <span className={isExpired(coupon) ? 'text-red-500' : ''}>
                            {formatDate(coupon.expiresAt)}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={status.variant} dot size="sm">
                          {status.label}
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
                                icon={<Edit2 size={16} />}
                                onClick={() => {
                                  close();
                                  openEditModal(coupon);
                                }}
                              >
                                Editar
                              </Dropdown.Item>
                              <Dropdown.Item
                                icon={<Copy size={16} />}
                                onClick={() => {
                                  close();
                                  copyToClipboard(coupon.code);
                                }}
                              >
                                Copiar codigo
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                icon={<Power size={16} />}
                                onClick={() => {
                                  close();
                                  handleToggleStatus(coupon);
                                }}
                              >
                                {coupon.isActive ? 'Desactivar' : 'Activar'}
                              </Dropdown.Item>
                              <Dropdown.Item
                                icon={<Trash2 size={16} />}
                                danger
                                onClick={() => {
                                  close();
                                  openDeleteModal(coupon);
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
          Mostrando {filteredCoupons.length} de {coupons.length} cupones
        </p>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Cupon"
        description="Crea un nuevo cupon de descuento para tus clientes"
        size="lg"
      >
        <CouponForm />
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreateCoupon} loading={submitting}>
            Crear Cupon
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCoupon(null);
          resetForm();
        }}
        title="Editar Cupon"
        description={`Editando: ${selectedCoupon?.code}`}
        size="lg"
      >
        <CouponForm />
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsEditModalOpen(false);
            setSelectedCoupon(null);
            resetForm();
          }}>
            Cancelar
          </Button>
          <Button onClick={handleEditCoupon} loading={submitting}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCoupon(null);
        }}
        title="Eliminar Cupon"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-300">
          ¿Estas seguro de eliminar el cupon <strong>{selectedCoupon?.code}</strong>? Esta accion no se puede deshacer.
        </p>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedCoupon(null);
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteCoupon} loading={submitting}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Coupons;
