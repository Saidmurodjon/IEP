import axios from 'axios';
import { reportClientError } from '@/lib/client-logger';

// Chaqiruvlar allaqachon `/api/...` bilan boshlanadi, shuning uchun bu yerda
// faqat origin turadi. Bo'sh qiymat — same-origin (vite proxy) rejimi.
const API_URL = import.meta.env.VITE_API_URL ?? '';

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

    // 5xx va tarmoq uzilishlari jurnalga tushadi. 4xx qayd ETILMAYDI —
    // ular odatda foydalanuvchi xatosi (noto'g'ri parol, bo'sh maydon).
    const status: number | undefined = err.response?.status;
    if (status === undefined || status >= 500) {
      reportClientError({
        message: status === undefined
          ? `Network error: ${err.message}`
          : `API ${status}: ${err.message}`,
        code: status === undefined ? 'NETWORK_ERROR' : 'SERVER_ERROR',
        statusCode: status,
        path: url,
        level: 'error',
      });
    }

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
  /** `drafts` — faqat admin panel uchun: qoralamalar ham qaytadi. */
  list: (page = 1, limit = 10, drafts = false) =>
    api.get('/api/news', { params: { page, limit, drafts: drafts || undefined } }),
  get: (slug: string, drafts = false) =>
    api.get(`/api/news/${slug}`, { params: { drafts: drafts || undefined } }),
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
export const employeesApi = {
  list: (unitId?: string, includeInactive = false) =>
    api.get('/api/employees', { params: { unitId, includeInactive: includeInactive || undefined } }),
  get: (id: string) => api.get(`/api/employees/${id}`),
  create: (data: unknown) => api.post('/api/employees', data),
  update: (id: string, data: unknown) => api.put(`/api/employees/${id}`, data),
  delete: (id: string) => api.delete(`/api/employees/${id}`),
};

export const partnersApi = {
  list: (includeInactive = false) =>
    api.get('/api/partners', { params: { includeInactive: includeInactive || undefined } }),
  create: (data: unknown) => api.post('/api/partners', data),
  update: (id: string, data: unknown) => api.put(`/api/partners/${id}`, data),
  delete: (id: string) => api.delete(`/api/partners/${id}`),
};

export const uploadsApi = {
  /**
   * Faylni yuklaydi. Rasm OLDIN `prepareImage()` bilan tayyorlanadi —
   * bu funksiya tayyor faylni yuboradi, o'zi kichraytirmaydi.
   */
  upload: (
    file: File,
    kind: 'image' | 'photo' | 'document',
    extra: { width?: number; height?: number; ownerType?: string; ownerId?: string } = {}
  ) => {
    const form = new FormData();
    form.append('file', file);
    if (extra.width) form.append('width', String(extra.width));
    if (extra.height) form.append('height', String(extra.height));
    if (extra.ownerType) form.append('ownerType', extra.ownerType);
    if (extra.ownerId) form.append('ownerId', extra.ownerId);
    return api.post(`/api/uploads?kind=${kind}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  cleanup: () => api.post('/api/uploads/cleanup'),
};

export const documentsApi = {
  list: (includeInactive = false) =>
    api.get('/api/documents', { params: { includeInactive: includeInactive || undefined } }),
  create: (data: unknown) => api.post('/api/documents', data),
  update: (id: string, data: unknown) => api.put(`/api/documents/${id}`, data),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
};

export const logsApi = {
  list: (params: {
    page?: number; limit?: number; source?: string; level?: string;
    resolved?: string; from?: string; to?: string;
  } = {}) => api.get('/api/logs', { params }),
  get: (id: string) => api.get(`/api/logs/${id}`),
  update: (id: string, data: { isResolved?: boolean; note?: string }) =>
    api.patch(`/api/logs/${id}`, data),
  delete: (id: string) => api.delete(`/api/logs/${id}`),
  cleanup: () => api.post('/api/logs/cleanup'),
};

export const settingsApi = {
  all: () => api.get('/api/settings'),
  bulkUpdate: (data: Record<string, string>) => api.post('/api/settings/bulk', data),
};

// --- Contact ---
export const contactApi = {
  send: (data: unknown) => api.post('/api/contact', data),
  list: (page = 1, status?: string) =>
    api.get('/api/contact', { params: { page, status: status || undefined } }),
  update: (id: string, data: { status?: string; answerNote?: string }) =>
    api.patch(`/api/contact/${id}`, data),
  delete: (id: string) => api.delete(`/api/contact/${id}`),
  /** Holatni tekshirish — raqam VA pochta ikkalasi ham majburiy. */
  status: (ticket: string, email: string) =>
    api.get('/api/contact/status', { params: { ticket, email } }),
};
