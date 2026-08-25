import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Login so'rovining o'zidagi 401 — bu "parol noto'g'ri" degani, sessiya
    // tugagani emas. Uni qayta yo'naltirsak, sahifa to'liq qayta yuklanadi va
    // foydalanuvchi xato xabarini umuman ko'rmaydi.
    const url: string = err.config?.url ?? '';
    const isLoginRequest = url.includes('/api/auth/login');

    if (
      err.response?.status === 401 &&
      !isLoginRequest &&
      window.location.pathname.startsWith('/admin')
    ) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  me: () => api.get('/api/auth/me'),
};

// --- News ---
export const newsApi = {
  list: (page = 1, limit = 10) =>
    api.get('/api/news', { params: { page, limit } }),
  get: (slug: string) => api.get(`/api/news/${slug}`),
  create: (data: unknown) => api.post('/api/news', data),
  update: (id: string, data: unknown) => api.put(`/api/news/${id}`, data),
  delete: (id: string) => api.delete(`/api/news/${id}`),
};

// --- Publications ---
export const pubsApi = {
  list: (page = 1, limit = 20, category?: string) =>
    api.get('/api/publications', { params: { page, limit, category } }),
  get: (id: string) => api.get(`/api/publications/${id}`),
  create: (data: unknown) => api.post('/api/publications', data),
  update: (id: string, data: unknown) => api.put(`/api/publications/${id}`, data),
  delete: (id: string) => api.delete(`/api/publications/${id}`),
};

// --- Structure ---
export const structureApi = {
  tree: () => api.get('/api/structure'),
  create: (data: unknown) => api.post('/api/structure', data),
  update: (id: string, data: unknown) => api.put(`/api/structure/${id}`, data),
  delete: (id: string) => api.delete(`/api/structure/${id}`),
};

// --- Settings ---
export const settingsApi = {
  all: () => api.get('/api/settings'),
  bulkUpdate: (data: Record<string, string>) => api.post('/api/settings/bulk', data),
};

// --- Contact ---
export const contactApi = {
  send: (data: unknown) => api.post('/api/contact', data),
  list: (page = 1) => api.get('/api/contact', { params: { page } }),
  markRead: (id: string) => api.patch(`/api/contact/${id}/read`),
  delete: (id: string) => api.delete(`/api/contact/${id}`),
};
