import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { PrismaClient } from '@prisma/client';
import { clearRunning, createFileSink, markRunning, replayFallback } from '../crash-log';
import { recordError, setFallbackSink, writeFallback } from '../error-log';

const SECRET_URL = 'postgresql://neondb_owner:SuperSecret@db.example.com/neondb';

/** Bazaning minimal soxtasi: yozuvlarni xotirada saqlaydi yoki doim yiqiladi. */
function fakeDb(fail = false) {
  const rows: Array<Record<string, unknown>> = [];
  const broken = () => Promise.reject(new Error('connect ECONNREFUSED'));
  const db = {
    errorLog: {
      findUnique: () => (fail ? broken() : Promise.resolve(null)),
      create: ({ data }: { data: Record<string, unknown> }) => {
        rows.push(data);
        return Promise.resolve(data);
      },
      count: () => Promise.resolve(rows.length),
    },
  };
  return { db: db as unknown as PrismaClient, rows };
}

let dir: string;
const pendingFile = () => join(dir, 'pending-errors.jsonl');

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'iep-crash-log-'));
  setFallbackSink(createFileSink(dir));
});
afterEach(() => {
  setFallbackSink(null);
  rmSync(dir, { recursive: true, force: true });
});

describe('zaxira fayl', () => {
  it('baza ishlamasa yozuv faylga tushadi, maxfiy qism tozalangan holda', async () => {
    const { db } = fakeDb(true);
    await recordError(db, { source: 'server', code: 'DB_DOWN', message: `failed: ${SECRET_URL}` });

    const content = readFileSync(pendingFile(), 'utf8');
    expect(content).toContain('DB_DOWN');
    expect(content).not.toContain('SuperSecret');
  });

  it('writeFallback ham tozalaydi', () => {
    writeFallback({ source: 'server', message: `boot: ${SECRET_URL}` });
    expect(readFileSync(pendingFile(), 'utf8')).not.toContain('SuperSecret');
  });

  it('keyingi ishga tushishda bazaga asl vaqt bilan ko\'chadi va fayl o\'chadi', async () => {
    writeFallback({ source: 'server', code: 'PROCESS_START_FAILED', message: 'JWT_SECRET is not configured' }, new Date('2026-10-01T00:00:00Z'));
    writeFileSync(pendingFile(), 'buzilgan qator\n', { flag: 'a' });

    const { db, rows } = fakeDb();
    expect(await replayFallback(db, dir)).toBe(1);
    expect(rows[0]).toMatchObject({ code: 'PROCESS_START_FAILED' });
    expect((rows[0].firstSeenAt as Date).toISOString()).toBe('2026-10-01T00:00:00.000Z');
    expect(existsSync(pendingFile())).toBe(false);
  });

  it('ko\'chirishda baza yana yiqilsa yozuv faylga qaytadi', async () => {
    writeFallback({ source: 'server', code: 'X', message: 'still down' });
    const { db } = fakeDb(true);
    await replayFallback(db, dir);
    expect(readFileSync(pendingFile(), 'utf8')).toContain('still down');
  });
});

describe('ishlash belgisi', () => {
  it('egasi o\'lgan belgini topadi, o\'zinikini qoldiradi', () => {
    mkdirSync(join(dir, 'run'), { recursive: true });
    // Bunday pid amalda mavjud emas.
    writeFileSync(join(dir, 'run', '999999'), '2026-10-01T00:00:00.000Z');

    const stale = markRunning(dir);
    expect(stale).toEqual([{ pid: 999999, startedAt: '2026-10-01T00:00:00.000Z' }]);
    expect(existsSync(join(dir, 'run', String(process.pid)))).toBe(true);
    expect(markRunning(dir)).toEqual([]);

    clearRunning(dir);
    expect(existsSync(join(dir, 'run', String(process.pid)))).toBe(false);
  });
});
