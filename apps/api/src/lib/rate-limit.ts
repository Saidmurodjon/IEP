/**
 * Oddiy oyna asosidagi cheklov va mijoz IP sini aniqlash.
 *
 * DIQQAT: hisob **izolyat xotirasida** turadi. Cloudflare Workers izolyati
 * qisqa umr ko'radi va bir nechta izolyat parallel ishlashi mumkin, shuning
 * uchun bu qat'iy kafolat emas — bitta izolyat ichidagi portlashni to'xtatadi.
 * Qat'iy cheklov kerak bo'lganda KV yoki Durable Object ga o'tiladi (TODO).
 */

export interface RateLimitStore {
  hits: Map<string, { count: number; resetAt: number }>;
}

/** Har bir endpoint uchun ALOHIDA store yaratiladi. */
export function createStore(): RateLimitStore {
  return { hits: new Map() };
}

/** Xotira cheksiz o'smasin: shu chegaradan oshganda eskirganlari tozalanadi. */
const MAX_KEYS = 5000;

/**
 * Mijoz IP si. Cloudflare `CF-Connecting-IP` ni o'zi qo'yadi va uni mijoz
 * o'zgartira olmaydi; `X-Forwarded-For` esa zaxira variant.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get('CF-Connecting-IP') ??
    headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

/**
 * Kalit bo'yicha cheklovni tekshiradi va hisobni oshiradi.
 *
 * `true` qaytsa — chegara oshgan, so'rov rad etilishi kerak.
 */
export function overLimit(
  store: RateLimitStore,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.hits.get(key);

  if (!entry || now > entry.resetAt) {
    store.hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;

  if (store.hits.size > MAX_KEYS) {
    for (const [k, value] of store.hits) if (now > value.resetAt) store.hits.delete(k);
  }

  return entry.count > limit;
}
