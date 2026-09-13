import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const api: AxiosInstance = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = { register: (data: Record<string, unknown>) => api.post('/auth/register', data), login: (data: Record<string, unknown>) => api.post('/auth/login', data), logout: () => api.post('/auth/logout'), verify: () => api.get('/auth/verify') };
export const discoveriesAPI = { getAll: (params?: Record<string, unknown>) => api.get('/discoveries', { params }), getById: (id: string) => api.get(`/discoveries/${id}`), create: (data: FormData) => api.post('/discoveries', data), verify: (id: string, data: Record<string, unknown>) => api.patch(`/discoveries/${id}/verify`, data) };
export const tripsAPI = { getAll: (params?: Record<string, unknown>) => api.get('/trips', { params }), getById: (id: string) => api.get(`/trips/${id}`), create: (data: Record<string, unknown>) => api.post('/trips', data), generate: (data: Record<string, unknown>) => api.post('/trips/generate', data), update: (id: string, data: Record<string, unknown>) => api.patch(`/trips/${id}`, data), delete: (id: string) => api.delete(`/trips/${id}`) };
export const guidesAPI = { getAll: (params?: Record<string, unknown>) => api.get('/guides', { params }), getById: (id: string) => api.get(`/guides/${id}`), getMe: () => api.get('/guides/me'), updateProfile: (data: Record<string, unknown>) => api.patch('/guides/me', data) };
export const bookingsAPI = { getAll: () => api.get('/bookings'), create: (data: Record<string, unknown>) => api.post('/bookings', data), updateStatus: (id: string, status: string) => api.patch(`/bookings/${id}/status`, { status }) };
export const businessesAPI = { getAll: (params?: Record<string, unknown>) => api.get('/businesses', { params }), getById: (id: string) => api.get(`/businesses/${id}`), getMe: () => api.get('/businesses/me'), updateProfile: (data: Record<string, unknown>) => api.patch('/businesses/me', data), getServices: () => api.get('/businesses/me/services'), createService: (data: Record<string, unknown>) => api.post('/businesses/me/services', data), updateService: (id: string, data: Record<string, unknown>) => api.patch(`/businesses/me/services/${id}`, data), deleteService: (id: string) => api.delete(`/businesses/me/services/${id}`) };
export const adminAPI = { getStats: () => api.get('/admin/stats'), getPendingDiscoveries: (params?: Record<string, unknown>) => api.get('/admin/discoveries/pending', { params }), getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }), updateUser: (id: string, data: Record<string, unknown>) => api.patch(`/admin/users/${id}`, data), getGuides: (params?: Record<string, unknown>) => api.get('/admin/guides', { params }), updateGuideVerification: (id: string, status: string) => api.patch(`/admin/guides/${id}/verification`, { status }), getBusinesses: () => api.get('/admin/businesses'), updateBusinessVerification: (id: string, status: string) => api.patch(`/admin/businesses/${id}/verification`, { status }), getAnalytics: () => api.get('/admin/analytics') };

export default api;
