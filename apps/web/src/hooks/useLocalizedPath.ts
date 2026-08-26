import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { Lang } from '@energetika/shared';
import { DEFAULT_LANG, localizePath, splitLangPrefix } from '@/lib/routes';

/**
 * Joriy til — **manzildan** olinadi, `localStorage` dan emas.
 * Manzil til holatining yagona manbai (12-topshiriq).
 */
export function useCurrentLang(): Lang {
  const { pathname } = useLocation();
  return splitLangPrefix(pathname).lang ?? DEFAULT_LANG;
}

/**
 * Prefikssiz ichki manzilni joriy tildagi to'liq manzilga aylantiradi.
 * `LocalizedLink` shuni ishlatadi; `navigate()` uchun ham shu funksiya olinadi.
 */
export function useLocalizedPath(): (path: string) => string {
  const lang = useCurrentLang();
  return useCallback((path: string) => localizePath(path, lang), [lang]);
}
