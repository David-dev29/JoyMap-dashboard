// Email validation
export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Phone validation (Mexican format)
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

// Required field
export const isRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

// Min length
export const minLength = (value, min) => {
  if (!value) return false;
  return value.length >= min;
};

// Max length
export const maxLength = (value, max) => {
  if (!value) return true;
  return value.length <= max;
};

// Number range
export const isInRange = (value, min, max) => {
  const num = Number(value);
  if (isNaN(num)) return false;
  return num >= min && num <= max;
};

// Positive number
export const isPositive = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

// URL validation
export const isValidUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = data[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      const error = rule(value, data);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Common validation rules
export const rules = {
  required: (message = 'Este campo es requerido') => (value) =>
    !isRequired(value) ? message : null,

  email: (message = 'Email invalido') => (value) =>
    value && !isValidEmail(value) ? message : null,

  phone: (message = 'Telefono invalido') => (value) =>
    value && !isValidPhone(value) ? message : null,

  minLength: (min, message) => (value) =>
    value && !minLength(value, min)
      ? message || `Minimo ${min} caracteres`
      : null,

  maxLength: (max, message) => (value) =>
    value && !maxLength(value, max)
      ? message || `Maximo ${max} caracteres`
      : null,

  positive: (message = 'Debe ser un numero positivo') => (value) =>
    value && !isPositive(value) ? message : null,
};
