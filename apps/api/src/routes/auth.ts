import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from 'hono';
import { DUMMY_PASSWORD_HASH, hashPassword, verifyPassword } from '@energetika/shared';
import { signToken } from '../lib/jwt';
import { ConfigError, getJwtSecret } from '../lib/env';
import { requireAuth } from '../middleware/auth';
import { logEvent } from '../lib/error-log';
import type { AppContext } from '../index';

export const authRouter = new Hono<AppContext>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10),
});

// --- Rate limiting -------------------------------------------------------
//
// TODO: KV yoki Durable Object ga ko'chirish. Hozirgi `Map` faqat bitta
// Worker isolate xotirasida yashaydi — isolate qayta ishga tushsa yoki
// so'rov boshqa regionga tushsa, hisob nolga qaytadi. Bu to'liq himoya emas,
// lekin oddiy brute-force urinishini sezilarli sekinlashtiradi.

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 daqiqa
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_MAX_ENTRIES = 10_000; // xotira o'sib ketmasligi uchun

interface AttemptRecord {
  count: number;
  expiresAt: number;
}

const loginAttempts = new Map<string, AttemptRecord>();

function getClientIp(c: Context<AppContext>): string {
  const cfIp = c.req.header('CF-Connecting-IP');
  if (cfIp) return cfIp;
  const forwarded = c.req.header('X-Forwarded-For');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function attemptKey(ip: string, email: string): string {
  return `${ip}|${email.toLowerCase()}`;
}

function pruneExpired(now: number): void {
  for (const [key, record] of loginAttempts) {
    if (record.expiresAt <= now) loginAttempts.delete(key);
  }
  // Muddati o'tmaganlari ham juda ko'payib ketsa, eng eskilarini tashlaymiz.
  if (loginAttempts.size > RATE_LIMIT_MAX_ENTRIES) {
    const excess = loginAttempts.size - RATE_LIMIT_MAX_ENTRIES;
    let removed = 0;
    for (const key of loginAttempts.keys()) {
      if (removed >= excess) break;
      loginAttempts.delete(key);
      removed += 1;
    }
  }
}

function isRateLimited(key: string, now: number): boolean {
  const record = loginAttempts.get(key);
  if (!record || record.expiresAt <= now) return false;
  return record.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

function registerFailedAttempt(key: string, now: number): void {
  const record = loginAttempts.get(key);
  if (!record || record.expiresAt <= now) {
    loginAttempts.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  record.count += 1;
}

// --- Endpoint'lar --------------------------------------------------------

authRouter.post('/login', zValidator('json', loginSchema), async (c) => {
  // Secret yo'q bo'lsa login umuman ishlamasin (fail closed).
  let secret: string;
  try {
    secret = getJwtSecret(c.env);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`Auth konfiguratsiya xatosi: ${err.message}`);
      return c.json({ error: 'Server configuration error' }, 500);
    }
    throw err;
  }

  const { email, password } = c.req.valid('json');
  const now = Date.now();
  const key = attemptKey(getClientIp(c), email);

  pruneExpired(now);
  if (isRateLimited(key, now)) {
    // Xavfsizlik hodisasi: login urinishlari chegaradan oshdi.
    logEvent(c, {
      source: 'server',
      level: 'warning',
      code: 'RATE_LIMITED',
      message: 'Login rate limit exceeded',
      path: new URL(c.req.url).pathname,
      method: c.req.method,
      statusCode: 429,
      userAgent: c.req.header('User-Agent') ?? null,
    });
    return c.json({ error: 'Too many login attempts. Please try again later.' }, 429);
  }

  const db = c.get('db');
  const admin = await db.admin.findUnique({ where: { email } });

  // User enumeration'ning oldini olish: admin topilmasa ham xuddi shunday
  // qimmat PBKDF2 hisobi bajariladi, javob vaqti bir xil bo'ladi.
  const storedHash = admin?.password ?? DUMMY_PASSWORD_HASH;
  const passwordMatches = await verifyPassword(password, storedHash);

  if (!admin || !passwordMatches) {
    registerFailedAttempt(key, now);
    // Xabar ikkala holatda ham bir xil — ichki tafsilot oshkor qilinmaydi.
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  loginAttempts.delete(key);
  const token = await signToken({ adminId: admin.id, email: admin.email }, secret);

  return c.json({
    data: { token, admin: { id: admin.id, email: admin.email, name: admin.name } },
  });
});

authRouter.get('/me', requireAuth, async (c) => {
  const db = c.get('db');
  const adminId = c.get('adminId');
  const admin = await db.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!admin) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: admin });
});

authRouter.post(
  '/change-password',
  requireAuth,
  zValidator('json', changePasswordSchema),
  async (c) => {
    const { currentPassword, newPassword } = c.req.valid('json');
    const db = c.get('db');
    const adminId = c.get('adminId');

    const admin = await db.admin.findUnique({ where: { id: adminId } });
    if (!admin) return c.json({ error: 'Not found' }, 404);

    const currentMatches = await verifyPassword(currentPassword, admin.password);
    if (!currentMatches) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    if (newPassword === currentPassword) {
      return c.json({ error: 'New password must be different from the current one' }, 400);
    }

    await db.admin.update({
      where: { id: adminId },
      data: { password: await hashPassword(newPassword) },
    });

    return c.json({ data: { success: true } });
  }
);
