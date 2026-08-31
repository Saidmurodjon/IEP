import type { PrismaClient } from '@prisma/client';
import { reindexOneSql, type SearchTable } from '@energetika/shared';
import { logEvent } from './error-log';

export { SEARCH_TABLES, VECTOR_SQL, reindexAllSql, reindexOneSql } from '@energetika/shared';
export type { SearchTable } from '@energetika/shared';

/**
 * Bitta yozuvning qidiruv vektorini qayta hisoblaydi.
 *
 * Xato bo'lsa **tashlanmaydi**: kontent allaqachon saqlangan, foydalanuvchi
 * 500 ko'rmasligi kerak. Buning o'rniga jurnalga `warning` tushadi va yozuv
 * qidiruvda topilmay qoladi — buni jurnal orqali sezish mumkin.
 */
export async function reindex(
  ctx: {
    get: (key: 'db') => PrismaClient;
    executionCtx?: { waitUntil: (p: Promise<unknown>) => void };
  },
  table: SearchTable,
  id: string
): Promise<void> {
  const db = ctx.get('db');
  try {
    await db.$executeRawUnsafe(reindexOneSql(table), id);
  } catch (error) {
    logEvent(ctx, {
      source: 'server',
      level: 'warning',
      code: 'SEARCH_INDEX_FAILED',
      message: `Search vector not updated for ${table}/${id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
