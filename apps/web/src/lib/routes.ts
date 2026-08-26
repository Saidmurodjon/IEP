import type { Lang } from '@energetika/shared';

/** Manzilda ruxsat etilgan til prefikslari. Boshqa qiymat — 404. */
export const SUPPORTED_LANGS = ['uz', 'en', 'ru'] as const;

/** Prefikssiz manzil shu tilga yo'naltiriladi va `x-default` shu tilga ishora qiladi. */
export const DEFAULT_LANG: Lang = 'uz';

export function isSupportedLang(value: string | undefined | null): value is Lang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

/**
 * Ochiq sahifalar ro'yxati — marshrutlar, prefikssiz manzilni tanib olish va
 * kelajakdagi sayt xaritasi uchun **yagona manba**. Yangi ochiq sahifa
 * qo'shilsa, u avval shu yerga yoziladi (`App.tsx` shu ro'yxatga tayanadi).
 */
export interface PublicRoute {
  /** Til prefiksisiz naqsh. Bosh sahifa uchun bo'sh satr. Masalan: `news/:slug`. */
  pattern: string;
  /** Ichki nom — sayt xaritasi va testlarda ishlatiladi. */
  key: string;
  /** Uchala tilda mavjudmi. */
  inAllLangs: boolean;
  /** Naqshda parametr bormi. Sayt xaritasida bunday manzillar bazadan to'ldiriladi. */
  dynamic: boolean;
}

export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { pattern: '', key: 'home', inAllLangs: true, dynamic: false },
  { pattern: 'about', key: 'about', inAllLangs: true, dynamic: false },
  { pattern: 'structure', key: 'structure', inAllLangs: true, dynamic: false },
  { pattern: 'laboratories', key: 'labs', inAllLangs: true, dynamic: false },
  { pattern: 'news', key: 'news', inAllLangs: true, dynamic: false },
  { pattern: 'news/:slug', key: 'news-detail', inAllLangs: true, dynamic: true },
  { pattern: 'publications', key: 'publications', inAllLangs: true, dynamic: false },
  { pattern: 'contact', key: 'contact', inAllLangs: true, dynamic: false },
] as const;

/** Manzilni yo'l, so'rov va langar qismlariga ajratadi. */
function splitUrl(url: string): { pathname: string; suffix: string } {
  const cut = url.search(/[?#]/);
  return cut === -1
    ? { pathname: url, suffix: '' }
    : { pathname: url.slice(0, cut), suffix: url.slice(cut) };
}

/**
 * Manzil boshidagi til prefiksini ajratadi.
 * `/ru/news` → `{ lang: 'ru', rest: '/news' }`, `/news` → `{ lang: null, rest: '/news' }`.
 * `rest` doim `/` bilan boshlanadi.
 */
export function splitLangPrefix(pathname: string): { lang: Lang | null; rest: string } {
  const [, first = '', ...others] = pathname.split('/');
  if (!isSupportedLang(first)) return { lang: null, rest: pathname || '/' };
  const rest = others.length ? `/${others.join('/')}` : '/';
  return { lang: first, rest };
}

/**
 * Ichki manzilga til prefiksini qo'yadi.
 * Admin manzillari va tashqi havolalar o'zgarishsiz qaytariladi.
 */
export function localizePath(path: string, lang: Lang): string {
  if (!path.startsWith('/')) return path;
  if (path === '/admin' || path.startsWith('/admin/')) return path;
  const { pathname, suffix } = splitUrl(path);
  const { rest } = splitLangPrefix(pathname);
  return `/${lang}${rest === '/' ? '' : rest}${suffix}`;
}

/** Bitta naqsh bitta manzilga mos keladimi. `:param` bitta bo'g'inni qoplaydi. */
function patternMatches(pattern: string, segments: string[]): boolean {
  const parts = pattern === '' ? [] : pattern.split('/');
  if (parts.length !== segments.length) return false;
  return parts.every((part, i) => (part.startsWith(':') ? segments[i] !== '' : part === segments[i]));
}

/**
 * Prefikssiz manzil bizga ma'lum ochiq sahifamikan?
 * `/news` → ha (→ `/uz/news` ga yo'naltiriladi), `/uzbekistan` → yo'q (→ 404).
 */
export function matchesPublicRoute(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return PUBLIC_ROUTES.some((route) => patternMatches(route.pattern, segments));
}

/**
 * Foydalanuvchi `/` ga kirganda qaysi tilga yo'naltirish kerak.
 * Tartib: oldingi tanlov → brauzer tili → o'zbekcha.
 */
export function detectPreferredLang(): Lang {
  try {
    const stored = localStorage.getItem('i18nextLng');
    if (isSupportedLang(stored)) return stored;
  } catch {
    // localStorage o'chirilgan bo'lishi mumkin — brauzer tiliga o'tamiz.
  }
  const navigatorLang = typeof navigator === 'undefined' ? '' : navigator.language;
  const base = navigatorLang.toLowerCase().split('-')[0];
  return isSupportedLang(base) ? base : DEFAULT_LANG;
}
