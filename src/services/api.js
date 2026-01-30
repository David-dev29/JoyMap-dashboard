import { authFetch, ENDPOINTS } from '../config/api';

// Perfil del usuario
export const getMyProfile = async () => {
  const res = await authFetch(ENDPOINTS.me.profile);
  return res.json();
};

// Negocio del usuario (business_owner)
export const getMyBusiness = async () => {
  const res = await authFetch(ENDPOINTS.me.business);
  return res.json();
};

// Productos del negocio del usuario
export const getMyProducts = async () => {
  const res = await authFetch(ENDPOINTS.me.products);
  return res.json();
};

// Categorias del negocio del usuario
export const getMyCategories = async (populate = '') => {
  const url = populate
    ? `${ENDPOINTS.me.categories}?populate=${populate}`
    : ENDPOINTS.me.categories;
  const res = await authFetch(url);
  return res.json();
};

// Ordenes (filtradas por rol en backend)
export const getMyOrders = async () => {
  const res = await authFetch(ENDPOINTS.me.orders);
  return res.json();
};

// Estadisticas de ordenes
export const getMyOrdersStats = async () => {
  const res = await authFetch(ENDPOINTS.me.ordersStats);
  return res.json();
};

// Todos los productos (solo admin)
export const getAllProducts = async () => {
  const res = await authFetch(ENDPOINTS.products.base);
  return res.json();
};

// Todas las categorias (solo admin)
export const getAllCategories = async (populate = '') => {
  const url = populate
    ? `${ENDPOINTS.categories.base}?populate=${populate}`
    : ENDPOINTS.categories.base;
  const res = await authFetch(url);
  return res.json();
};

// ============================================
// Funciones por negocio especifico (Admin)
// ============================================

// Categorias de un negocio especifico
export const getBusinessCategories = async (businessId, populate = '') => {
  const url = populate
    ? `${ENDPOINTS.businesses.categories(businessId)}?populate=${populate}`
    : ENDPOINTS.businesses.categories(businessId);
  const res = await authFetch(url);
  return res.json();
};

// Productos de un negocio especifico
export const getBusinessProducts = async (businessId) => {
  const res = await authFetch(ENDPOINTS.businesses.products(businessId));
  return res.json();
};

// Ordenes de un negocio especifico
export const getBusinessOrders = async (businessId) => {
  const res = await authFetch(ENDPOINTS.businesses.orders(businessId));
  return res.json();
};

// Estadisticas de un negocio especifico
export const getBusinessStats = async (businessId) => {
  const res = await authFetch(ENDPOINTS.businesses.stats(businessId));
  return res.json();
};

// ============================================
// CRUD de productos
// ============================================

// Crear producto
export const createProduct = async (productData) => {
  const res = await authFetch(ENDPOINTS.products.create, {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return res.json();
};

// Actualizar producto
export const updateProduct = async (productId, productData) => {
  const res = await authFetch(ENDPOINTS.products.byId(productId), {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  return res.json();
};

// Eliminar producto
export const deleteProduct = async (productId) => {
  const res = await authFetch(ENDPOINTS.products.byId(productId), {
    method: 'DELETE',
  });
  return res.json();
};

// ============================================
// CRUD de categorias
// ============================================

// Crear categoria
export const createCategory = async (categoryData) => {
  const res = await authFetch(ENDPOINTS.categories.create, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return res.json();
};

// Actualizar categoria
export const updateCategory = async (categoryId, categoryData) => {
  const res = await authFetch(ENDPOINTS.categories.byId(categoryId), {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
  return res.json();
};

// Eliminar categoria
export const deleteCategory = async (categoryId) => {
  const res = await authFetch(ENDPOINTS.categories.byId(categoryId), {
    method: 'DELETE',
  });
  return res.json();
};

// ============================================
// Gestion de negocios (Admin)
// ============================================

// Obtener negocio por ID
export const getBusinessById = async (businessId) => {
  const res = await authFetch(ENDPOINTS.businesses.byId(businessId));
  return res.json();
};

// Actualizar perfil de negocio (soporta FormData para imagenes)
export const updateBusiness = async (businessId, formData) => {
  const res = await authFetch(ENDPOINTS.businesses.byId(businessId), {
    method: 'PUT',
    body: formData,
  });
  return res.json();
};

// ============================================
// Gestion de ordenes
// ============================================

// Actualizar estado de orden
export const updateOrderStatus = async (orderId, status) => {
  const res = await authFetch(ENDPOINTS.orders.update(orderId), {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
  }

  return res.json();
};
