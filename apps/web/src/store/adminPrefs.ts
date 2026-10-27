import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import i18n from '@/i18n';

export type AdminTheme = 'light' | 'dark' | 'system';
export type AdminLang = 'uz' | 'en' | 'ru';

const THEME_KEY = 'admin_theme';
const LANG_KEY = 'admin_lang';

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // saqlab bo'lmasa ham ishlayveradi
  }
}

const isTheme = (v: string | null): v is AdminTheme => v === 'light' || v === 'dark' || v === 'system';
const isLang = (v: string | null | undefined): v is AdminLang => v === 'uz' || v === 'en' || v === 'ru';

function initialLang(): AdminLang {
  const stored = readStorage(LANG_KEY);
  if (isLang(stored)) return stored;
  const current = i18n.resolvedLanguage;
  return isLang(current) ? current : 'uz';
}

interface AdminPrefsState {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
}

export const useAdminPrefs = create<AdminPrefsState>((set) => {
  const storedTheme = readStorage(THEME_KEY);
  return {
    theme: isTheme(storedTheme) ? storedTheme : 'light',
    setTheme: (theme) => {
      writeStorage(THEME_KEY, theme);
      set({ theme });
    },
    lang: initialLang(),
    setLang: (lang) => {
      writeStorage(LANG_KEY, lang);
      set({ lang });
    },
  };
});

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeSystem(callback: () => void): () => void {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

const systemIsDark = () => window.matchMedia(DARK_QUERY).matches;

/** Tanlangan mavzuni aniq 'light' yoki 'dark' ga aylantiradi ('system' bo'lsa OT sozlamasiga obuna). */
export function useResolvedAdminTheme(): 'light' | 'dark' {
  const theme = useAdminPrefs((s) => s.theme);
  const sysDark = useSyncExternalStore(subscribeSystem, systemIsDark, () => false);
  if (theme === 'system') return sysDark ? 'dark' : 'light';
  return theme;
}

/**
 * Admin sozlamalarini hujjatga qo'llaydi. Unmount'da `dark` klassi olib
 * tashlanadi — ochiq sayt hech qachon qorong'i bo'lmasligi kerak.
 */
export function useApplyAdminPrefs(): void {
  const resolved = useResolvedAdminTheme();
  const lang = useAdminPrefs((s) => s.lang);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, [resolved]);

  useEffect(() => {
    if (i18n.resolvedLanguage !== lang) void i18n.changeLanguage(lang);
    // Ekran o'qigich to'g'ri talaffuz qilishi uchun; ochiq sahifa `SeoHead` orqali qaytadan o'rnatadi.
    document.documentElement.lang = lang;
  }, [lang]);
}
