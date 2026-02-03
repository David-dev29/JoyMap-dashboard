import { useState, useEffect, useRef } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Upload,
  Filter,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Table, Modal, Toggle } from '../../../components/ui';
import MobileModal from '../../../components/ui/MobileModal';
import { useAuth } from '../../../context/AuthContext';
import { useBusiness } from '../../../context/BusinessContext';
import {
  getBusinessCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../../services/api';
import { authFetch, ENDPOINTS } from '../../../config/api';
import { BusinessPanelLayout } from '../../../Components/layout';
import { useIsMobile } from '../../../hooks/useIsMobile';

const availabilityOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'Disponible', label: 'Disponibles' },
  { value: 'No disponible', label: 'No disponibles' },
  { value: 'Agotado', label: 'Agotados' },
];

const availabilityConfig = {
  'Disponible': { color: 'success', label: 'Disponible' },
  'No disponible': { color: 'warning', label: 'No disponible' },
  'Agotado': { color: 'danger', label: 'Agotado' },
};

const BusinessProducts = () => {
  const isMobile = useIsMobile(768);
  const { user } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    availability: 'Disponible',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);

  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      if (!selectedBusiness) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBusinessCategories(selectedBusiness._id, 'products');
        const categoriesData = response.categories || response.data || response || [];

        setCategories(categoriesData);

        // Flatten products from all categories
        const allProducts = [];
        categoriesData.forEach(cat => {
          if (cat.products && Array.isArray(cat.products)) {
            cat.products.forEach(prod => {
              allProducts.push({
                ...prod,
                category: cat.name,
                categoryId: cat._id,
              });
            });
          }
        });
        setProducts(allProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedBusiness]);

  // Guard: No business selected - handled by BusinessPanelLayout for admins
  if (isAdmin && !selectedBusiness && !businessLoading) {
    return <BusinessPanelLayout>{null}</BusinessPanelLayout>;
  }

  // Loading state
  if (loading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando productos...</span>
        </div>
      </div>
    );
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' ||
      product.categoryId === categoryFilter;

    const matchesAvailability = availabilityFilter === 'all' ||
      product.availability === availabilityFilter;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Category options for filter
  const categoryOptions = [
    { value: 'all', label: 'Todas las categorias' },
    ...categories.map(cat => ({ value: cat._id, label: cat.name })),
  ];

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories[0]?._id || '',
      availability: 'Disponible',
    });
    setImagePreview(null);
    setImageFile(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      categoryId: product.categoryId || '',
      availability: product.availability || 'Disponible',
    });
    if (product.image) {
      setImagePreview(product.image.startsWith('http') ? product.image : `https://${product.image}`);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
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
      setImagePreview(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      setError('El precio debe ser valido');
      return;
    }
    if (!formData.categoryId) {
      setError('Selecciona una categoria');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('availability', formData.availability);
      formDataToSend.append('businessId', selectedBusiness._id);

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

      if (data.success || data.product) {
        // Reload products
        const catResponse = await getBusinessCategories(selectedBusiness._id, 'products');
        const categoriesData = catResponse.categories || catResponse.data || catResponse || [];
        setCategories(categoriesData);

        const allProducts = [];
        categoriesData.forEach(cat => {
          if (cat.products && Array.isArray(cat.products)) {
            cat.products.forEach(prod => {
              allProducts.push({
                ...prod,
                category: cat.name,
                categoryId: cat._id,
              });
            });
          }
        });
        setProducts(allProducts);

        setIsModalOpen(false);
      } else {
        throw new Error(data.message || 'Error al guardar');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (product) => {
    const newAvailability = product.availability === 'Disponible' ? 'No disponible' : 'Disponible';

    try {
      await authFetch(ENDPOINTS.products.byId(product._id), {
        method: 'PUT',
        body: JSON.stringify({ availability: newAvailability }),
      });

      setProducts(prev =>
        prev.map(p =>
          p._id === product._id ? { ...p, availability: newAvailability } : p
        )
      );
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
      await deleteProduct(productToDelete._id);
      setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Mobile product card
  const MobileProductCard = ({ product }) => {
    const isExpanded = expandedProductId === product._id;
    const availConfig = availabilityConfig[product.availability] || {};

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div
          className="p-4"
          onClick={() => setExpandedProductId(isExpanded ? null : product._id)}
        >
          <div className="flex gap-3">
            {/* Image */}
            {product.image ? (
              <img
                src={product.image.startsWith('http') ? product.image : `https://${product.image}`}
                alt={product.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Package size={24} className="text-gray-400" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {product.name}
                </h4>
                {isExpanded ? (
                  <ChevronUp size={18} className="text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                ${product.price?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" size="sm">{product.category}</Badge>
                <Badge variant={availConfig.color || 'secondary'} size="sm">
                  {availConfig.label || product.availability}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded actions */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAvailability(product);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${
                product.availability === 'Disponible'
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {product.availability === 'Disponible' ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
              {product.availability === 'Disponible' ? 'Deshabilitar' : 'Habilitar'}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(product);
              }}
              className="flex-1 py-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            >
              <Edit2 size={16} />
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                confirmDelete(product);
              }}
              className="py-2.5 px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    const mobileContent = (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-full">
        {/* Search bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filteredProducts.length} de {products.length} productos
            </p>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Todos ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat._id).length;
                return (
                  <button
                    key={cat._id}
                    onClick={() => setCategoryFilter(cat._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      categoryFilter === cat._id
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="px-4 py-4 space-y-3 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No hay productos</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <MobileProductCard key={product._id} product={product} />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          onClick={openCreateModal}
          className="fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
        >
          <Plus size={24} />
        </button>

        {/* Mobile Modal for Create/Edit */}
        <MobileModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        >
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Image */}
            <div
              onClick={() => imageInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={24} />
                  <span className="text-sm mt-1">Subir imagen</span>
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

            <Input
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Precio"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
              <Select
                label="Categoría"
                options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              />
            </div>

            <Select
              label="Disponibilidad"
              options={[
                { value: 'Disponible', label: 'Disponible' },
                { value: 'No disponible', label: 'No disponible' },
                { value: 'Agotado', label: 'Agotado' },
              ]}
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
            />

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </MobileModal>

        {/* Mobile Delete Modal */}
        <MobileModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Eliminar Producto"
        >
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={28} className="text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              ¿Eliminar <strong>{productToDelete?.name}</strong>?
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

    // Wrap with BusinessPanelLayout for admin users
    if (isAdmin) {
      return <BusinessPanelLayout>{mobileContent}</BusinessPanelLayout>;
    }
    return mobileContent;
  }

  // ========== DESKTOP LAYOUT ==========
  const desktopContent = (
    <div className="space-y-6 overflow-hidden max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Menu / Productos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona los productos de {selectedBusiness?.name}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48"
          />
          <Select
            options={availabilityOptions}
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full md:w-48"
          />
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
              <Table.Header>Disponibilidad</Table.Header>
              <Table.Header align="right">Acciones</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {filteredProducts.length === 0 ? (
              <Table.Empty
                colSpan={5}
                message={searchQuery || categoryFilter !== 'all' || availabilityFilter !== 'all'
                  ? 'No se encontraron productos con esos filtros'
                  : 'No hay productos registrados'
                }
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
                        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                          <Package size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge variant="secondary" size="sm">
                      {product.category}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell align="right">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${product.price?.toLocaleString()}
                    </span>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      onClick={() => handleToggleAvailability(product)}
                      className="flex items-center gap-2"
                    >
                      {product.availability === 'Disponible' ? (
                        <ToggleRight size={24} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={24} className="text-gray-400" />
                      )}
                      <Badge
                        variant={availabilityConfig[product.availability]?.color || 'secondary'}
                        size="sm"
                      >
                        {availabilityConfig[product.availability]?.label || product.availability}
                      </Badge>
                    </button>
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
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Imagen del Producto
            </label>
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-400 cursor-pointer overflow-hidden group"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload size={32} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Upload size={32} className="mb-2" />
                  <span className="text-sm">Subir imagen</span>
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
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
            <Select
              label="Categoria"
              options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
            />
          </div>

          <Select
            label="Disponibilidad"
            options={[
              { value: 'Disponible', label: 'Disponible' },
              { value: 'No disponible', label: 'No disponible' },
              { value: 'Agotado', label: 'Agotado' },
            ]}
            value={formData.availability}
            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
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
        <p className="text-gray-600 dark:text-gray-300">
          ¿Estas seguro de eliminar <strong>{productToDelete?.name}</strong>? Esta accion no se puede deshacer.
        </p>
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

  // Wrap with BusinessPanelLayout for admin users
  if (isAdmin) {
    return <BusinessPanelLayout>{desktopContent}</BusinessPanelLayout>;
  }
  return desktopContent;
};

export default BusinessProducts;
