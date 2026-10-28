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
 * Mijoz IP si — FAQAT `CF-Connecting-IP` dan.
 *
 * Workers'da bu sarlavhani Cloudflare o'zi qo'yadi (mijoz yuborganini ustidan
 * yozadi). Node'da (iep.uz, Cloudflare'siz) uni `withProxyClientIp()` qo'yadi.
 * `X-Forwarded-For` ga to'g'ridan-to'g'ri ishonilmaydi: uning boshini mijoz
 * istalgancha yozadi va shu bilan barcha cheklovlarni chetlab o'tardi
 * (2026-10-28 auditida prod'da tasdiqlangan).
 */
export function clientIp(headers: Headers): string {
  return headers.get('CF-Connecting-IP')?.trim() || 'unknown';
}

/**
 * Node (Apache + Passenger) uchun: proksi haqiqiy IP ni `X-Forwarded-For`
 * OXIRIGA qo'shadi, oldingi qismi esa mijozdan keladi. Shuning uchun faqat
 * oxirgi element olinadi va `CF-Connecting-IP` ga yoziladi; mijoz o'zi
 * yuborgan `CF-Connecting-IP` o'chiriladi.
 */
export function withProxyClientIp(request: Request): Request {
  const headers = new Headers(request.headers);
  headers.delete('CF-Connecting-IP');
  const ip = headers.get('X-Forwarded-For')?.split(',').pop()?.trim();
  if (ip) headers.set('CF-Connecting-IP', ip);
  return new Request(request, { headers });
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
