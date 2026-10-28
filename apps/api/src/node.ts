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
 * Jarayon darajasidagi hodisalar ham `error_logs` ga tushadi (`lib/crash-log.ts`):
 * ishga tushish/to'xtash, `uncaughtException`, `unhandledRejection`, ishga
 * tushishdagi yiqilish va ogohlantirishsiz o'ldirilish. Baza ishlamasa yozuv
 * `ERROR_LOG_DIR` dagi faylga tushadi va keyingi ishga tushishda bazaga ko'chadi.
 *
 * Secret yetishmasa jarayon ishga TUSHMAYDI (fail closed, CLAUDE.md 4.1).
 */
import { serve } from '@hono/node-server';
import { PrismaClient } from '@prisma/client';
import app, { type Env } from './index';
import { join } from 'node:path';
import { clearRunning, createFileSink, markRunning, replayFallback } from './lib/crash-log';
import { setDb } from './lib/db';
import { getFrontendUrl, getJwtSecret } from './lib/env';
import { recordError, setFallbackSink, writeFallback, type LogInput } from './lib/error-log';
import { createFsStorage } from './lib/fs-storage';

// Zaxira jurnal hammadan oldin o'rnatiladi — ishga tushishdagi xato ham qayd etilsin.
const logDir = process.env.ERROR_LOG_DIR || join(process.cwd(), 'logs');
setFallbackSink(createFileSink(logDir));

function errorInput(code: string, error: unknown): LogInput {
  const err = error instanceof Error ? error : new Error(String(error));
  return { source: 'server', level: 'error', code, message: err.message, stack: err.stack ?? null };
}

/** Jarayon holati — xabarga qo'shiladi, sabab ko'pincha shundan ko'rinadi. */
function processState(): string {
  const rssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  return `pid ${process.pid}, uptime ${Math.round(process.uptime())}s, rss ${rssMb}MB`;
}

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

let env: Env;
try {
  env = buildEnv();
} catch (error) {
  // Bazaga ulanib bo'lmaydi (sozlama yo'q) — faylga yoziladi, keyingi muvaffaqiyatli
  // ishga tushishda bazaga ko'chadi.
  writeFallback(errorInput('PROCESS_START_FAILED', error));
  throw error;
}

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

// Prisma engine'i (tokio) standart holatda har bir CPU yadrosiga bitta oqim ochadi —
// ko'p yadroli hosting serverida bu jarayon boshiga ~50 oqim. CloudLinux (LVE) oqimlarni
// ham jarayon limitiga qo'shadi: limit oshgach Passenger jarayonlari o'ldiriladi va
// SSH ham ochilmaydi (2026-09-23). Engine birinchi so'rovda yuklanadi, shuning uchun
// shu yerda o'rnatish yetarli.
process.env.TOKIO_WORKER_THREADS ||= '2';

const prisma = new PrismaClient({ datasourceUrl: withPoolLimits(env.DATABASE_URL) });
setDb(prisma);

/**
 * Jarayon yiqilayotganda yoziladigan hodisa: baza 3 soniyada javob bermasa
 * faylga tushadi (`recordError` o'zi ham baza xatosida faylga yozadi).
 */
async function recordCritical(input: LogInput, force = true): Promise<void> {
  const timeout = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 3000).unref());
  const result = await Promise.race([recordError(prisma, input, { force }), timeout]);
  if (result === 'timeout') writeFallback(input);
}

// Workers'dagi `ExecutionContext` o'rnini bosuvchi: Node jarayoni javobdan
// keyin ham yashaydi, shuning uchun va'dani kutish shart emas — faqat xatosi
// jimgina yo'qolmasligi kerak.
const executionCtx = {
  waitUntil(promise: Promise<unknown>): void {
    promise.catch((err: unknown) => {
      console.error('Background task failed:', err instanceof Error ? err.message : err);
      void recordError(prisma, { ...errorInput('BACKGROUND_TASK_FAILED', err), level: 'warning' });
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

// Oldingi jarayon ogohlantirishsiz o'ldirilganmi (SIGKILL, xotira, hosting limiti)?
// Bunday to'xtashni u o'zi yoza olmagan — keyingi jarayon qayd etadi.
for (const run of markRunning(logDir)) {
  void recordError(
    prisma,
    {
      source: 'server',
      level: 'error',
      code: 'PROCESS_KILLED',
      // Barmoq izi raqamlarni e'tiborsiz qoldiradi: bitta qator, `count` — necha marta.
      message: `Previous API process ${run.pid} (started ${run.startedAt}) ended without shutdown — killed by the host (SIGKILL, memory or process limit)`,
    },
    { force: true }
  );
}
void recordError(prisma, {
  source: 'server',
  level: 'info',
  code: 'PROCESS_STARTED',
  message: `API process started (Node ${process.version}, ${processState()})`,
});
void replayFallback(prisma, logDir)
  .then((count) => {
    if (count > 0) console.log(`Replayed ${count} pending error log entries`);
  })
  .catch((err: unknown) => {
    console.error('Error log replay failed:', err instanceof Error ? err.message : err);
  });

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  const input = errorInput('UNCAUGHT_EXCEPTION', error);
  input.message = `${input.message} (${processState()})`;
  // Holat noaniq — jarayon to'xtatiladi, Passenger yangisini ishga tushiradi.
  void recordCritical(input).finally(() => {
    clearRunning(logDir);
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  // Jarayon ishlashda davom etadi; takrorlansa throttle bazani to'ldirib qo'ymaydi.
  void recordCritical(errorInput('UNHANDLED_REJECTION', reason), false);
});

function shutdown(signal: string): void {
  void recordCritical({
    source: 'server',
    level: 'info',
    code: 'PROCESS_STOPPED',
    message: `API process stopping on ${signal} (${processState()})`,
  }).finally(() => {
    clearRunning(logDir);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
  });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
