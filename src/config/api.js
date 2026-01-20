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
    create: `${API_BASE_URL}/businesses/create`,
    byId: (id) => `${API_BASE_URL}/businesses/${id}`,
  },

  // Categorías de negocios
  businessCategories: {
    base: `${API_BASE_URL}/business-categories`,
  },

  // Subcategorías
  subcategories: {
    base: `${API_BASE_URL}/subcategories`,
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

export default {
  API_BASE_URL,
  SOCKET_URL,
  ENDPOINTS,
  SOCKET_CONFIG,
  ENV,
  isDev,
  isProd,
};
