import { create } from 'zustand';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

export interface Admin {
  id: string;
  email: string;
  name: string;
  /** Eski saqlangan ma'lumotda rol yo'q bo'lishi mumkin — `authApi.me()` yangilaguncha noma'lum. */
  role?: AdminRole;
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  /** Serverdan kelgan yangi ma'lumot bilan rolni yangilaydi (token o'zgarmaydi). */
  updateAdmin: (admin: Admin) => void;
  logout: () => void;
}

/** Faqat rol aniq SUPER_ADMIN bo'lsa true — noma'lum rolga huquq berilmaydi. */
export const isSuperAdmin = (admin: Admin | null): boolean => admin?.role === 'SUPER_ADMIN';

// Load from localStorage on init
const storedToken = localStorage.getItem('admin_token');
const storedAdmin = localStorage.getItem('admin_data');

function parseAdmin(raw: string | null): Admin | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Admin;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  admin: parseAdmin(storedAdmin),
  isAuthenticated: !!storedToken,

  setAuth: (token, admin) => {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_data', JSON.stringify(admin));
    set({ token, admin, isAuthenticated: true });
  },

  updateAdmin: (admin) => {
    localStorage.setItem('admin_data', JSON.stringify(admin));
    set({ admin });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
    set({ token: null, admin: null, isAuthenticated: false });
  },
}));
