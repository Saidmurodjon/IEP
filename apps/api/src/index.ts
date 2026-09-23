import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { getDb } from './lib/db';
import { authRouter } from './routes/auth';
import { newsRouter } from './routes/news';
import { publicationsRouter } from './routes/publications';
import { structureRouter } from './routes/structure';
import { settingsRouter } from './routes/settings';
import { contactRouter } from './routes/contact';
import { employeesRouter } from './routes/employees';
import { partnersRouter } from './routes/partners';
import { uploadsRouter } from './routes/uploads';
import { filesRouter } from './routes/files';
import { documentsRouter } from './routes/documents';
import { logsRouter } from './routes/logs';
import { searchRouter } from './routes/search';
import { recordError } from './lib/error-log';
import { redactStack } from './lib/redact';
import { ConfigError, getFrontendUrl } from './lib/env';
import type { PrismaClient } from '@prisma/client';
import type { MediaBucket } from './lib/storage';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  /**
   * Media ombori: Workers'da R2, Node'da disk (`lib/fs-storage.ts`). Sozlanmagan bo'lishi MUMKIN — shuning uchun ixtiyoriy.
   * Yuklash endpointi bog'lanish yo'qligini o'zi tekshiradi va 503 qaytaradi
   * (`lib/storage.ts`), sukut bo'yicha boshqa omborga o'tmaydi.
   */
  MEDIA?: MediaBucket;
  /**
   * Resend API kaliti. Sozlanmagan bo'lishi MUMKIN — bunday holatda xat
   * yuborilmaydi, lekin murojaat baribir saqlanadi va jurnalga `warning`
   * tushadi (`lib/mail.ts`).
   */
  RESEND_API_KEY?: string;
  /**
   * Jo'natuvchi manzil. ALOHIDA secret: Resend'da domen tasdiqlangandan
   * (`iep.uz` ulangandan) keyin faqat shu qiymat o'zgartiriladi.
   */
  MAIL_FROM?: string;
}

export type AppContext = {
  Variables: { db: PrismaClient; adminId: string; email: string };
  Bindings: Env;
};

const app = new Hono<AppContext>();

// Inject DB per request using Cloudflare env binding
app.use('*', async (c, next) => {
  c.set('db', getDb(c.env.DATABASE_URL));
  await next();
});

app.use('*', logger());
app.use('*', prettyJSON());

// Xavfsizlik sarlavhalari (10-topshiriq, C3). CORS bilan CHALKASHTIRILMASIN:
// bular brauzerga QANDAY ko'rsatish kerakligini aytadi, CORS esa KIM so'ray
// oladi. Har bir javobga qo'shiladi — muvaffaqiyatli ham, xatoli ham.
app.use('*', async (c, next) => {
  // `finally` — downstream handler yiqilib `onError` ga tushsa ham (masalan
  // ConfigError yoki kutilmagan xato), sarlavhalar baribir qo'shiladi.
  try {
    await next();
  } finally {
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('X-Frame-Options', 'DENY');
  }
});

app.use('*', async (c, next) => {
  // `FRONTEND_URL` yo'q bo'lsa ilgari jimgina `localhost:5173` ga tushib
  // qolardi — production'da bu CORS'ni noaniq holatga olib kelardi.
  // Endi boshqa secret'lar kabi fail closed (CLAUDE.md 4.1, 1-qoida).
  let frontendUrl: string;
  try {
    frontendUrl = getFrontendUrl(c.env);
  } catch (err) {
    if (err instanceof ConfigError) {
      console.error(`CORS konfiguratsiya xatosi: ${err.message}`);
      return c.json({ error: 'Server configuration error' }, 500);
    }
    throw err;
  }

  return cors({
    origin: [frontendUrl],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next);
});

app.get('/', (c) => c.json({ status: 'ok', service: 'Energetika API', version: '1.0.0' }));

app.route('/api/auth', authRouter);
app.route('/api/news', newsRouter);
app.route('/api/publications', publicationsRouter);
app.route('/api/structure', structureRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/contact', contactRouter);
app.route('/api/employees', employeesRouter);
app.route('/api/partners', partnersRouter);
app.route('/api/documents', documentsRouter);
app.route('/api/uploads', uploadsRouter);
app.route('/api/files', filesRouter);
app.route('/api/logs', logsRouter);
app.route('/api/search', searchRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

/**
 * Umumiy xato ushlagich.
 *
 * Har bir ushlangan xato jurnalga yoziladi, foydalanuvchiga esa faqat
 * `SERVER_ERROR` kodi qaytariladi — ichki tafsilot oshkor qilinmaydi
 * (CLAUDE.md 6-qoida).
 *
 * Jurnalga yozish `waitUntil()` ichida, fonda bajariladi: so'rovga javob
 * kutib turmaydi. `waitUntil` mavjud bo'lmagan muhitda (lokal harness)
 * oddiy `void` bilan ishga tushiriladi.
 */
app.onError((err, c) => {
  console.error(err);

  const write = recordError(c.get('db'), {
    source: 'server',
    level: 'error',
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? redactStack(err.stack) : null,
    path: new URL(c.req.url).pathname,
    method: c.req.method,
    statusCode: 500,
    userAgent: c.req.header('User-Agent') ?? null,
    adminId: c.get('adminId') ?? null,
  });

  try {
    c.executionCtx.waitUntil(write);
  } catch {
    // `executionCtx` yo'q muhitda (masalan lokal harness) — fonda qoldiramiz.
    void write;
  }

  return c.json(
    { error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
    500
  );
});

export default app;
