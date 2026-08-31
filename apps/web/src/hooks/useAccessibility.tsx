import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  A11Y_STORAGE_KEY, ALL_A11Y_CLASSES, DEFAULT_A11Y, classesFor, isDefault, readStoredSettings,
  type A11ySettings,
} from '@/lib/a11y';

interface A11yApi {
  settings: A11ySettings;
  /** Bitta sozlamani o'zgartiradi. */
  set: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  /** Odatdagi ko'rinishga qaytaradi. */
  reset: () => void;
  /** Sukut holatidan farq qiladimi — tugmada belgi ko'rsatish uchun. */
  changed: boolean;
}

const AccessibilityContext = createContext<A11yApi | null>(null);

/**
 * Ko'rinish sozlamalari butun sayt uchun. Tanlov `localStorage` da saqlanadi
 * va `html` elementiga sinf sifatida qo'llanadi (`index.css`).
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(readStoredSettings);

  // Sinflarni `html` ga qo'yamiz. Eskilari har safar olib tashlanadi, aks holda
  // sozlama o'zgarganda ikkita qarama-qarshi sinf qolib ketardi.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...ALL_A11Y_CLASSES);
    root.classList.add(...classesFor(settings));
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // `localStorage` o'chirilgan bo'lsa tanlov shu sessiyada ishlaydi.
    }
  }, [settings]);

  const set = useCallback<A11yApi['set']>((key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_A11Y), []);

  const api = useMemo<A11yApi>(
    () => ({ settings, set, reset, changed: !isDefault(settings) }),
    [settings, set, reset]
  );

  return <AccessibilityContext.Provider value={api}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): A11yApi {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used inside <AccessibilityProvider>');
  return context;
}
