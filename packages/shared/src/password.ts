// PBKDF2-HMAC-SHA256 asosidagi parol hashlash moduli.
//
// Faqat Web Crypto API (`crypto.subtle`) ishlatiladi — shuning uchun modul
// Cloudflare Workers, Bun va Node 18+ muhitlarida bir xil ishlaydi.
// bcrypt Workers'da ishlamagani uchun undan butunlay voz kechildi.

const ALGORITHM = 'pbkdf2';
const DIGEST = 'sha256';
const SALT_BYTES = 16;
const KEY_BYTES = 32;

/** OWASP 2023 tavsiyasi: PBKDF2-HMAC-SHA256 uchun kamida 210 000 iteratsiya. */
export const DEFAULT_ITERATIONS = 210_000;

/** Buzuq yoki dushmanona hash tufayli CPU'ni band qilib qo'ymaslik uchun yuqori chegara. */
const MAX_ITERATIONS = 5_000_000;

/**
 * Bazada admin topilmaganda ishlatiladigan "soxta" hash.
 *
 * Login endpoint'i email mavjud bo'lmasa ham shu hash bilan to'liq PBKDF2
 * hisobini bajaradi — natijada javob vaqti bir xil bo'ladi va user enumeration
 * imkonsiz bo'ladi. Hash tasodifiy, hech kimga ma'lum bo'lmagan paroldan
 * olingan, shuning uchun u bilan tizimga kirib bo'lmaydi.
 */
export const DUMMY_PASSWORD_HASH =
  'pbkdf2$sha256$210000$exl2zFyUbLTfThG2XU5UkA==$twjdG0miwKvH0uXaHAVbn7QbGS2oTa8CFXTB1JgJhbY=';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveBits(
  password: string,
  salt: Uint8Array,
  iterations: number,
  keyBytes: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    keyMaterial,
    keyBytes * 8
  );
  return new Uint8Array(bits);
}

/**
 * Baytlarni doimiy vaqtda solishtiradi.
 * Erta `return` qilinmaydi — har doim butun massiv aylanib chiqiladi.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const av = i < a.length ? a[i] : 0;
    const bv = i < b.length ? b[i] : 0;
    diff |= av ^ bv;
  }
  return diff === 0;
}

/**
 * Parolni tasodifiy salt bilan hashlaydi.
 *
 * Qaytariladigan format o'zini tavsiflaydi, shuning uchun kelajakda
 * parametrlar o'zgarsa ham eski hash'larni tekshirish mumkin bo'lib qoladi:
 *   `pbkdf2$sha256$<iterations>$<saltBase64>$<hashBase64>`
 */
export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<string> {
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > MAX_ITERATIONS) {
    throw new RangeError(`Iteratsiya soni 1..${MAX_ITERATIONS} oralig'ida bo'lishi kerak`);
  }
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, iterations, KEY_BYTES);
  return `${ALGORITHM}$${DIGEST}$${iterations}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * Parolni saqlangan hash bilan solishtiradi.
 *
 * Hech qachon `throw` qilmaydi: format buzuq, algoritm notanish yoki base64
 * noto'g'ri bo'lsa — oddiygina `false` qaytaradi.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    if (typeof stored !== 'string') return false;

    const parts = stored.split('$');
    if (parts.length !== 5) return false;

    const [algorithm, digest, iterationsRaw, saltB64, hashB64] = parts;
    if (algorithm !== ALGORITHM || digest !== DIGEST) return false;

    // `Number()` bo'sh satrni 0 qiladi, shuning uchun formatni ham tekshiramiz.
    if (!/^[0-9]+$/.test(iterationsRaw)) return false;
    const iterations = Number(iterationsRaw);
    if (!Number.isInteger(iterations) || iterations < 1 || iterations > MAX_ITERATIONS) {
      return false;
    }

    const salt = fromBase64(saltB64);
    const expected = fromBase64(hashB64);
    if (salt.length === 0 || expected.length === 0) return false;

    const actual = await deriveBits(password, salt, iterations, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
