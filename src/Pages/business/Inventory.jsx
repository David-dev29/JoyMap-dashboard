import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineCube,
} from 'react-icons/hi';
import { Card, Button, Input, Badge, Toggle } from '../../components/ui';
import { getMyProducts, getMyCategories } from '../../services/api';
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

const Inventory = () => {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productsRes, categoriesRes] = await Promise.all([
        getMyProducts(),
        getMyCategories('products'),
      ]);

      console.log('=== DEBUG Inventory ===');
      console.log('Products:', productsRes);

      // Extract products
      let productsList = [];
      const productsData = productsRes.products || productsRes.data || productsRes || [];

      if (Array.isArray(productsData)) {
        productsData.forEach(item => {
          if (item.products && Array.isArray(item.products)) {
            productsList = [...productsList, ...item.products.map(p => ({
              ...p,
              category: { _id: item._id, name: item.name }
            }))];
          } else {
            productsList.push(item);
          }
        });
      }

      setProducts(productsList);

      // Extract categories
      const categoriesList = categoriesRes.response || categoriesRes.categories || categoriesRes.data || [];
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvailability = availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && product.isAvailable !== false) ||
      (availabilityFilter === 'unavailable' && product.isAvailable === false);

    const matchesCategory = categoryFilter === 'all' ||
      product.categoryId === categoryFilter ||
      product.category?._id === categoryFilter;

    return matchesSearch && matchesAvailability && matchesCategory;
  });

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

  const setAllAvailable = async (available) => {
    try {
      const productsToUpdate = filteredProducts.filter(p =>
        available ? p.isAvailable === false : p.isAvailable !== false
      );

      await Promise.all(
        productsToUpdate.map(p =>
          authFetch(ENDPOINTS.products.byId(p._id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isAvailable: available }),
          })
        )
      );

      setProducts(prev => prev.map(p => {
        if (productsToUpdate.some(pt => pt._id === p._id)) {
          return { ...p, isAvailable: available };
        }
        return p;
      }));
    } catch (err) {
      console.error('Error updating products:', err);
    }
  };

  const getCategoryName = (product) => {
    if (product.category?.name) return product.category.name;
    const cat = categories.find(c => c._id === product.categoryId);
    return cat?.name || '-';
  };

  const availableCount = products.filter(p => p.isAvailable !== false).length;
  const unavailableCount = products.filter(p => p.isAvailable === false).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400">Cargando inventario...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // MOBILE VIEW
  // ============================================
  if (isMobile) {
    const MobileProductCard = ({ product }) => (
      <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-card overflow-hidden ${product.isAvailable === false ? 'opacity-75' : ''}`}>
        <div className="flex items-center gap-3 p-3">
          {/* Image */}
          {product.image ? (
            <img
              src={product.image.startsWith('http') ? product.image : `https://${product.image}`}
              alt={product.name}
              className={`w-16 h-16 rounded-xl object-cover flex-shrink-0 ${product.isAvailable === false ? 'grayscale' : ''}`}
            />
          ) : (
            <div className={`w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 ${product.isAvailable === false ? 'opacity-50' : ''}`}>
              <HiOutlineCube className="w-7 h-7 text-primary-500" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getCategoryName(product)}
            </p>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
              ${product.price?.toLocaleString() || 0}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <Toggle
              checked={product.isAvailable !== false}
              onChange={() => toggleAvailability(product)}
            />
            <span className={`text-xs ${product.isAvailable !== false ? 'text-emerald-600' : 'text-red-500'}`}>
              {product.isAvailable !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventario</h1>
            <button
              onClick={loadData}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <HiOutlineRefresh className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide px-4 pb-3 gap-2">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                availabilityFilter === 'all'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <span>Todos</span>
              <span className="px-1.5 py-0.5 bg-primary-200 dark:bg-primary-800 rounded-full text-xs">
                {products.length}
              </span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <HiOutlineCheck className="w-4 h-4" />
              <span>Disponibles</span>
              <span className="px-1.5 py-0.5 bg-emerald-200 dark:bg-emerald-800 rounded-full text-xs">
                {availableCount}
              </span>
            </button>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                availabilityFilter === 'unavailable'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              <HiOutlineX className="w-4 h-4" />
              <span>No disponibles</span>
              <span className="px-1.5 py-0.5 bg-red-200 dark:bg-red-800 rounded-full text-xs">
                {unavailableCount}
              </span>
            </button>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="px-4 pb-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todas las categorias</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Alert for unavailable products */}
        {unavailableCount > 0 && availabilityFilter !== 'unavailable' && (
          <div className="mx-4 mt-3 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 flex-1">
              {unavailableCount} producto{unavailableCount > 1 ? 's' : ''} no disponible{unavailableCount > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setAvailabilityFilter('unavailable')}
              className="text-sm font-medium text-amber-700 dark:text-amber-300"
            >
              Ver
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3 pb-20">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <HiOutlineCube className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm ? 'No se encontraron productos' : 'No hay productos'}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <MobileProductCard key={product._id} product={product} />
            ))
          )}
        </div>

        {/* Bottom Stats Bar */}
        {filteredProducts.length > 0 && (
          <div className="fixed bottom-16 left-4 right-4 bg-white dark:bg-gray-900 rounded-xl shadow-lg px-4 py-3 z-10">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {filteredProducts.length} de {products.length} productos
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAllAvailable(true)}
                  className="flex items-center gap-1 text-emerald-600 font-medium"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  Activar todos
                </button>
              </div>
            </div>
          </div>
        )}
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
            Inventario
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestiona la disponibilidad de tus productos
          </p>
        </div>
        <Button
          variant="ghost"
          leftIcon={<RefreshCw size={18} />}
          onClick={loadData}
        >
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              <p className="text-sm text-gray-500">Total productos</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">{availableCount}</p>
              <p className="text-sm text-gray-500">Disponibles</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">{unavailableCount}</p>
              <p className="text-sm text-gray-500">No disponibles</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Alert for unavailable products */}
      {unavailableCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Tienes {unavailableCount} producto{unavailableCount > 1 ? 's' : ''} marcado{unavailableCount > 1 ? 's' : ''} como no disponible
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              Estos productos no apareceran en el menu para los clientes
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAvailabilityFilter('unavailable')}
          >
            Ver productos
          </Button>
        </div>
      )}

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

        {/* Bulk actions */}
        {filteredProducts.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">Acciones rapidas:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAllAvailable(true)}
              leftIcon={<CheckCircle size={16} />}
            >
              Marcar todos disponibles
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAllAvailable(false)}
              leftIcon={<XCircle size={16} />}
            >
              Marcar todos no disponibles
            </Button>
          </div>
        )}
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || availabilityFilter !== 'all' || categoryFilter !== 'all'
                  ? "No hay productos que coincidan con los filtros"
                  : "No hay productos registrados"}
              </p>
            </Card>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product._id} className="!p-0 overflow-hidden">
              <div className="relative">
                {product.image ? (
                  <img
                    src={product.image.startsWith('http') ? product.image : `https://${product.image}`}
                    alt={product.name}
                    className={`w-full h-32 object-cover ${product.isAvailable === false ? 'opacity-50 grayscale' : ''}`}
                  />
                ) : (
                  <div className={`w-full h-32 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center ${product.isAvailable === false ? 'opacity-50' : ''}`}>
                    <Package size={32} className="text-indigo-400" />
                  </div>
                )}
                {product.isAvailable === false && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Badge variant="danger" size="lg">No disponible</Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getCategoryName(product)}
                    </p>
                  </div>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                    ${product.price?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {product.isAvailable !== false ? 'Disponible' : 'No disponible'}
                  </span>
                  <Toggle
                    checked={product.isAvailable !== false}
                    onChange={() => toggleAvailability(product)}
                  />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredProducts.length} de {products.length} productos
      </div>
    </div>
  );
};

export default Inventory;
