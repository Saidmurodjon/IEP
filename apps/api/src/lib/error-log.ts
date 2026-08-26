import type { PrismaClient } from '@prisma/client';
import { redactMessage, redactStack, redactText } from './redact';

/**
 * Xatoliklarni bazaga yozish.
 *
 * Uchta muhim xususiyat:
 * 1. **Guruhlash** — bir xil xato `fingerprint` bo'yicha bitta yozuvga tushadi,
 *    `count` oshadi. Busiz takrorlanuvchi xato bazani to'ldirib qo'yadi.
 * 2. **Throttle** — bitta barmoq izi uchun bazaga daqiqasiga bir marta yoziladi.
 * 3. **Halqa himoyasi** — jurnalga yozishning O'ZI xato bersa, u qayta qayd
 *    etilmaydi; faqat `console.error` chiqadi.
 */

export type LogSource = 'server' | 'client';
export type LogLevel = 'error' | 'warning' | 'info';

export interface LogInput {
  source: LogSource;
  level?: LogLevel;
  code?: string | null;
  message: string;
  stack?: string | null;
  path?: string | null;
  method?: string | null;
  statusCode?: number | null;
  userAgent?: string | null;
  adminId?: string | null;
}

/** Jurnalda saqlanadigan eng ko'p yozuv soni. */
const MAX_ROWS = 5000;
/** Bitta barmoq izi uchun bazaga yozish oralig'i. */
const THROTTLE_MS = 60_000;

/**
 * Oxirgi yozish vaqtlari. Workers izolyati qisqa umr ko'radi, shuning uchun
 * bu mutlaq kafolat emas — lekin bitta izolyat ichidagi portlashni to'xtatadi,
 * amalda esa aynan shunday bo'ladi.
 */
const lastWrite = new Map<string, number>();

/**
 * Throttle tufayli bazaga yozilmagan takrorlanishlar.
 *
 * Ular YO'QOLMAYDI: keyingi ruxsat etilgan yozishda `count` shu miqdorga
 * oshiriladi. Shunday qilib bazaga daqiqasiga bitta yozish bajariladi,
 * lekin `count` haqiqiy takrorlanishlar sonini ko'rsatadi.
 */
const pending = new Map<string, number>();

/**
 * `console.error` dan boshqa hech narsa qilmaydigan zaxira yo'l.
 * Jurnalga yozish jarayonida xato bo'lsa SHU ishlatiladi — aks holda
 * cheksiz halqa hosil bo'ladi.
 */
function fallbackLog(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  // Diqqat: bu yerda ham tozalangan matn chiqariladi.
  console.error(`[error-log] ${context}: ${redactText(message)}`);
}

/** FNV-1a — qisqa, tez va bog'liqliksiz xesh. Kriptografik emas, kerak ham emas. */
function shortHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/**
 * Barmoq izi: xato matni + zanjirning birinchi qatori + yo'l.
 *
 * Matndagi o'zgaruvchan qismlar (identifikatorlar, raqamlar) olib tashlanadi,
 * aks holda `id=abc` va `id=xyz` alohida yozuvlarga bo'linib ketardi.
 */
export function buildFingerprint(input: {
  source: string;
  message: string;
  stack?: string | null;
  path?: string | null;
}): string {
  const normalizedMessage = input.message
    .toLowerCase()
    .replace(/\b[0-9a-f]{8,}\b/g, '#')   // cuid, uuid, xesh
    .replace(/\d+/g, '#')                 // raqamlar
    .slice(0, 200);
  const firstStackLine = (input.stack ?? '')
    .split('\n')
    .find((line) => line.trim().startsWith('at '))
    ?.replace(/:\d+:\d+/g, '')
    .trim() ?? '';
  const normalizedPath = (input.path ?? '').replace(/\/[0-9a-f-]{8,}/gi, '/#');

  return shortHash(`${input.source}|${normalizedMessage}|${firstStackLine}|${normalizedPath}`);
}

/**
 * Xatoni jurnalga yozadi.
 *
 * **Hech qachon `throw` qilmaydi** — chaqiruvchi kod uchun xavfsiz.
 * Chaqiruv `waitUntil()` ichida bajarilishi kerak, so'rovni bloklamasin.
 */
export async function recordError(db: PrismaClient, input: LogInput): Promise<void> {
  try {
    const message = redactMessage(input.message);
    const stack = redactStack(input.stack);
    const path = input.path ? redactText(input.path).slice(0, 500) : null;

    const fingerprint = buildFingerprint({
      source: input.source,
      message,
      stack,
      path,
    });

    const now = Date.now();

    // Har bir takrorlanish avval hisobga olinadi.
    const accumulated = (pending.get(fingerprint) ?? 0) + 1;
    pending.set(fingerprint, accumulated);

    // Throttle: bitta barmoq izi uchun bazaga daqiqasiga bitta yozish.
    // To'plangan takrorlanishlar keyingi yozishda qo'shiladi.
    const previous = lastWrite.get(fingerprint);
    if (previous !== undefined && now - previous < THROTTLE_MS) return;

    lastWrite.set(fingerprint, now);
    pending.set(fingerprint, 0);
    const increment = accumulated;

    // Xaritalar cheksiz o'smasin.
    if (lastWrite.size > 500) {
      for (const [key, time] of lastWrite) {
        if (now - time > THROTTLE_MS) {
          lastWrite.delete(key);
          pending.delete(key);
        }
      }
    }

    const existing = await db.errorLog.findUnique({
      where: { fingerprint },
      select: { id: true },
    });

    if (existing) {
      await db.errorLog.update({
        where: { fingerprint },
        data: { count: { increment }, lastSeenAt: new Date(now) },
      });
      return;
    }

    await db.errorLog.create({
      data: {
        fingerprint,
        source: input.source,
        level: input.level ?? 'error',
        code: input.code ?? null,
        message,
        stack,
        path,
        method: input.method ?? null,
        statusCode: input.statusCode ?? null,
        userAgent: input.userAgent ? redactText(input.userAgent).slice(0, 300) : null,
        adminId: input.adminId ?? null,
        count: increment,
        firstSeenAt: new Date(now),
        lastSeenAt: new Date(now),
      },
    });

    await enforceRowLimit(db);
  } catch (error) {
    // JURNALGA YOZISH XATOSI QAYTA QAYD ETILMAYDI (cheksiz halqa).
    fallbackLog('recordError', error);
  }
}

/**
 * Yozuvlar soni chegaradan oshsa, eng eski HAL QILINGAN yozuvlar o'chiriladi.
 * Hal qilinmagan xatolar saqlanib qoladi — ular hali kerak.
 */
async function enforceRowLimit(db: PrismaClient): Promise<void> {
  const total = await db.errorLog.count();
  if (total <= MAX_ROWS) return;

  const excess = total - MAX_ROWS;
  const oldest = await db.errorLog.findMany({
    where: { isResolved: true },
    orderBy: { lastSeenAt: 'asc' },
    take: excess,
    select: { id: true },
  });
  if (oldest.length === 0) return;
  await db.errorLog.deleteMany({ where: { id: { in: oldest.map((row) => row.id) } } });
}

/** Hal qilingan yozuvlar shu muddatdan keyin o'chiriladi. */
export const RESOLVED_TTL_DAYS = 30;
/** Hal qilinmagan yozuvlar shu muddatdan keyin o'chiriladi. */
export const UNRESOLVED_TTL_DAYS = 90;

/**
 * Eski yozuvlarni tozalash.
 *
 * TODO: Cloudflare Cron Trigger sozlangach shu funksiya jadval bo'yicha
 * chaqiriladi; hozircha `POST /api/logs/cleanup` orqali qo'lda ishga tushiriladi.
 */
export async function cleanupOldLogs(db: PrismaClient): Promise<number> {
  const day = 24 * 60 * 60 * 1000;
  const resolvedCutoff = new Date(Date.now() - RESOLVED_TTL_DAYS * day);
  const unresolvedCutoff = new Date(Date.now() - UNRESOLVED_TTL_DAYS * day);

  const result = await db.errorLog.deleteMany({
    where: {
      OR: [
        { isResolved: true, lastSeenAt: { lt: resolvedCutoff } },
        { isResolved: false, lastSeenAt: { lt: unresolvedCutoff } },
      ],
    },
  });
  return result.count;
}

/**
 * Hodisani fonda jurnalga yozadi va so'rovni bloklamaydi.
 *
 * `waitUntil` mavjud bo'lmagan muhitda (lokal harness) oddiy `void` bilan
 * ishga tushiriladi. Chaqiruvchi kod `await` qilishi SHART EMAS.
 */
export function logEvent(
  ctx: { get: (key: 'db') => PrismaClient; executionCtx?: { waitUntil: (p: Promise<unknown>) => void } },
  input: LogInput
): void {
  const write = recordError(ctx.get('db'), input);
  try {
    ctx.executionCtx?.waitUntil(write);
  } catch {
    void write;
  }
}
