// Muhit o'zgaruvchilari (Workers secret'lari) bilan ishlashning yagona nuqtasi.
//
// Qoida: secret uchun hech qachon default qiymat bo'lmaydi. Secret yo'q bo'lsa
// xato tashlanadi (fail closed) — bu konfiguratsiya xatosi, foydalanuvchi xatosi emas.

import type { Env } from '../index';

/** HS256 uchun kalit kamida 256 bit (32 bayt) bo'lishi kerak. */
const MIN_JWT_SECRET_LENGTH = 32;

/** Konfiguratsiya xatosi — HTTP javobda 500 ga aylantiriladi, 401 ga emas. */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * JWT secret'ini qaytaradi.
 * @throws {ConfigError} secret o'rnatilmagan yoki juda qisqa bo'lsa.
 */
export function getJwtSecret(env: Env): string {
  const secret: unknown = env?.JWT_SECRET;

  if (typeof secret !== 'string' || secret.length === 0) {
    throw new ConfigError('JWT_SECRET is not configured');
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new ConfigError(
      `JWT_SECRET is too short (kamida ${MIN_JWT_SECRET_LENGTH} belgi bo'lishi kerak)`
    );
  }
  return secret;
}

/**
 * Frontend manzili — CORS `origin` va CSP `connect-src`/xat shablonlaridagi
 * havolalar shu qiymatdan olinadi.
 *
 * Ilgari bo'sh bo'lganda jimgina `http://localhost:5173` ga tushib qolardi —
 * production'da bu CORS ni noto'g'ri (yoki noaniq) manzilga ochib qo'yardi.
 * Endi boshqa secret'lar kabi fail closed: sozlanmagan bo'lsa xato tashlanadi.
 * @throws {ConfigError} `FRONTEND_URL` o'rnatilmagan bo'lsa.
 */
export function getFrontendUrl(env: Env): string {
  const url: unknown = env?.FRONTEND_URL;

  if (typeof url !== 'string' || url.length === 0) {
    throw new ConfigError('FRONTEND_URL is not configured');
  }
  return url;
}
