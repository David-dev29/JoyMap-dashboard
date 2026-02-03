import { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  UtensilsCrossed,
  Store,
  Truck,
  Package,
  ShoppingBag,
  Coffee,
  Pill,
  MoreHorizontal,
  Check,
  AlertCircle,
  Search,
  ChevronRight,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Dropdown } from '../../components/ui';
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

// Available icons for categories
const availableIcons = [
  { value: 'utensils', label: 'Comida', icon: UtensilsCrossed },
  { value: 'store', label: 'Tienda', icon: Store },
  { value: 'truck', label: 'Envio', icon: Truck },
  { value: 'package', label: 'Paquete', icon: Package },
  { value: 'shopping', label: 'Compras', icon: ShoppingBag },
  { value: 'coffee', label: 'Cafe', icon: Coffee },
  { value: 'pharmacy', label: 'Farmacia', icon: Pill },
];

const typeOptions = [
  { value: 'food', label: 'Comida' },
  { value: 'store', label: 'Tienda' },
  { value: 'delivery', label: 'Envio' },
  { value: 'services', label: 'Servicios' },
];

const typeColors = {
  food: 'warning',
  store: 'primary',
  delivery: 'info',
  services: 'purple',
};

const typeTabs = [
  { key: 'all', label: 'Todos', icon: Tag },
  { key: 'food', label: 'Comida', icon: UtensilsCrossed },
  { key: 'store', label: 'Tienda', icon: Store },
  { key: 'delivery', label: 'Envio', icon: Truck },
  { key: 'services', label: 'Servicios', icon: Package },
];

// Mobile Category Card Component
const MobileCategoryCard = ({ category, onEdit, onDelete, getIconComponent }) => {
  const [showActions, setShowActions] = useState(false);
  const IconComponent = getIconComponent(category.icon);

  const typeColorClasses = {
    food: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    store: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivery: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    services: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const iconBgClasses = {
    food: 'bg-amber-100 dark:bg-amber-900/30',
    store: 'bg-indigo-100 dark:bg-indigo-900/30',
    delivery: 'bg-blue-100 dark:bg-blue-900/30',
    services: 'bg-purple-100 dark:bg-purple-900/30',
  };

  const iconColorClasses = {
    food: 'text-amber-600 dark:text-amber-400',
    store: 'text-indigo-600 dark:text-indigo-400',
    delivery: 'text-blue-600 dark:text-blue-400',
    services: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
      <button
        onClick={() => setShowActions(!showActions)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClasses[category.type] || 'bg-gray-100 dark:bg-gray-700'}`}>
            <IconComponent size={24} className={iconColorClasses[category.type] || 'text-gray-600 dark:text-gray-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              /{category.slug}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${typeColorClasses[category.type] || typeColorClasses.services}`}>
              {typeOptions.find(t => t.value === category.type)?.label || category.type}
            </span>
            <ChevronRight size={18} className={`text-gray-400 transition-transform ${showActions ? 'rotate-90' : ''}`} />
          </div>
        </div>

        {/* Description */}
        {category.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {category.description}
          </p>
        )}
      </button>

      {/* Action drawer */}
      {showActions && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 flex gap-2 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={() => onEdit(category)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm"
          >
            <Edit2 size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete(category)}
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

const Categories = () => {
  const isMobile = useIsMobile();

  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'utensils',
    type: 'food',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.businessCategories.base);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar categorías');
      }

      const categoriesData = data.categories || data.response || data.data || (Array.isArray(data) ? data : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Error al cargar las categorías', 'error');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Filter categories
  const filteredCategories = categories.filter((category) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (category.name || '').toLowerCase().includes(searchLower) ||
      (category.slug || '').toLowerCase().includes(searchLower);
    const matchesType = activeTab === 'all' || category.type === activeTab;
    return matchesSearch && matchesType;
  });

  // Count by type for tabs
  const countByType = (type) => {
    if (type === 'all') return categories.length;
    return categories.filter(c => c.type === type).length;
  };

  // Handlers
  const handleSubmit = async () => {
    setFormErrors({});

    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.slug.trim()) errors.slug = 'El slug es requerido';
    if (!formData.type) errors.type = 'El tipo es requerido';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const requestBody = {
        name: formData.name,
        slug: formData.slug,
        icon: formData.icon,
        type: formData.type,
        description: formData.description,
      };

      let response;
      if (editingCategory) {
        response = await authFetch(`${ENDPOINTS.businessCategories.base}/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(requestBody),
        });
      } else {
        response = await authFetch(ENDPOINTS.businessCategories.base, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        await fetchCategories();
        closeModal();
      } else {
        throw new Error(data.message || data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Error al guardar la categoría', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const response = await authFetch(`${ENDPOINTS.businessCategories.base}/${selectedCategory._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        showToast('Categoría eliminada');
        await fetchCategories();
      } else {
        throw new Error(data.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error.message || 'Error al eliminar la categoría', 'error');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'utensils',
      type: 'food',
      description: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || 'utensils',
      type: category.type || 'food',
      description: category.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: 'utensils',
      type: 'food',
      description: '',
    });
    setFormErrors({});
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : generateSlug(name),
    });
  };

  const getIconComponent = (iconName) => {
    const iconConfig = availableIcons.find(i => i.value === iconName);
    return iconConfig?.icon || Tag;
  };

  // Form content for modals
  const renderCategoryForm = () => (
    <div className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Ej: Restaurantes"
        value={formData.name}
        onChange={handleNameChange}
        error={formErrors.name}
      />
      <Input
        label="Slug (URL)"
        placeholder="restaurantes"
        value={formData.slug}
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        error={formErrors.slug}
        helperText="Se usa en la URL para identificar la categoria"
      />

      {/* Icon selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Icono
        </label>
        <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-7'} gap-2`}>
          {availableIcons.map((iconOption) => {
            const IconComp = iconOption.icon;
            return (
              <button
                key={iconOption.value}
                type="button"
                onClick={() => setFormData({ ...formData, icon: iconOption.value })}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${formData.icon === iconOption.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
                title={iconOption.label}
              >
                <IconComp
                  size={20}
                  className={formData.icon === iconOption.value
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500'
                  }
                />
              </button>
            );
          })}
        </div>
      </div>

      <Select
        label="Tipo"
        options={typeOptions}
        value={formData.type}
        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        error={formErrors.type}
      />
      <Input
        label="Descripcion (opcional)"
        placeholder="Descripcion breve de la categoria..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
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
              Categorias
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {filteredCategories.length} categorias
            </p>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar categoria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Type Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              {typeTabs.map((tab) => {
                const Icon = tab.icon;
                const count = countByType(tab.key);
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
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

        {/* Category List */}
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery || activeTab !== 'all'
                  ? 'No se encontraron categorias'
                  : 'No hay categorias registradas'
                }
              </p>
              {!searchQuery && activeTab === 'all' && (
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium"
                >
                  Crear primera categoria
                </button>
              )}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <MobileCategoryCard
                key={category._id || category.id}
                category={category}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                getIconComponent={getIconComponent}
              />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-50"
        >
          <Plus size={24} />
        </button>

        {/* Create/Edit Modal */}
        <MobileModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
          description={editingCategory ? editingCategory.name : 'Crea una nueva categoria'}
          size="lg"
        >
          {renderCategoryForm()}
          <MobileModal.Footer>
            <Button variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editingCategory ? 'Guardar' : 'Crear'}
            </Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Delete Modal */}
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
          }}
          title="Eliminar Categoria"
          size="sm"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Estas seguro de eliminar la categoria <strong>{selectedCategory?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Los negocios con esta categoria quedaran sin clasificar.
            </p>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => {
              setIsDeleteModalOpen(false);
              setSelectedCategory(null);
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
            Categorias de Negocios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Administra las categorias para clasificar los negocios
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={openCreateModal}>
          Nueva Categoria
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </Card>
          ))
        ) : categories.length === 0 ? (
          <Card className="col-span-full">
            <div className="text-center py-12">
              <Tag size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">No hay categorias registradas</p>
              <Button className="mt-4" onClick={openCreateModal}>
                Crear primera categoria
              </Button>
            </div>
          </Card>
        ) : (
          categories.map((category) => {
            const IconComponent = getIconComponent(category.icon);
            return (
              <Card key={category._id || category.id} className="relative group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${typeColors[category.type] || 'gray'}-100 dark:bg-${typeColors[category.type] || 'gray'}-900/30`}>
                    <IconComponent size={24} className={`text-${typeColors[category.type] || 'gray'}-600 dark:text-${typeColors[category.type] || 'gray'}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      /{category.slug}
                    </p>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <Badge variant={typeColors[category.type] || 'secondary'} size="xs" className="mt-2">
                      {typeOptions.find(t => t.value === category.type)?.label || category.type}
                    </Badge>
                  </div>

                  {/* Actions dropdown */}
                  <Dropdown
                    align="right"
                    trigger={
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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
                            openEditModal(category);
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
                            openDeleteModal(category);
                          }}
                        >
                          Eliminar
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Results count */}
      {!loading && categories.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {categories.length} categorías en total
        </p>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
        description={editingCategory ? `Editando: ${editingCategory.name}` : 'Crea una nueva categoria para negocios'}
        size="md"
      >
        {renderCategoryForm()}
        <Modal.Footer>
          <Button variant="ghost" onClick={closeModal}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {editingCategory ? 'Guardar Cambios' : 'Crear Categoria'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        title="Eliminar Categoria"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={28} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Estas seguro de eliminar la categoria <strong>{selectedCategory?.name}</strong>?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Los negocios con esta categoria quedaran sin clasificar.
          </p>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => {
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
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

export default Categories;
