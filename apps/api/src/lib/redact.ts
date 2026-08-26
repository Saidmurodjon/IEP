/**
 * Jurnalga yoziladigan ma'lumotdan maxfiy qismlarni olib tashlash.
 *
 * Bu davlat muassasasi sayti: jurnalga tushgan ma'lumot ham himoyalanishi
 * kerak. Jurnalga yoziladigan HAR QANDAY ma'lumot shu fayldagi funksiyalardan
 * o'tkaziladi (08-topshiriq, 3-bo'lim).
 *
 * Hech qachon yozilmaydi: parol va parol hashi, JWT token, `Authorization` va
 * `Cookie` sarlavhalari, bog'lanish formasidagi xabar matni va telefon raqami,
 * ma'lumotlar bazasi ulanish satri. Elektron pochta niqoblanadi.
 */

/** Maxfiy qiymat o'rniga qo'yiladigan matn. */
export const REDACTED = '[yashirilgan]';

/**
 * Maxfiy deb hisoblanadigan kalit nomlari (kichik harfda, qismiy moslik).
 * Ro'yxat **allowlist emas, blocklist** — shuning uchun kengaytirilishi mumkin
 * va kengaytirilishi kerak.
 */
const SECRET_KEY_PATTERNS = [
  'password', 'parol', 'passwd', 'pwd',
  'token', 'jwt', 'secret', 'apikey', 'api_key',
  'authorization', 'auth', 'cookie', 'session',
  'databaseurl', 'database_url', 'connectionstring', 'connection_string',
  'phone', 'telefon',
  // Bog'lanish formasidagi xabar matni — shaxsiy ma'lumot bo'lishi mumkin.
  'message_body', 'messagebody',
];

/** So'rov tanasi umuman saqlanmaydi; bu kalitlar butunlay olib tashlanadi. */
const DROPPED_KEYS = ['body', 'requestbody', 'payload'];

/**
 * Kalit nomini taqqoslash uchun bir shaklga keltiradi: kichik harf, ajratuvchi
 * belgilarsiz. `DATABASE_URL`, `database-url` va `databaseUrl` bir xil bo'ladi.
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[-_\s]/g, '');
}

function isSecretKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return SECRET_KEY_PATTERNS.some((pattern) => normalized.includes(normalizeKey(pattern)));
}

function isDroppedKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return DROPPED_KEYS.some((pattern) => normalized === normalizeKey(pattern));
}

/**
 * Elektron pochtani niqoblaydi: `saidmurod@academy.uz` → `s***@academy.uz`.
 * Domen qoladi — u xatoni tushunishga yordam beradi va shaxsni oshkor qilmaydi.
 */
export function maskEmail(email: string): string {
  const at = email.lastIndexOf('@');
  if (at <= 0) return REDACTED;
  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local[0]}***${domain}`;
}

/** Matn ichidagi barcha pochta manzillarini niqoblaydi. */
function maskEmailsInText(text: string): string {
  return text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (match) => maskEmail(match));
}

/**
 * Matn ichidagi maxfiy naqshlarni yashiradi:
 * `Bearer <token>`, JWT, ulanish satrlari, `parol=...` ko'rinishidagi juftliklar.
 */
export function redactText(input: unknown): string {
  if (typeof input !== 'string') return '';
  let text = input;

  // 1. Ulanish satrlari — foydalanuvchi va parol bilan birga.
  text = text.replace(/\b(postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|rediss):\/\/\S+/gi, `$1://${REDACTED}`);

  // 2. `Bearer <token>`
  text = text.replace(/\bBearer\s+[\w.\-+/=]+/gi, `Bearer ${REDACTED}`);

  // 3. JWT (uchta base64url bo'lak) — sarlavhasiz uchrasa ham.
  text = text.replace(/\beyJ[\w-]*\.[\w-]+\.[\w-]+/g, REDACTED);

  // 4. `kalit=qiymat` yoki `"kalit": "qiymat"` juftliklari.
  text = text.replace(
    /("?\b[\w.-]*(?:password|parol|passwd|pwd|token|secret|api[_-]?key|authorization|cookie)[\w.-]*"?\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s,;&}]+)/gi,
    `$1${REDACTED}`
  );

  // 5. Pochta manzillari.
  text = maskEmailsInText(text);

  return text;
}

/** Nusxa olishda halqaga tushib qolmaslik uchun chuqurlik chegarasi. */
const MAX_DEPTH = 6;

/**
 * Obyektni rekursiv tozalaydi: maxfiy kalitlar `[yashirilgan]` ga
 * almashtiriladi, `body` kabi kalitlar butunlay tushiriladi, matnlar
 * `redactText` dan o'tkaziladi.
 */
export function redactObject<T>(value: T, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > MAX_DEPTH) return REDACTED;

  if (typeof value === 'string') return redactText(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => redactObject(item, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (isDroppedKey(key)) continue;
      if (isSecretKey(key)) {
        out[key] = REDACTED;
        continue;
      }
      out[key] = redactObject(item, depth + 1);
    }
    return out;
  }

  return REDACTED;
}

/**
 * So'rov tanasidan FAQAT maydon nomlarini qoldiradi, qiymatlarini emas
 * (08-topshiriq: "so'rov tanasi umuman saqlanmasin").
 */
export function bodyFieldNames(body: unknown): string[] {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return [];
  return Object.keys(body as Record<string, unknown>).slice(0, 30);
}

/** Zanjir juda uzun bo'lsa jurnalni to'ldirmasligi uchun qisqartiriladi. */
const MAX_STACK_LINES = 12;
const MAX_STACK_CHARS = 4000;

/** Chaqiruvlar zanjirini tozalaydi va qisqartiradi. */
export function redactStack(stack: unknown): string | null {
  if (typeof stack !== 'string' || !stack.trim()) return null;
  const cleaned = redactText(stack)
    .split('\n')
    .slice(0, MAX_STACK_LINES)
    .join('\n');
  return cleaned.slice(0, MAX_STACK_CHARS);
}

/** Xato matni uchun uzunlik chegarasi. */
const MAX_MESSAGE_CHARS = 1000;

/** Xato matnini tozalaydi va qisqartiradi. */
export function redactMessage(message: unknown): string {
  const text = redactText(typeof message === 'string' ? message : String(message ?? ''));
  return text.slice(0, MAX_MESSAGE_CHARS) || 'Unknown error';
}

/**
 * Sarlavhalardan faqat xavfsizlarini qoldiradi.
 * `Authorization` va `Cookie` ATAYLAB ro'yxatda yo'q.
 */
const SAFE_HEADERS = ['user-agent', 'referer', 'content-type', 'accept-language'];

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!SAFE_HEADERS.includes(key.toLowerCase())) continue;
    out[key.toLowerCase()] = redactText(value).slice(0, 300);
  }
  return out;
}
