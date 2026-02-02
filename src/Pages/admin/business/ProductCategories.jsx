import { useState, useEffect, useRef } from 'react';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Check,
  Package,
  GripVertical,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button, Input, Badge, Table, Modal } from '../../../components/ui';
import MobileModal from '../../../components/ui/MobileModal';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import {
  getBusinessCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../services/api';
import { authFetch, ENDPOINTS } from '../../../config/api';
import NoBusinessSelected from '../../../Components/Dashboard/NoBusinessSelected';
import { useIsMobile } from '../../../hooks/useIsMobile';

const ProductCategories = () => {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const imageInputRef = useRef(null);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      if (!selectedBusiness) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        console.log('=== DEBUG ProductCategories ===');
        console.log('Selected Business:', selectedBusiness._id, selectedBusiness.name);

        const response = await getBusinessCategories(selectedBusiness._id, 'products');
        console.log('API Response:', response);

        // Handle different response formats
        let categoriesData = [];
        if (response.categories) {
          categoriesData = response.categories;
        } else if (response.data) {
          categoriesData = response.data;
        } else if (Array.isArray(response)) {
          categoriesData = response;
        }

        console.log('Categories extracted:', categoriesData);
        console.log('Is Array:', Array.isArray(categoriesData));

        // Ensure it's an array before sorting
        if (Array.isArray(categoriesData)) {
          categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setCategories(categoriesData);
        } else {
          console.warn('categoriesData is not an array:', categoriesData);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Error al cargar las categorias');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [selectedBusiness]);

  // Guard: No business selected
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return (
      <NoBusinessSelected
        icon={Boxes}
        title="Selecciona un negocio"
        message="Para gestionar las categorias de productos, primero selecciona un negocio desde el selector en la barra superior."
      />
    );
  }

  // Loading state
  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando categorias...</span>
        </div>
      </div>
    );
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      order: categories.length,
    });
    setIconPreview(null);
    setIconFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      order: category.order || 0,
    });
    if (category.iconUrl) {
      setIconPreview(category.iconUrl.startsWith('http') ? category.iconUrl : `https://${category.iconUrl}`);
    } else {
      setIconPreview(null);
    }
    setIconFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen no puede superar los 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIconPreview(reader.result);
      setIconFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('businessId', selectedBusiness._id);

      if (iconFile) {
        formDataToSend.append('icon', iconFile);
      }

      let response;
      if (editingCategory) {
        response = await authFetch(ENDPOINTS.categories.byId(editingCategory._id), {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        response = await authFetch(ENDPOINTS.categories.create, {
          method: 'POST',
          body: formDataToSend,
        });
      }

      const data = await response.json();

      if (data.success !== false || data.category) {
        // Reload categories
        const catResponse = await getBusinessCategories(selectedBusiness._id, 'products');
        let categoriesData = [];
        if (catResponse.categories) {
          categoriesData = catResponse.categories;
        } else if (catResponse.data) {
          categoriesData = catResponse.data;
        } else if (Array.isArray(catResponse)) {
          categoriesData = catResponse;
        }
        if (Array.isArray(categoriesData)) {
          categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
          setCategories(categoriesData);
        }
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err.message || 'Error al guardar la categoria');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id);
      setCategories(prev => prev.filter(c => c._id !== categoryToDelete._id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const getProductCount = (category) => {
    if (!category) return 0;
    return category.products?.length || 0;
  };

  // Mobile category card
  const MobileCategoryCard = ({ category, index }) => {
    const isExpanded = expandedCategoryId === category._id;
    const productCount = getProductCount(category);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div
          className="p-4"
          onClick={() => setExpandedCategoryId(isExpanded ? null : category._id)}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            {category.iconUrl ? (
              <img
                src={category.iconUrl.startsWith('http') ? category.iconUrl : `https://${category.iconUrl}`}
                alt={category.name}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Boxes size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {category.name}
                </h4>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={productCount > 0 ? 'primary' : 'secondary'} size="sm">
                  <Package size={12} className="mr-1" />
                  {productCount} productos
                </Badge>
              </div>
            </div>

            {isExpanded ? (
              <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
            )}
          </div>

          {category.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-1">
              {category.description}
            </p>
          )}
        </div>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(category);
              }}
              className="flex-1 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Edit2 size={16} />
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(category);
              }}
              className="flex-1 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
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
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Categorías</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {categories.length} categorías
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="px-4 pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categories.reduce((sum, c) => sum + getProductCount(c), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Boxes size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No hay categorías</p>
            </div>
          ) : (
            categories.map((category, index) => (
              <MobileCategoryCard key={category._id} category={category} index={index} />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        >
          <Plus size={24} />
        </button>

        {/* Mobile Modal for Create/Edit */}
        <MobileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Icon */}
            <div
              onClick={() => imageInputRef.current?.click()}
              className="w-20 h-20 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
            >
              {iconPreview ? (
                <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={20} />
                  <span className="text-xs mt-1">Ícono</span>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Tacos"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm"
              />
            </div>

            <Input
              label="Orden"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            />

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
            </button>
          </div>
        </MobileModal>

        {/* Mobile Delete Modal */}
        <MobileModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar Categoría"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600 dark:text-red-400" />
            </div>

            {getProductCount(categoryToDelete) > 0 && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm text-left">
                <AlertTriangle size={16} className="inline mr-2" />
                Esta categoría tiene {getProductCount(categoryToDelete)} productos
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-300">
              ¿Eliminar <strong>{categoryToDelete?.name}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </MobileModal>
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
            Categorias de Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organiza los productos de {selectedBusiness?.name} en categorias
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={openCreateModal}
        >
          Nueva Categoria
        </Button>
      </div>

      {/* Categories Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
        <Table>
          <Table.Head>
            <Table.Row hover={false}>
              <Table.Header className="w-12">Orden</Table.Header>
              <Table.Header>Categoria</Table.Header>
              <Table.Header>Descripcion</Table.Header>
              <Table.Header align="center">Productos</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {categories.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message="No hay categorias registradas"
              />
            ) : (
              categories.map((category, index) => (
                <Table.Row key={category._id}>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <GripVertical size={16} className="text-gray-400 cursor-grab" />
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {index + 1}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      {category.iconUrl ? (
                        <img
                          src={category.iconUrl.startsWith('http') ? category.iconUrl : `https://${category.iconUrl}`}
                          alt={category.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <Boxes size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <span className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[200px] block">
                      {category.description || '-'}
                    </span>
                  </Table.Cell>
                  <Table.Cell align="center">
                    <Badge variant={getProductCount(category) > 0 ? 'primary' : 'secondary'} size="sm">
                      <Package size={14} className="mr-1" />
                      {getProductCount(category)}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(category)}
                        className="p-2"
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(category)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
        </div>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {categories.length} categorias en total
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
        size="md"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icono de la Categoria
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative w-24 h-24 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 cursor-pointer overflow-hidden group"
            >
              {iconPreview ? (
                <>
                  <img
                    src={iconPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={24} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={24} className="mb-1" />
                  <span className="text-xs">80x80px</span>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>

          <Input
            label="Nombre de la Categoria"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Tacos, Bebidas, Postres"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripcion de la categoria..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <Input
            label="Orden / Posicion"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
            min={0}
            helperText="Las categorias se ordenan de menor a mayor"
          />
        </div>

        <Modal.Footer>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
            leftIcon={saving ? null : <Check size={18} />}
          >
            {saving ? 'Guardando...' : editingCategory ? 'Guardar Cambios' : 'Crear Categoria'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Categoria"
        size="sm"
      >
        <div className="space-y-4">
          {getProductCount(categoryToDelete) > 0 && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Esta categoria tiene {getProductCount(categoryToDelete)} productos</p>
                <p>Los productos quedaran sin categoria asignada.</p>
              </div>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-300">
            ¿Estas seguro de eliminar la categoria <strong>{categoryToDelete?.name}</strong>?
          </p>
        </div>
        <Modal.Footer>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            leftIcon={<Trash2 size={18} />}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductCategories;
