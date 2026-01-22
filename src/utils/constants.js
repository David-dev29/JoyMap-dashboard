// Theme colors
export const COLORS = {
  primary: '#EF4444',
  primaryHover: '#DC2626',
  primaryLight: '#FEE2E2',
  secondary: '#1F2937',
  secondaryLight: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendiente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.READY]: 'Listo',
  [ORDER_STATUS.DELIVERED]: 'Entregado',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PREPARING]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.READY]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.DELIVERED]: 'bg-gray-100 text-gray-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
};

// User roles
export const ROLES = {
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
};

// Business types
export const BUSINESS_TYPES = {
  FOOD: 'comida',
  STORE: 'tienda',
  DELIVERY: 'envio',
};

export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.FOOD]: 'Comida',
  [BUSINESS_TYPES.STORE]: 'Tienda',
  [BUSINESS_TYPES.DELIVERY]: 'Envio',
};

// Availability
export const AVAILABILITY = {
  AVAILABLE: 'Disponible',
  UNAVAILABLE: 'No disponible',
  OUT_OF_STOCK: 'Agotado',
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
