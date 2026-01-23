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
import { Card, Button, Input, Badge, Table, Modal } from '../../../components/ui';
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

const ProductCategories = () => {
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

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
        const response = await getBusinessCategories(selectedBusiness._id, 'products');
        const categoriesData = response.categories || response.data || response || [];

        // Sort by order
        categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Error al cargar las categorias');
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

      if (data.success || data.category) {
        // Reload categories
        const catResponse = await getBusinessCategories(selectedBusiness._id, 'products');
        const categoriesData = catResponse.categories || catResponse.data || catResponse || [];
        categoriesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        setCategories(categoriesData);
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
    return category.products?.length || 0;
  };

  return (
    <div className="space-y-6">
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
      <Card padding="none">
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
                        leftIcon={<Edit2 size={16} />}
                        onClick={() => openEditModal(category)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 size={16} />}
                        onClick={() => confirmDelete(category)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
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
