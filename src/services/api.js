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
