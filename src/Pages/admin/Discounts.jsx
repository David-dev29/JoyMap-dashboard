import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Building2,
  Copy,
  CheckCircle,
  Check,
  AlertCircle,
  ChevronRight,
  Clock,
  Infinity,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Dropdown, Toggle } from '../../components/ui';
import MobileModal from '../../components/ui/MobileModal';
import { authFetch, ENDPOINTS } from '../../config/api';

// Hook for mobile detection
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

const statusConfig = {
  active: { label: 'Activo', color: 'success' },
  expired: { label: 'Expirado', color: 'default' },
  scheduled: { label: 'Programado', color: 'info' },
  disabled: { label: 'Deshabilitado', color: 'danger' },
};

const statusTabs = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Activos' },
  { key: 'disabled', label: 'Inactivos' },
  { key: 'expired', label: 'Expirados' },
];

// Mobile Discount Card Component
const MobileDiscountCard = ({ discount, onEdit, onDelete, onCopy, copiedCode, getBusinessName, formatDate }) => {
  const [showActions, setShowActions] = useState(false);

  const statusColorClasses = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    expired: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    disabled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setShowActions(!showActions)}
        className="w-full p-4 text-left"
      >
        {/* Code Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <code className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono text-base font-bold">
              {discount.code}
            </code>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(discount.code);
              }}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {copiedCode === discount.code ? (
                <CheckCircle size={16} className="text-emerald-500" />
              ) : (
                <Copy size={16} className="text-gray-400" />
              )}
            </button>
          </div>
          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColorClasses[discount.status] || statusColorClasses.disabled}`}>
            {statusConfig[discount.status]?.label || discount.status}
          </span>
        </div>

        {/* Discount Value */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${discount.type === 'percentage' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
            {discount.type === 'percentage' ? (
              <Percent size={20} className="text-purple-600 dark:text-purple-400" />
            ) : (
              <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
            </p>
            {discount.minOrder > 0 && (
              <p className="text-xs text-gray-500">Min. ${discount.minOrder}</p>
            )}
          </div>
        </div>

        {/* Business */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
          <Building2 size={14} className="text-gray-400" />
          <span>{getBusinessName(discount)}</span>
        </div>

        {/* Uses */}
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Usos:</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {discount.usedCount || 0}
            </span>
            <span className="text-gray-500">
              {discount.maxUses ? `/ ${discount.maxUses}` : '/ ∞'}
            </span>
            {discount.maxUses && (
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-1.5 bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(((discount.usedCount || 0) / discount.maxUses) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} />
          <span>{formatDate(discount.startDate)} - {formatDate(discount.endDate)}</span>
        </div>

        <ChevronRight size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${showActions ? 'rotate-90' : ''}`} />
      </button>

      {/* Action drawer */}
      {showActions && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex gap-2 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => onEdit(discount)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete(discount)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 bg-red-50 dark:bg-red-900/30 rounded-xl text-sm font-medium text-red-600 dark:text-red-400"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};

const Discounts = () => {
  const isMobile = useIsMobile();
  const [discounts, setDiscounts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    businessId: '',
    maxUses: '',
    startDate: '',
    endDate: '',
    minOrder: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchDiscounts();
    fetchBusinesses();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.discounts.base);
      const data = await response.json();

      if (response.ok) {
        const discountsList = data.discounts || data.response || data.data || (Array.isArray(data) ? data : []);
        const discountsWithStatus = discountsList.map(d => ({
          ...d,
          status: getDiscountStatus(d),
        }));
        setDiscounts(Array.isArray(discountsWithStatus) ? discountsWithStatus : []);
      } else {
        throw new Error(data.message || 'Error al cargar descuentos');
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      showToast('Error al cargar los descuentos', 'error');
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const response = await authFetch(ENDPOINTS.businesses.all);
      const data = await response.json();

      if (response.ok) {
        const businessList = data.businesses || data.response || data.data || (Array.isArray(data) ? data : []);
        setBusinesses(Array.isArray(businessList) ? businessList : []);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const getDiscountStatus = (discount) => {
    if (!discount.isActive) return 'disabled';
    const now = new Date();
    const startDate = new Date(discount.startDate);
    const endDate = new Date(discount.endDate);

    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'expired';
    return 'active';
  };

  // Filter discounts
  const filteredDiscounts = discounts.filter((discount) => {
    const matchesSearch = discount.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const currentStatusFilter = isMobile ? (activeTab === 'all' ? '' : activeTab) : statusFilter;
    const matchesStatus = !currentStatusFilter || discount.status === currentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count by status for tabs
  const countByStatus = (status) => {
    if (status === 'all') return discounts.length;
    return discounts.filter(d => d.status === status).length;
  };

  // Build business options for select
  const businessOptions = [
    { value: '', label: 'Todos los negocios' },
    ...businesses.map(b => ({
      value: b._id,
      label: b.name,
    })),
  ];

  // Handlers
  const handleSubmit = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.code.trim()) errors.code = 'El codigo es requerido';
    if (!formData.value || parseFloat(formData.value) < 0) errors.value = 'El valor no puede ser negativo';
    if (!formData.value || parseFloat(formData.value) <= 0) errors.value = 'El valor debe ser mayor a 0';
    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      errors.value = 'El porcentaje no puede ser mayor a 100';
    }
    if (!formData.startDate) errors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) errors.endDate = 'La fecha de fin es requerida';

    // Validate date coherence
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        errors.endDate = 'La fecha fin debe ser posterior a la fecha inicio';
      }
    }

    // Validate minOrder not negative
    if (formData.minOrder && parseFloat(formData.minOrder) < 0) {
      errors.minOrder = 'No puede ser negativo';
    }

    // Validate maxUses not negative
    if (formData.maxUses && parseInt(formData.maxUses) < 0) {
      errors.maxUses = 'No puede ser negativo';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        businessId: formData.businessId || null,
        minOrder: formData.minOrder ? parseFloat(formData.minOrder) : 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: true,
      };

      let response;
      if (editingDiscount) {
        response = await authFetch(ENDPOINTS.discounts.byId(editingDiscount._id), {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        });
      } else {
        response = await authFetch(ENDPOINTS.discounts.create, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast(editingDiscount ? 'Descuento actualizado' : 'Descuento creado');
        await fetchDiscounts();
        closeModal();
      } else {
        throw new Error(data.message || 'Error al guardar descuento');
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      showToast(error.message || 'Error al guardar el descuento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDiscount) return;

    setSubmitting(true);
    try {
      const response = await authFetch(ENDPOINTS.discounts.byId(selectedDiscount._id), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Descuento eliminado');
        await fetchDiscounts();
        setIsDeleteModalOpen(false);
        setSelectedDiscount(null);
      } else {
        throw new Error(data.message || 'Error al eliminar descuento');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      showToast(error.message || 'Error al eliminar el descuento', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      businessId: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      minOrder: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code || '',
      type: discount.type || 'percentage',
      value: discount.value?.toString() || '',
      businessId: discount.businessId?._id || discount.businessId || '',
      maxUses: discount.maxUses?.toString() || '',
      startDate: discount.startDate ? discount.startDate.split('T')[0] : '',
      endDate: discount.endDate ? discount.endDate.split('T')[0] : '',
      minOrder: discount.minOrder?.toString() || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (discount) => {
    setSelectedDiscount(discount);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      businessId: '',
      maxUses: '',
      startDate: '',
      endDate: '',
      minOrder: '',
    });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getBusinessName = (discount) => {
    if (!discount.businessId) return 'Global';
    if (typeof discount.businessId === 'object') return discount.businessId.name || 'Negocio';
    const business = businesses.find(b => b._id === discount.businessId);
    return business?.name || 'Negocio';
  };

  // Form content for modals
  const renderDiscountForm = () => (
    <div className="space-y-4">
      <Input
        label="Codigo de descuento"
        placeholder="Ej: PROMO20"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        error={formErrors.code}
        helperText="Solo letras mayusculas y numeros"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Tipo"
          options={[
            { value: 'percentage', label: 'Porcentaje (%)' },
            { value: 'fixed', label: 'Monto fijo ($)' },
          ]}
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        />
        <Input
          label={formData.type === 'percentage' ? 'Porcentaje' : 'Monto'}
          type="number"
          placeholder={formData.type === 'percentage' ? '20' : '50'}
          value={formData.value}
          onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          error={formErrors.value}
        />
      </div>

      <Select
        label="Aplicar a"
        options={businessOptions}
        value={formData.businessId}
        onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Limite de usos"
          type="number"
          min="0"
          placeholder="Ilimitado"
          value={formData.maxUses}
          onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
          error={formErrors.maxUses}
        />
        <Input
          label="Orden minima ($)"
          type="number"
          min="0"
          placeholder="0"
          value={formData.minOrder}
          onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
          error={formErrors.minOrder}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha inicio"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          error={formErrors.startDate}
        />
        <Input
          label="Fecha fin"
          type="date"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          error={formErrors.endDate}
        />
      </div>
    </div>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -m-4 md:-m-6">
        {/* Toast */}
        {toast.show && (
          <div className={`fixed top-4 left-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
          {/* Title */}
          <div className="px-4 pt-4 pb-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Descuentos
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredDiscounts.length} codigos
            </p>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar codigo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {statusTabs.map((tab) => {
                const count = countByStatus(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Discount List */}
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : filteredDiscounts.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || activeTab !== 'all'
                  ? 'No se encontraron descuentos'
                  : 'No hay descuentos registrados'
                }
              </p>
            </div>
          ) : (
            filteredDiscounts.map((discount) => (
              <MobileDiscountCard
                key={discount._id}
                discount={discount}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onCopy={copyCode}
                copiedCode={copiedCode}
                getBusinessName={getBusinessName}
                formatDate={formatDate}
              />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-50"
        >
          <Plus size={24} />
        </button>

        {/* Create/Edit Modal */}
        <MobileModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingDiscount ? 'Editar Descuento' : 'Nuevo Descuento'}
          description={editingDiscount ? editingDiscount.code : 'Crea un nuevo codigo promocional'}
          size="lg"
        >
          {renderDiscountForm()}
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingDiscount ? 'Guardar' : 'Crear'}
            </Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Delete Modal */}
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedDiscount(null);
          }}
          title="Eliminar Descuento"
          size="sm"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Estas seguro de eliminar el codigo <strong>{selectedDiscount?.code}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta accion no se puede deshacer.
            </p>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedDiscount(null);
            }}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting}>
              Eliminar
            </Button>
          </MobileModal.Footer>
        </MobileModal>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="space-y-6">
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
            Codigos de Descuento
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los codigos promocionales de la plataforma
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={openCreateModal}>
          Nuevo Descuento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por codigo..."
              leftIcon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'active', label: 'Activo' },
              { value: 'scheduled', label: 'Programado' },
              { value: 'expired', label: 'Expirado' },
              { value: 'disabled', label: 'Deshabilitado' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder=""
            fullWidth={false}
            className="w-44"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header>Codigo</Table.Header>
              <Table.Header>Descuento</Table.Header>
              <Table.Header>Negocio</Table.Header>
              <Table.Header>Usos</Table.Header>
              <Table.Header>Vigencia</Table.Header>
              <Table.Header>Estado</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {loading ? (
              <Table.Loading colSpan={7} />
            ) : filteredDiscounts.length === 0 ? (
              <Table.Empty
                colSpan={7}
                message={searchQuery || statusFilter
                  ? 'No se encontraron descuentos con los filtros aplicados'
                  : 'No hay codigos de descuento registrados'
                }
              />
            ) : (
              filteredDiscounts.map((discount) => (
                <Table.Row key={discount._id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-mono text-sm font-semibold">
                        {discount.code}
                      </code>
                      <button
                        onClick={() => copyCode(discount.code)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                        title="Copiar codigo"
                      >
                        {copiedCode === discount.code ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <Copy size={14} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      {discount.type === 'percentage' ? (
                        <Percent size={16} className="text-purple-500" />
                      ) : (
                        <DollarSign size={16} className="text-emerald-500" />
                      )}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                      </span>
                    </div>
                    {discount.minOrder > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Min. ${discount.minOrder}
                      </p>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {getBusinessName(discount)}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {discount.usedCount || 0}
                      </span>
                      <span className="text-gray-500">
                        {discount.maxUses ? ` / ${discount.maxUses}` : ' / ∞'}
                      </span>
                    </div>
                    {discount.maxUses && (
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full mt-1">
                        <div
                          className="h-1.5 bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(((discount.usedCount || 0) / discount.maxUses) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{formatDate(discount.startDate)}</p>
                      <p className="text-gray-500">al {formatDate(discount.endDate)}</p>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant={statusConfig[discount.status]?.color} size="sm" dot>
                      {statusConfig[discount.status]?.label}
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
                              openEditModal(discount);
                            }}
                          >
                            Editar
                          </Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            icon={<Trash2 size={16} />}
                            danger
                            onClick={() => {
                              close();
                              openDeleteModal(discount);
                            }}
                          >
                            Eliminar
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDiscount ? 'Editar Descuento' : 'Nuevo Descuento'}
        description={editingDiscount ? `Editando: ${editingDiscount.code}` : 'Crea un nuevo codigo de descuento'}
        size="lg"
      >
        {renderDiscountForm()}
        <Modal.Footer>
          <Button variant="ghost" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {editingDiscount ? 'Guardar Cambios' : 'Crear Descuento'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDiscount(null);
        }}
        title="Eliminar Descuento"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Estas seguro de eliminar el codigo <strong>{selectedDiscount?.code}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Esta accion no se puede deshacer.
          </p>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedDiscount(null);
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={submitting}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Discounts;
