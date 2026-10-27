import type { Context, Next } from 'hono';
import type { AppContext } from '../index';
import { ConfigError, getJwtSecret } from '../lib/env';
import { verifyToken } from '../lib/jwt';
import { logEvent } from '../lib/error-log';
import { fail } from '../lib/errors';
import type { AdminRole } from '@prisma/client';

export async function requireAuth(c: Context<AppContext>, next: Next) {
  // Secret yo'qligi — server konfiguratsiyasidagi xato, foydalanuvchi aybi emas.
  // Shuning uchun 500 qaytariladi, 401 emas.
  let secret: string;
  try {
    secret = getJwtSecret(c.env);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`Auth konfiguratsiya xatosi: ${err.message}`);
      // Sozlama yo'qligi alohida qayd etiladi — bu deploy xatosi.
      logEvent(c, {
        source: 'server',
        level: 'error',
        code: 'CONFIG_MISSING',
        message: `Auth configuration error: ${err.message}`,
        path: new URL(c.req.url).pathname,
        method: c.req.method,
        statusCode: 500,
      });
      return c.json({ error: 'Server configuration error' }, 500);
    }
    throw err;
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = await verifyToken(authHeader.slice(7), secret);
    const adminId = payload.adminId;
    const email = payload.email;
    if (typeof adminId !== 'string' || typeof email !== 'string') {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }
    c.set('adminId', adminId);
    c.set('email', email);
  } catch {
    // Xavfsizlik hodisasi: yaroqsiz token bilan murojaat.
    // Tokenning O'ZI jurnalga tushmaydi — faqat hodisa fakti.
    logEvent(c, {
      source: 'server',
      level: 'warning',
      code: 'INVALID_TOKEN',
      message: 'Request with invalid or expired token',
      path: new URL(c.req.url).pathname,
      method: c.req.method,
      statusCode: 401,
      userAgent: c.req.header('User-Agent') ?? null,
    });
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Rol va faollik HAR so'rovda bazadan o'qiladi: token 7 kun yashaydi,
  // bloklangan yoki pasaytirilgan admin darhol huquqni yo'qotishi kerak.
  const admin = await c.get('db').admin.findUnique({
    where: { id: c.get('adminId') },
    select: { role: true, isActive: true },
  });
  if (!admin || !admin.isActive) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
  c.set('role', admin.role);

  // `next()` ataylab `try` dan tashqarida: keyingi handler'dagi xato
  // 401 ga aylanib qolmasligi kerak.
  await next();
}

/** Muayyan rolni talab qiladi. `requireAuth` dan KEYIN ishlatiladi. */
export function requireRole(role: AdminRole) {
  return async (c: Context<AppContext>, next: Next) => {
    if (c.get('role') !== role) {
      return fail(c, 'FORBIDDEN', 'Insufficient permissions');
    }
    await next();
  };
}
