import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Check,
  DollarSign,
  AlertTriangle,
  Boxes,
  ArrowRight,
} from 'lucide-react';
import { Card, Button, Input, Badge, Table, Modal, Toggle } from '../../components/ui';
import { getMyBusiness } from '../../services/api';
import { authFetch, ENDPOINTS } from '../../config/api';

const Products = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    productCategoryId: '',
    isAvailable: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Get business info first
      const businessRes = await getMyBusiness();
      const businessData = businessRes.business || businessRes.data || businessRes;
      setBusiness(businessData);

      console.log('=== DEBUG Products Page ===');
      console.log('Business:', businessData);

      // Get categories with products populated
      // Endpoint: GET /api/me/categories?populate=products
      const categoriesResponse = await authFetch(`${ENDPOINTS.me.categories}?populate=products`);
      const categoriesRes = await categoriesResponse.json();

      console.log('Categories response (raw):', categoriesRes);

      // Extract categories - response format: { success: true, categories: [...] }
      let categoriesList = [];
      if (categoriesRes.success && Array.isArray(categoriesRes.categories)) {
        categoriesList = categoriesRes.categories;
      } else if (Array.isArray(categoriesRes.categories)) {
        categoriesList = categoriesRes.categories;
      } else if (Array.isArray(categoriesRes.data)) {
        categoriesList = categoriesRes.data;
      } else if (Array.isArray(categoriesRes)) {
        categoriesList = categoriesRes;
      }

      console.log('Categories extracted:', categoriesList);
      console.log('Number of categories:', categoriesList.length);

      setCategories(categoriesList);

      // Extract products from categories
      // Each category has: _id, name, businessId, products[]
      let productsList = [];
      categoriesList.forEach(category => {
        console.log(`Category "${category.name}":`, category);

        if (category.products && Array.isArray(category.products)) {
          console.log(`  - Products in category:`, category.products.length);

          category.products.forEach(product => {
            productsList.push({
              ...product,
              category: { _id: category._id, name: category.name },
              productCategoryId: category._id,
            });
          });
        }
      });

      console.log('Total products extracted:', productsList.length);
      console.log('Products list:', productsList);

      setProducts(productsList);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' ||
      product.productCategoryId === categoryFilter ||
      product.category?._id === categoryFilter;

    const matchesAvailability = availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && product.isAvailable !== false) ||
      (availabilityFilter === 'unavailable' && product.isAvailable === false);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const openCreateModal = () => {
    if (categories.length === 0) {
      setModalError('Primero debes crear una categoria');
      return;
    }
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      productCategoryId: categories[0]?._id || '',
      isAvailable: true,
    });
    setImagePreview(null);
    setImageFile(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      productCategoryId: product.productCategoryId || product.category?._id || '',
      isAvailable: product.isAvailable !== false,
    });
    if (product.image) {
      setImagePreview(product.image.startsWith('http') ? product.image : `https://${product.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
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
      setImagePreview(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setModalError('El nombre es requerido');
      return;
    }
    if (!formData.productCategoryId) {
      setModalError('Selecciona una categoria');
      return;
    }
    if (!business?._id) {
      setModalError('No se encontro el negocio');
      return;
    }

    try {
      setSaving(true);
      setModalError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('productCategoryId', formData.productCategoryId);
      formDataToSend.append('businessId', business._id);
      formDataToSend.append('isAvailable', formData.isAvailable);

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      console.log('=== Creating/Updating Product ===');
      console.log('productCategoryId:', formData.productCategoryId);
      console.log('businessId:', business._id);

      let response;
      if (editingProduct) {
        response = await authFetch(ENDPOINTS.products.byId(editingProduct._id), {
          method: 'PUT',
          body: formDataToSend,
        });
      } else {
        response = await authFetch(ENDPOINTS.products.create, {
          method: 'POST',
          body: formDataToSend,
        });
      }

      const data = await response.json();
      console.log('Save response:', data);

      if (data.success !== false || data.product) {
        // Reload all data
        await loadData();
        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setModalError(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const newAvailability = product.isAvailable === false ? true : false;

      await authFetch(ENDPOINTS.products.byId(product._id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newAvailability }),
      });

      setProducts(prev => prev.map(p =>
        p._id === product._id ? { ...p, isAvailable: newAvailability } : p
      ));
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await authFetch(ENDPOINTS.products.byId(productToDelete._id), {
        method: 'DELETE',
      });
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name;
    const cat = categories.find(c => c._id === product.productCategoryId);
    return cat?.name || '-';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando productos...</span>
        </div>
      </div>
    );
  }

  // No categories - show message to create categories first
  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona el catalogo de productos de tu negocio
          </p>
        </div>

        {/* No categories message */}
        <Card className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Boxes size={32} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No tienes categorias
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Crea tu primera categoria para organizar tus productos. Las categorias te ayudan a mantener tu menu ordenado.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/products/categories')}
              rightIcon={<ArrowRight size={18} />}
            >
              Crear Categoria
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona el catalogo de productos de tu negocio
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={openCreateModal}
        >
          Nuevo Producto
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar productos..."
              leftIcon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todas las categorias</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Todos</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">No disponibles</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <Table.Head>
              <Table.Row hover={false}>
                <Table.Header>Producto</Table.Header>
                <Table.Header>Categoria</Table.Header>
                <Table.Header align="right">Precio</Table.Header>
                <Table.Header align="center">Disponible</Table.Header>
                <Table.Header align="right">Acciones</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {filteredProducts.length === 0 ? (
                <Table.Empty
                  colSpan={5}
                  message={searchTerm || categoryFilter !== 'all' || availabilityFilter !== 'all'
                    ? "No hay productos que coincidan con los filtros"
                    : "No hay productos registrados. Crea tu primer producto."}
                />
              ) : (
                filteredProducts.map((product) => (
                  <Table.Row key={product._id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img
                            src={product.image.startsWith('http') ? product.image : `https://${product.image}`}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {product.description || '-'}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="secondary" size="sm">
                        {getCategoryName(product)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${product.price?.toLocaleString() || 0}
                      </span>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Toggle
                        checked={product.isAvailable !== false}
                        onChange={() => toggleAvailability(product)}
                        size="sm"
                      />
                    </Table.Cell>
                    <Table.Cell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(product)}
                          className="p-2"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => confirmDelete(product)}
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
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>{filteredProducts.length} productos mostrados</span>
        <span>
          {products.filter(p => p.isAvailable !== false).length} disponibles / {products.filter(p => p.isAvailable === false).length} no disponibles
        </span>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="md"
      >
        <div className="space-y-4">
          {modalError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {modalError}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen del Producto
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative w-32 h-32 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 cursor-pointer overflow-hidden group"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
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
                  <span className="text-xs">Subir imagen</span>
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
            label="Nombre del Producto"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ej: Taco al Pastor"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Descripcion
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripcion del producto..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              leftIcon={<DollarSign size={18} />}
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              min={0}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Categoria
              </label>
              <select
                value={formData.productCategoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, productCategoryId: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar...</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Disponible</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">El producto aparecera en el menu</p>
            </div>
            <Toggle
              checked={formData.isAvailable}
              onChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
            />
          </div>
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
            {saving ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Eliminar Producto"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg">
            <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Esta accion no se puede deshacer</p>
              <p>El producto sera eliminado permanentemente.</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            ¿Estas seguro de eliminar <strong>{productToDelete?.name}</strong>?
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

export default Products;
