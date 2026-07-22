import { getApiBaseUrl } from '../config/apiConfig';

const API_BASE_URL = `${getApiBaseUrl()}/api`;

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  register: (fullName, email, password, passwordConfirm) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password, passwordConfirm }),
    }).then(r => r.json()),

  // Products
  getProducts: () =>
    fetch(`${API_BASE_URL}/products`, {
      credentials: 'include',
    }).then(r => r.json()),

  createProduct: (data) =>
    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Suppliers
  getSuppliers: () =>
    fetch(`${API_BASE_URL}/suppliers`, {
      credentials: 'include',
    }).then(r => r.json()),

  createSupplier: (data) =>
    fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then(r => r.json()),

  // Orders
  getOrders: () =>
    fetch(`${API_BASE_URL}/orders`, {
      credentials: 'include',
    }).then(r => r.json()),

  // Analytics
  getDashboardStats: () =>
    fetch(`${API_BASE_URL}/analytics/dashboard-stats`, {
      credentials: 'include',
    }).then(r => r.json()),
};