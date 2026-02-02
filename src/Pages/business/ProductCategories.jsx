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
} from 'lucide-react';
import {
  HiOutlineViewGrid,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiMenuAlt4,
} from 'react-icons/hi';
import { Card, Button, Input, Badge, Table, Modal, MobileModal } from '../../components/ui';
import { getMyCategories, getMyBusiness } from '../../services/api';
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

const ProductCategories = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

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

  // Load data - Uses GET /api/me/categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('=== DEBUG ProductCategories: Loading data ===');

        const [categoriesRes, businessRes] = await Promise.all([
          getMyCategories(),
          getMyBusiness(),
        ]);

        console.log('Categories response:', categoriesRes);
        console.log('Business response:', businessRes);

        // Handle response format: { success: true, categories: [...] }
        let categoriesList = [];
        if (categoriesRes.success && Array.isArray(categoriesRes.categories)) {
          categoriesList = categoriesRes.categories;
        } else if (Array.isArray(categoriesRes.response)) {
          categoriesList = categoriesRes.response;
        } else if (Array.isArray(categoriesRes.data)) {
          categoriesList = categoriesRes.data;
        } else if (Array.isArray(categoriesRes)) {
          categoriesList = categoriesRes;
        }

        console.log('Parsed categories:', categoriesList);

        categoriesList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(categoriesList);

        const businessData = businessRes.business || businessRes.data || businessRes;
        setBusiness(businessData);

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error al cargar las categorias');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      order: categories.length,
    });
    setIconPreview(null);
    setIconFile(null);
    setModalError('');
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
    setModalError('');
    setIsModalOpen(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setModalError('La imagen no puede superar los 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIconPreview(reader.result);
      setIconFile(file);
    };
    reader.readAsDataURL(file);
  };

  // Uses POST /api/product-categories/create or PUT /api/product-categories/:id
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setModalError('El nombre es requerido');
      return;
    }

    if (!business?._id) {
      setModalError('No se encontro el negocio');
      return;
    }

    try {
      setSaving(true);
      setModalError('');

      // Build JSON body (not FormData - backend expects JSON)
      const body = {
        name: formData.name.trim(),
        description: formData.description || '',
        order: formData.order || 0,
        businessId: business._id,
      };

      // If there's an icon file, convert to base64
      if (iconFile) {
        body.icon = iconPreview; // iconPreview is already base64 from FileReader
      }

      console.log('=== DEBUG ProductCategories: Saving ===');
      console.log('formData:', formData);
      console.log('Request body:', JSON.stringify(body));
      console.log('Editing:', editingCategory ? editingCategory._id : 'new');

      let response;
      if (editingCategory) {
        // PUT /api/product-categories/:id
        const url = ENDPOINTS.productCategories.byId(editingCategory._id);
        console.log('PUT URL:', url);
        response = await authFetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        // POST /api/product-categories/create
        const url = ENDPOINTS.productCategories.create;
        console.log('POST URL:', url);
        response = await authFetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      const data = await response.json();
      console.log('Save response:', data);

      if (data.success !== false || data.category) {
        // Reload categories using GET /api/me/categories
        const catRes = await getMyCategories();
        let categoriesList = [];
        if (catRes.success && Array.isArray(catRes.categories)) {
          categoriesList = catRes.categories;
        } else if (Array.isArray(catRes.response)) {
          categoriesList = catRes.response;
        } else if (Array.isArray(catRes.data)) {
          categoriesList = catRes.data;
        } else if (Array.isArray(catRes)) {
          categoriesList = catRes;
        }
        categoriesList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(categoriesList);
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setModalError(err.message || 'Error al guardar la categoria');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Uses DELETE /api/product-categories/:id
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const url = ENDPOINTS.productCategories.byId(categoryToDelete._id);
      console.log('=== DEBUG ProductCategories: Deleting ===');
      console.log('DELETE URL:', url);

      const response = await authFetch(url, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log('Delete response:', data);

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

  // Mobile drag handlers for reordering
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newCategories = [...categories];
    const [draggedCategory] = newCategories.splice(draggedItem, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);

    // Update order values
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      order: idx,
    }));

    setCategories(updatedCategories);
    setDraggedItem(null);

    // Optionally save order to backend
    try {
      for (const cat of updatedCategories) {
        await authFetch(ENDPOINTS.productCategories.byId(cat._id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: cat.order }),
        });
      }
    } catch (err) {
      console.error('Error saving order:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando categorias...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    const MobileCategoryCard = ({ category, index }) => (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-4 flex items-center gap-3 touch-manipulation"
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
          <HiMenuAlt4 className="w-5 h-5 text-gray-400" />
        </div>

        {/* Icon */}
        {category.iconUrl ? (
          <img
            src={category.iconUrl.startsWith('http') ? category.iconUrl : `https://${category.iconUrl}`}
            alt={category.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <HiOutlineViewGrid className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {category.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getProductCount(category)} productos
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => openEditModal(category)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <HiOutlinePencil className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => confirmDelete(category)}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Categorias</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Arrastra para reordenar
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 pb-24">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <HiOutlineViewGrid className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                No hay categorias
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Crea tu primera categoria con el boton +
              </p>
            </div>
          ) : (
            categories.map((category, index) => (
              <MobileCategoryCard key={category._id} category={category} index={index} />
            ))
          )}
        </div>

        {/* Stats */}
        {categories.length > 0 && (
          <div className="fixed bottom-20 left-4 right-20 bg-white dark:bg-gray-900 rounded-xl shadow-card px-4 py-2 z-10">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {categories.length} categorias | {categories.reduce((sum, c) => sum + getProductCount(c), 0)} productos
            </p>
          </div>
        )}

        {/* FAB */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center z-20 active:scale-95 transition-transform"
        >
          <HiOutlinePlus className="w-7 h-7" />
        </button>

        {/* Mobile Create/Edit Modal */}
        <MobileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? 'Editar Categoria' : 'Nueva Categoria'}
          size="lg"
        >
          <div className="space-y-4">
            {modalError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                {modalError}
              </div>
            )}

            {/* Icon */}
            <div className="flex justify-center">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="relative w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer overflow-hidden group"
              >
                {iconPreview ? (
                  <>
                    <img src={iconPreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
                      <HiOutlinePhotograph className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <HiOutlinePhotograph className="w-8 h-8 mb-1" />
                    <span className="text-xs">Icono</span>
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
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editingCategory ? 'Guardar' : 'Crear'}
            </Button>
          </MobileModal.Footer>
        </MobileModal>

        {/* Mobile Delete Modal */}
        <MobileModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar Categoria"
          size="sm"
        >
          <div className="space-y-3">
            {categoryToDelete && getProductCount(categoryToDelete) > 0 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl text-sm">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Tiene {getProductCount(categoryToDelete)} productos</p>
                  <p>Quedaran sin categoria asignada.</p>
                </div>
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-300">
              ¿Eliminar <strong className="text-gray-900 dark:text-white">{categoryToDelete?.name}</strong>?
            </p>
          </div>
          <MobileModal.Footer>
            <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
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
            Categorias de Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organiza los productos de tu negocio en categorias
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
          {modalError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {modalError}
            </div>
          )}

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icono de la Categoria
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative w-24 h-24 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 cursor-pointer overflow-hidden group"
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
          {categoryToDelete && getProductCount(categoryToDelete) > 0 && (
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
