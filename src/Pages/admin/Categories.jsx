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
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Dropdown } from '../../components/ui';
import { authFetch, ENDPOINTS } from '../../config/api';

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

const Categories = () => {
  // State
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.log('=== DEBUG Categories ===');
      console.log('Endpoint:', ENDPOINTS.businessCategories.base);

      const data = await response.json();
      console.log('Categories API Response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar categorías');
      }

      const categoriesData = data.categories || data.response || data.data || (Array.isArray(data) ? data : []);
      console.log('Final categoriesData:', categoriesData);
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

  // Handlers
  const handleSubmit = async () => {
    setFormErrors({});

    // Validation
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

      console.log('=== DEBUG Save Category ===');
      console.log('Request body:', requestBody);

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
      console.log('Save response:', data);

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
      console.log('=== DEBUG Delete Category ===');
      console.log('Deleting:', selectedCategory._id);

      const response = await authFetch(`${ENDPOINTS.businessCategories.base}/${selectedCategory._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Delete response:', data);

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
          // Loading skeleton
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
            <div className="grid grid-cols-7 gap-2">
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
