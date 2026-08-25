import type { Context, Next } from 'hono';
import type { AppContext } from '../index';
import { ConfigError, getJwtSecret } from '../lib/env';
import { verifyToken } from '../lib/jwt';

export async function requireAuth(c: Context<AppContext>, next: Next) {
  // Secret yo'qligi — server konfiguratsiyasidagi xato, foydalanuvchi aybi emas.
  // Shuning uchun 500 qaytariladi, 401 emas.
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
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // `next()` ataylab `try` dan tashqarida: keyingi handler'dagi xato
  // 401 ga aylanib qolmasligi kerak.
  await next();
}
