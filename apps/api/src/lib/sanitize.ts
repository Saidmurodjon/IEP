import { FilterXSS } from 'xss';

/**
 * Moderator kiritgan HTML ni tozalash. CLAUDE.md 7-qoidasi.
 *
 * Yondashuv — **allowlist**: ro'yxatda yo'q tegning o'zi olib tashlanadi.
 * `script`, `style`, `iframe`, `object`, `embed` — tegi ham, ICHI ham
 * olib tashlanadi (`stripIgnoreTagBody`), aks holda kod matn sifatida qolardi.
 * `on...` atributlari allowlist'ga umuman kirmagani uchun avtomatik tushib qoladi.
 */

/** Tahrirlagich chiqaradigan va ochiq sahifada ko'rsatiladigan teglar. */
const WHITE_LIST = {
  p: [],
  br: [],
  strong: [], b: [],
  em: [], i: [],
  s: [], del: [],
  u: [],
  h2: [], h3: [], h4: [],
  ul: [], ol: ['start'], li: [],
  blockquote: [],
  hr: [],
  code: [], pre: [],
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  figure: [], figcaption: [],
} as const;

/** Ichi bilan birga olib tashlanadigan teglar. */
const STRIP_WITH_BODY = ['script', 'style', 'iframe', 'object', 'embed', 'noscript'];

/** `img` uchun FAQAT o'z omborimiz. Tashqi manba ham, `data:` ham emas. */
function isAllowedImageSrc(value: string): boolean {
  return value.startsWith('/api/files/');
}

/** Havolalar uchun faqat xavfsiz sxemalar. `javascript:` kabi sxemalar rad etiladi. */
function isAllowedHref(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return true;
  return /^(https?:|mailto:|tel:)/.test(trimmed);
}

const filter = new FilterXSS({
  whiteList: WHITE_LIST as unknown as Record<string, string[]>,
  stripIgnoreTag: true,
  stripIgnoreTagBody: STRIP_WITH_BODY,
  css: false,
  safeAttrValue(tag, name, value) {
    if (tag === 'img' && name === 'src') {
      return isAllowedImageSrc(value) ? value : '';
    }
    if (tag === 'a' && name === 'href') {
      return isAllowedHref(value) ? value : '';
    }
    if (tag === 'a' && name === 'target') {
      return value === '_blank' ? '_blank' : '';
    }
    if (tag === 'a' && name === 'rel') {
      return 'noopener noreferrer';
    }
    if ((tag === 'img' || tag === 'ol') && ['width', 'height', 'start'].includes(name)) {
      return /^\d{1,4}$/.test(value) ? value : '';
    }
    return value.replace(/[<>"]/g, '');
  },
});

/**
 * Bitta HTML matnni tozalaydi. Bo'sh yoki matn bo'lmasa bo'sh satr.
 *
 * Ikkinchi qadamda `src` i rad etilgan `<img>` teglari butunlay olib
 * tashlanadi — `xss` faqat atribut qiymatini bo'shatadi, tegning o'zi qolib
 * ketardi va matnda buzilgan rasm belgisi ko'rinardi.
 */
export function sanitizeHtml(input: unknown): string {
  if (typeof input !== 'string' || input.length === 0) return '';
  return filter
    .process(input)
    .replace(/<img(?![^>]*\ssrc="[^"]+")[^>]*>/gi, '')
    .replace(/\s(?:src|href)(?=[\s>])/gi, '');
}

/**
 * Obyektdagi ko'rsatilgan maydonlarni joyida tozalaydi.
 * Maydon yo'q bo'lsa (qisman yangilash) — tegilmaydi.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  data: T,
  fields: readonly string[]
): T {
  const out: Record<string, unknown> = { ...data };
  for (const field of fields) {
    if (typeof out[field] === 'string') out[field] = sanitizeHtml(out[field]);
  }
  return out as T;
}

/** Uch tilli `content` maydonlari — yangilik uchun. */
export const CONTENT_FIELDS = ['contentUz', 'contentEn', 'contentRu'] as const;
