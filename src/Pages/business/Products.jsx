import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePhotograph,
  HiOutlineCheck,
  HiOutlineExclamation,
  HiOutlineCollection,
  HiOutlineRefresh,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import { Package, Edit2, Trash2, Upload, Check, DollarSign, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Card, Button, Input, Badge, Table, Modal, Toggle } from '../../components/ui';
import { getMyBusiness } from '../../services/api';
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

// Mobile Product Card Component
const ProductCard = ({ product, onEdit, onToggleAvailability, onDelete, getCategoryName }) => {
  const imageUrl = product.image
    ? (product.image.startsWith('http') ? product.image : `https://${product.image}`)
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiOutlinePhotograph className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onToggleAvailability(product)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              product.isAvailable !== false
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }`}
          >
            {product.isAvailable !== false ? 'Activo' : 'Inactivo'}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {getCategoryName(product)}
            </p>
          </div>
          <p className="text-sm font-semibold text-primary-600">
            ${product.price?.toLocaleString() || 0}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <HiOutlinePencil className="w-4 h-4" />
            Editar
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

      // Get categories with products populated
      const categoriesResponse = await authFetch(`${ENDPOINTS.me.categories}?populate=products`);
      const categoriesRes = await categoriesResponse.json();

      // Extract categories
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

      setCategories(categoriesList);

      // Extract products from categories
      let productsList = [];
      categoriesList.forEach(category => {
        if (category.products && Array.isArray(category.products)) {
          category.products.forEach(product => {
            productsList.push({
              ...product,
              category: { _id: category._id, name: category.name },
              productCategoryId: category._id,
            });
          });
        }
      });

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

  // Get counts per category
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return products.length;
    return products.filter(p => p.productCategoryId === categoryId || p.category?._id === categoryId).length;
  };

  const openCreateModal = () => {
    if (categories.length === 0) {
      toast.error('Primero debes crear una categoria');
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

      if (data.success !== false || data.product) {
        await loadData();
        setIsModalOpen(false);
        toast.success(editingProduct ? 'Producto actualizado' : 'Producto creado');
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setModalError(err.message || 'Error al guardar el producto');
      toast.error(err.message || 'Error al guardar el producto');
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
      toast.success(newAvailability ? 'Producto disponible' : 'Producto no disponible');
    } catch (err) {
      console.error('Error toggling availability:', err);
      toast.error('Error al cambiar disponibilidad');
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
      toast.success('Producto eliminado');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Error al eliminar producto');
    }
  };

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name;
    const cat = categories.find(c => c._id === product.productCategoryId);
    return cat?.name || '-';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 dark:text-gray-400">Cargando productos...</span>
        </div>
      </div>
    );
  }

  // No categories - show message
  if (categories.length === 0) {
    return (
      <div className={isMobile ? 'p-4' : 'space-y-6'}>
        {!isMobile && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Productos
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestiona el catalogo de productos de tu negocio
            </p>
          </div>
        )}

        <div className={`${isMobile ? 'bg-white dark:bg-gray-900 rounded-2xl shadow-card' : ''} text-center py-12 px-4`}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <HiOutlineCollection className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No tienes categorias
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-sm">
                Crea tu primera categoria para organizar tus productos.
              </p>
            </div>
            <button
              onClick={() => navigate('/products/categories')}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              Crear Categoria
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24">
        {/* Sticky Search Bar */}
        <div className="sticky top-0 z-30 bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadData}
              className="p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="sticky top-[65px] z-20 bg-gray-50 dark:bg-gray-950">
          <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
              }`}
            >
              Todos ({getCategoryCount('all')})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setCategoryFilter(cat._id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoryFilter === cat._id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                }`}
              >
                {cat.name} ({getCategoryCount(cat._id)})
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="px-4 py-4">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 text-center">
              <HiOutlinePhotograph className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No hay productos que coincidan'
                  : 'No hay productos registrados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onEdit={openEditModal}
                  onToggleAvailability={toggleAvailability}
                  onDelete={confirmDelete}
                  getCategoryName={getCategoryName}
                />
              ))}
            </div>
          )}
        </div>

        {/* Products Summary */}
        <div className="px-4 py-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredProducts.length} productos | {products.filter(p => p.isAvailable !== false).length} disponibles
          </p>
        </div>

        {/* FAB - Floating Action Button */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-95 transition-all z-40"
        >
          <HiOutlinePlus className="w-7 h-7" />
        </button>

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
                className="relative w-32 h-32 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 cursor-pointer overflow-hidden group"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 resize-none"
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
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              {saving ? 'Guardando...' : editingProduct ? 'Guardar' : 'Crear'}
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
              <HiOutlineExclamation className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
  }

  // Desktop Layout
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
          leftIcon={<Package size={18} />}
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
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Todas las categorias</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
                          <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Package size={20} className="text-primary-600 dark:text-primary-400" />
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
              className="relative w-32 h-32 mx-auto rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-400 cursor-pointer overflow-hidden group"
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
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 resize-none"
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
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
