import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * API xato kodlari. Kod **doimiy va o'zgarmas** — frontend shu kod bo'yicha
 * foydalanuvchiga o'zbekcha matn ko'rsatadi (`locales/*.json`, `errors.*`).
 *
 * `message` texnik xodim uchun inglizcha qoladi va ichki tafsilotni oshkor
 * qilmaydi (CLAUDE.md 6-qoida).
 */
export const ERROR_CODES = [
  'FILE_TOO_LARGE',
  'UNSUPPORTED_TYPE',
  'IMAGE_TOO_SMALL',
  'IMAGE_TOO_LARGE',
  'EMPTY_FILE',
  'STORAGE_UNAVAILABLE',
  'UPLOAD_FAILED',
  'VALIDATION_ERROR',
  'NOT_FOUND',
  'UNAUTHORIZED',
  'SERVER_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

const STATUS: Record<ErrorCode, ContentfulStatusCode> = {
  FILE_TOO_LARGE: 413,
  UNSUPPORTED_TYPE: 415,
  IMAGE_TOO_SMALL: 422,
  IMAGE_TOO_LARGE: 422,
  EMPTY_FILE: 422,
  STORAGE_UNAVAILABLE: 503,
  UPLOAD_FAILED: 500,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  SERVER_ERROR: 500,
};

/**
 * Xatoni yagona shaklda qaytaradi: `{ error: { code, message, meta? } }`.
 * `meta` — foydalanuvchiga ko'rsatiladigan matndagi o'rin to'ldirgichlar
 * uchun (masalan `{ limit: '5 MB' }`), maxfiy ma'lumot bo'lmasligi shart.
 */
export function fail(
  c: Context,
  code: ErrorCode,
  message: string,
  meta?: Record<string, string | number>
) {
  return c.json({ error: { code, message, ...(meta ? { meta } : {}) } }, STATUS[code]);
}
