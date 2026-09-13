import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
};

export const discoveriesAPI = {
  getAll: (params?: any) => api.get('/discoveries', { params }),
  getById: (id: string) => api.get(`/discoveries/${id}`),
  create: (data: any) => api.post('/discoveries', data),
  verify: (id: string, data: any) => api.patch(`/discoveries/${id}/verify`, data),
};

export const tripsAPI = {
  getAll: (params?: any) => api.get('/trips', { params }),
  getById: (id: string) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  generate: (data: any) => api.post('/trips/generate', data),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
};

export const guidesAPI = {
  getAll: (params?: any) => api.get('/guides', { params }),
  getById: (id: string) => api.get(`/guides/${id}`),
  updateProfile: (data: any) => api.patch('/guides/me', data),
};

export const businessesAPI = {
  getAll: (params?: any) => api.get('/businesses', { params }),
  getById: (id: string) => api.get(`/businesses/${id}`),
  updateProfile: (data: any) => api.patch('/businesses/me', data),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getPendingDiscoveries: (params?: any) => api.get('/admin/discoveries/pending', { params }),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getGuides: (params?: any) => api.get('/admin/guides', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
