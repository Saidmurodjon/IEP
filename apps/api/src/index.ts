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
import type { PrismaClient } from '@prisma/client';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  /**
   * R2 media ombori. Sozlanmagan bo'lishi MUMKIN — shuning uchun ixtiyoriy.
   * Yuklash endpointi bog'lanish yo'qligini o'zi tekshiradi va 503 qaytaradi
   * (`lib/storage.ts`), sukut bo'yicha boshqa omborga o'tmaydi.
   */
  MEDIA?: R2Bucket;
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
app.use('*', async (c, next) =>
  cors({
    origin: ['http://localhost:5173', c.env.FRONTEND_URL ?? ''].filter(Boolean),
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })(c, next)
);

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
