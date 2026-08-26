import axios from 'axios';

/** API qaytaradigan xato kodlari — `apps/api/src/lib/errors.ts` bilan bir xil. */
export const ERROR_CODES = [
  'FILE_TOO_LARGE', 'UNSUPPORTED_TYPE', 'IMAGE_TOO_SMALL', 'IMAGE_TOO_LARGE',
  'EMPTY_FILE', 'STORAGE_UNAVAILABLE', 'UPLOAD_FAILED', 'VALIDATION_ERROR',
  'NOT_FOUND', 'UNAUTHORIZED', 'SERVER_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ApiError {
  code: ErrorCode;
  /** Matndagi o'rin to'ldirgichlar uchun: `{limit}`, `{formats}`, `{min}`, `{max}`. */
  meta?: Record<string, string | number>;
}

/**
 * Mijoz tomonida yuzaga kelgan, lekin foydalanuvchiga xuddi API xatosidek
 * ko'rsatilishi kerak bo'lgan xato. Masalan brauzer faylni rasm sifatida
 * ocholmadi — bu `SERVER_ERROR` emas, `UNSUPPORTED_TYPE`.
 */
export class ClientError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly meta?: Record<string, string | number>
  ) {
    super(code);
    this.name = 'ClientError';
  }
}

function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Ixtiyoriy xatoni `{code, meta}` shakliga keltiradi.
 *
 * Server yangi shaklda (`{error:{code,message}}`) javob bermasa — HTTP holat
 * kodiga qarab mos kod tanlanadi, shunda foydalanuvchi baribir o'zbekcha
 * xabar ko'radi.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ClientError) {
    return { code: error.code, meta: error.meta };
  }
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: unknown } | undefined;
    const inner = payload?.error;
    if (inner && typeof inner === 'object' && isErrorCode((inner as { code?: unknown }).code)) {
      const { code, meta } = inner as { code: ErrorCode; meta?: Record<string, string | number> };
      return { code, meta };
    }
    const status = error.response?.status;
    if (status === 401) return { code: 'UNAUTHORIZED' };
    if (status === 404) return { code: 'NOT_FOUND' };
    if (status === 400 || status === 422) return { code: 'VALIDATION_ERROR' };
    if (status === 503) return { code: 'STORAGE_UNAVAILABLE' };
  }
  return { code: 'SERVER_ERROR' };
}
