/**
 * Node.js kirish nuqtasi — webname hostingi (cPanel "Setup Node.js App",
 * Passenger) uchun. Workers kirish nuqtasi (`index.ts`) o'zgarmaydi: bu fayl
 * shu ilovani oladi va Workers bog'lanishlarining Node'dagi o'rnini beradi:
 *
 * - `c.env`   → `process.env` dan yig'iladi (cPanel formasidagi o'zgaruvchilar);
 * - `MEDIA`   → diskdagi ombor (`MEDIA_DIR`), R2 o'rniga;
 * - baza      → oddiy PostgreSQL, Neon HTTP drayverisiz;
 * - `waitUntil` → fon vazifasi, xatosi jurnalga yoziladi.
 *
 * Secret yetishmasa jarayon ishga TUSHMAYDI (fail closed, CLAUDE.md 4.1).
 */
import { serve } from '@hono/node-server';
import { PrismaClient } from '@prisma/client';
import app, { type Env } from './index';
import { setDb } from './lib/db';
import { getFrontendUrl, getJwtSecret } from './lib/env';
import { createFsStorage } from './lib/fs-storage';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function buildEnv(): Env {
  const env: Env = {
    DATABASE_URL: required('DATABASE_URL'),
    JWT_SECRET: required('JWT_SECRET'),
    FRONTEND_URL: required('FRONTEND_URL'),
    RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
    MAIL_FROM: process.env.MAIL_FROM || undefined,
  };
  // Uzunlik va boshqa talablarni so'rov kelguncha emas, ishga tushishda tekshiramiz.
  getJwtSecret(env);
  getFrontendUrl(env);

  const mediaDir = process.env.MEDIA_DIR;
  if (mediaDir) {
    env.MEDIA = createFsStorage(mediaDir);
  } else {
    // Workers'dagi kabi: ombor yo'q bo'lsa yuklash 503 qaytaradi, boshqa joyga yozilmaydi.
    console.warn('MEDIA_DIR is not set — file uploads are disabled');
  }
  return env;
}

const env = buildEnv();

/**
 * Hostingda hisob uchun ochiq DB ulanishlari soni cheklangan: Prisma'ning
 * standart pool'i (CPU × 2 + 1) limitdan oshgach, yangi ulanish 5 soniyada
 * uziladi va so'rov 500 qaytaradi (2026-09-23, 4-parallel so'rovda tasdiqlangan).
 * Kichik pool bilan ortiqcha so'rovlar yiqilmaydi, navbatda kutadi.
 * URL da parametr berilgan bo'lsa, o'shanisi ustun.
 */
function withPoolLimits(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', process.env.DB_CONNECTION_LIMIT || '2');
  }
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20');
  return url.toString();
}

const prisma = new PrismaClient({ datasourceUrl: withPoolLimits(env.DATABASE_URL) });
setDb(prisma);

// Workers'dagi `ExecutionContext` o'rnini bosuvchi: Node jarayoni javobdan
// keyin ham yashaydi, shuning uchun va'dani kutish shart emas — faqat xatosi
// jimgina yo'qolmasligi kerak.
const executionCtx = {
  waitUntil(promise: Promise<unknown>): void {
    promise.catch((err: unknown) => {
      console.error('Background task failed:', err instanceof Error ? err.message : err);
    });
  },
  passThroughOnException(): void {},
  props: {},
};

const port = Number(process.env.PORT) || 3000;

const server = serve({
  fetch: (request) => app.fetch(request, env, executionCtx),
  port,
});

console.log(`Energetika API (Node) listening on ${port}`);

function shutdown(): void {
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
