import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { recordError, type FallbackSink, type LogInput } from './error-log';

/**
 * Jarayon darajasidagi xatolar uchun disk yordamchilari — FAQAT Node kirish
 * nuqtasi (`src/node.ts`) uchun, Workers bundle'iga tushmaydi.
 *
 * Ikki vazifa:
 * 1. **Zaxira fayl** — baza ishlamay qolganda (yoki jarayon ishga tushmay
 *    yiqilganda) yozuv JSONL faylga tushadi, keyingi muvaffaqiyatli ishga
 *    tushishda bazaga ko'chiriladi. Faylga faqat tozalangan yozuv yoziladi.
 * 2. **Ishlash belgisi** — har bir jarayon `run/<pid>` faylini qoldiradi va
 *    to'g'ri to'xtaganda o'chiradi. Keyingi ishga tushishda egasi tirik bo'lmagan
 *    belgi qolgan bo'lsa — jarayon ogohlantirishsiz o'ldirilgan (SIGKILL, xotira
 *    yoki hosting limiti). Bunday to'xtashni jarayonning o'zi qayd eta olmaydi.
 */

/** Zaxira fayl shundan kattalashsa yangi yozuvlar tashlanadi — disk to'lmasin. */
const MAX_FALLBACK_BYTES = 1024 * 1024;

export function createFileSink(dir: string): FallbackSink {
  const file = join(dir, 'pending-errors.jsonl');
  return (entry) => {
    mkdirSync(dir, { recursive: true });
    if (existsSync(file) && statSync(file).size > MAX_FALLBACK_BYTES) return;
    // Sinxron: jarayon yiqilayotganda asinxron yozuv tugamay qolishi mumkin.
    appendFileSync(file, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
  };
}

function isLogEntry(value: unknown): value is LogInput & { at: string } {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.source === 'server' || v.source === 'client') &&
    typeof v.message === 'string' &&
    typeof v.at === 'string' &&
    !Number.isNaN(Date.parse(v.at))
  );
}

/**
 * Zaxira fayldagi yozuvlarni bazaga ko'chiradi. Fayl avval boshqa nomga
 * o'tkaziladi — ko'chirish paytida yana xato bo'lsa, `recordError` uni yangi
 * faylga qaytadan yozadi, hech narsa yo'qolmaydi. Qaytaradi: ko'chirilganlar soni.
 */
export async function replayFallback(db: PrismaClient, dir: string): Promise<number> {
  const file = join(dir, 'pending-errors.jsonl');
  if (!existsSync(file)) return 0;
  const replaying = `${file}.${process.pid}.replay`;
  renameSync(file, replaying);

  let count = 0;
  for (const line of readFileSync(replaying, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }
    if (!isLogEntry(parsed)) continue;
    const { at, ...input } = parsed;
    await recordError(db, input, { force: true, at: new Date(at) });
    count++;
  }
  rmSync(replaying, { force: true });
  return count;
}

export interface StaleRun {
  pid: number;
  startedAt: string;
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // EPERM — jarayon bor, lekin boshqa foydalanuvchiniki.
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

/**
 * Joriy jarayon belgisini yozadi va egasi tirik bo'lmagan eski belgilarni
 * qaytaradi (o'chirib). Passenger bir vaqtda bir nechta jarayon ishlatishi
 * mumkin, shuning uchun belgi pid bo'yicha alohida.
 */
export function markRunning(dir: string): StaleRun[] {
  const runDir = join(dir, 'run');
  mkdirSync(runDir, { recursive: true });

  const stale: StaleRun[] = [];
  for (const name of readdirSync(runDir)) {
    const pid = Number(name);
    if (!Number.isInteger(pid) || pid === process.pid || isAlive(pid)) continue;
    const path = join(runDir, name);
    stale.push({ pid, startedAt: readFileSync(path, 'utf8').trim() });
    rmSync(path, { force: true });
  }

  writeFileSync(join(runDir, String(process.pid)), new Date().toISOString());
  return stale;
}

/** To'g'ri to'xtashda (yoki yiqilish qayd etilgach) belgini o'chiradi. */
export function clearRunning(dir: string): void {
  rmSync(join(dir, 'run', String(process.pid)), { force: true });
}
