import axios from 'axios';

// Base URL for your backend API
// In development: uses localhost
// In production: uses the VITE_API_URL environment variable or defaults to Railway
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== PRODUCTS ====================

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// ==================== SALES ====================

export const createSale = async (saleData) => {
  const response = await api.post('/sales', saleData);
  return response.data;
};

export const getSales = async () => {
  const response = await api.get('/sales');
  return response.data;
};

export const getSaleById = async (id) => {
  const response = await api.get(`/sales/${id}`);
  return response.data;
};

// ==================== AUTHENTICATION ====================

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;
