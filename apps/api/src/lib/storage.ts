import type { Env } from '../index';

/**
 * Fayl ombori bilan ishlashning yagona nuqtasi.
 *
 * Qoida: bog'lanish yo'q bo'lsa **xato tashlanadi**, boshqa omborga yoki
 * bazaga o'tilmaydi (fail closed — `lib/env.ts` dagi yondashuv).
 */
export class StorageUnavailableError extends Error {
  constructor() {
    super('R2 binding MEDIA is not configured');
    this.name = 'StorageUnavailableError';
  }
}

/** @throws {StorageUnavailableError} MEDIA bog'lanishi yo'q bo'lsa. */
export function getStorage(env: Env): R2Bucket {
  const bucket = env?.MEDIA;
  if (!bucket || typeof bucket.put !== 'function') {
    throw new StorageUnavailableError();
  }
  return bucket;
}

/** Ombor sozlanganmi — endpointni to'xtatmasdan tekshirish uchun. */
export function hasStorage(env: Env): boolean {
  return !!env?.MEDIA && typeof env.MEDIA.put === 'function';
}

/**
 * Kalit ASL FAYL NOMIGA BOG'LIQ EMAS — tasodifiy hosil qilinadi.
 * Asl nom faqat bazada (`MediaFile.originalName`) saqlanadi.
 * Shakli: `2026/08/<uuid>.<ext>`.
 */
export function buildKey(extension: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}/${month}/${crypto.randomUUID()}.${extension}`;
}

/**
 * Kalitni tekshiradi. Faqat `YYYY/MM/<uuid>.<ext>` shakli qabul qilinadi —
 * `..` yoki boshqa yo'l bilan ombor bo'ylab yurishning oldini oladi.
 */
export function isValidKey(key: string): boolean {
  return /^\d{4}\/\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/.test(key);
}
