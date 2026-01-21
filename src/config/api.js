/**
 * Configuración centralizada de API y conexiones
 * Usa variables de entorno de Vite (VITE_*)
 */

// URL base de la API (sin /api al final para flexibilidad)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// URL del servidor de WebSockets
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Ambiente actual
export const ENV = import.meta.env.VITE_ENV || 'development';

// Helper: ¿Estamos en desarrollo?
export const isDev = ENV === 'development';

// Helper: ¿Estamos en producción?
export const isProd = ENV === 'production';

/**
 * Endpoints de la API organizados por módulo
 */
export const ENDPOINTS = {
  // Categorías
  categories: {
    base: `${API_BASE_URL}/categories`,
    create: `${API_BASE_URL}/categories/create`,
    byId: (id) => `${API_BASE_URL}/categories/${id}`,
  },

  // Productos
  products: {
    base: `${API_BASE_URL}/products`,
    create: `${API_BASE_URL}/products/create`,
    byId: (id) => `${API_BASE_URL}/products/${id}`,
  },

  // Órdenes
  orders: {
    base: `${API_BASE_URL}/orders`,
    active: `${API_BASE_URL}/orders/active`,
    byId: (id) => `${API_BASE_URL}/orders/${id}`,
    update: (id) => `${API_BASE_URL}/orders/update/${id}`,
    cancel: (id) => `${API_BASE_URL}/orders/${id}/cancel`,
    registerPayment: (id) => `${API_BASE_URL}/orders/${id}/register-payment`,
  },

  // Tiendas
  stores: {
    base: `${API_BASE_URL}/stores`,
    byId: (id) => `${API_BASE_URL}/stores/${id}`,
  },

  // Cocinas
  kitchens: {
    base: `${API_BASE_URL}/kitchens`,
    create: `${API_BASE_URL}/kitchens/create`,
    byId: (id) => `${API_BASE_URL}/kitchens/${id}`,
    byStore: (storeId) => `${API_BASE_URL}/kitchens?storeId=${storeId}`,
  },

  // Negocios
  businesses: {
    base: `${API_BASE_URL}/businesses`,
    all: `${API_BASE_URL}/businesses?all=true`, // Todos los negocios sin filtro de tipo
    create: `${API_BASE_URL}/businesses/create`,
    byId: (id) => `${API_BASE_URL}/businesses/${id}`,
    // Endpoints por negocio específico
    categories: (businessId) => `${API_BASE_URL}/businesses/${businessId}/categories`,
    products: (businessId) => `${API_BASE_URL}/businesses/${businessId}/products`,
    orders: (businessId) => `${API_BASE_URL}/businesses/${businessId}/orders`,
    stats: (businessId) => `${API_BASE_URL}/businesses/${businessId}/stats`,
  },

  // Categorías de negocios
  businessCategories: {
    base: `${API_BASE_URL}/business-categories`,
  },

  // Subcategorías
  subcategories: {
    base: `${API_BASE_URL}/subcategories`,
  },

  // Autenticación
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    me: `${API_BASE_URL}/auth/me`,
  },

  // Datos del usuario autenticado (/api/me/*)
  me: {
    profile: `${API_BASE_URL}/me`,
    business: `${API_BASE_URL}/me/business`,
    products: `${API_BASE_URL}/me/products`,
    categories: `${API_BASE_URL}/me/categories`,
    orders: `${API_BASE_URL}/me/orders`,
    ordersStats: `${API_BASE_URL}/me/orders/stats`,
  },
};

/**
 * Configuración de Socket.io
 */
export const SOCKET_CONFIG = {
  url: SOCKET_URL,
  options: {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  },
};

/**
 * Obtener headers de autenticación
 * @returns {Object} Headers con Authorization si existe token
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Fetch con autenticación automática
 * Redirige a /login si recibe 401
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Response>}
 */
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');

  const headers = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  // Token expirado o inválido
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  }

  return response;
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  ENDPOINTS,
  SOCKET_CONFIG,
  ENV,
  isDev,
  isProd,
  getAuthHeaders,
  authFetch,
};
