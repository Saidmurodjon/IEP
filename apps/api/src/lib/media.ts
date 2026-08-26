import type { PrismaClient } from '@prisma/client';
import { hasStorage, getStorage } from './storage';
import type { Env } from '../index';

/**
 * Fayllarni ombordan tozalash.
 *
 * MUHIM: o'chirish FAQAT `media_files` jadvalida qayd etilgan kalitlar
 * bo'yicha bajariladi. Ombor bo'ylab ommaviy o'chirish (`list()` + `delete`)
 * hech qachon qilinmaydi (07-topshiriq, 7-bo'lim).
 */

/** Matndan `/api/files/...` ko'rinishidagi barcha kalitlarni ajratib oladi. */
export function extractFileKeys(...htmlParts: Array<string | null | undefined>): string[] {
  const keys = new Set<string>();
  const pattern = /\/api\/files\/(\d{4}\/\d{2}\/[0-9a-f-]{36}\.[a-z0-9]{2,5})/g;
  for (const part of htmlParts) {
    if (typeof part !== 'string') continue;
    for (const match of part.matchAll(pattern)) keys.add(match[1]);
  }
  return [...keys];
}

/** Berilgan kalitlarni ombordan va jadvaldan o'chiradi. */
export async function deleteKeys(env: Env, db: PrismaClient, keys: string[]): Promise<number> {
  if (keys.length === 0) return 0;
  if (hasStorage(env)) {
    const bucket = getStorage(env);
    for (const key of keys) {
      try {
        await bucket.delete(key);
      } catch (err) {
        // Ombor xatosi bazani tozalashga to'sqinlik qilmasin — qayta urinish
        // uchun yozuv qolishidan ko'ra, yozuvni o'chirib jurnalga yozamiz.
        console.error('R2 delete failed:', err instanceof Error ? err.message : err);
      }
    }
  }
  const result = await db.mediaFile.deleteMany({ where: { key: { in: keys } } });
  return result.count;
}

/**
 * Yozuv saqlanganda matn ichidagi rasmlarni yozuvga biriktiradi va endi
 * ishlatilmayotganlarini o'chiradi.
 *
 * Shu tufayli moderator rasmni matndan olib tashlab saqlasa, ombor
 * o'z-o'zidan tozalanadi.
 */
export async function syncContentFiles(
  env: Env,
  db: PrismaClient,
  ownerType: string,
  ownerId: string,
  htmlParts: Array<string | null | undefined>
): Promise<void> {
  const used = extractFileKeys(...htmlParts);

  // Matnda uchragan fayllar shu yozuvga biriktiriladi.
  if (used.length > 0) {
    await db.mediaFile.updateMany({
      where: { key: { in: used } },
      data: { ownerType, ownerId },
    });
  }

  // Ilgari shu yozuvga tegishli bo'lgan, lekin endi matnda yo'q fayllar.
  const stale = await db.mediaFile.findMany({
    where: { ownerType, ownerId, key: { notIn: used.length ? used : ['—'] } },
    select: { key: true },
  });
  await deleteKeys(env, db, stale.map((row) => row.key));
}

/** Yozuv o'chirilganda unga tegishli barcha fayllarni o'chiradi. */
export async function deleteOwnerFiles(
  env: Env,
  db: PrismaClient,
  ownerType: string,
  ownerId: string
): Promise<number> {
  const rows = await db.mediaFile.findMany({
    where: { ownerType, ownerId },
    select: { key: true },
  });
  return deleteKeys(env, db, rows.map((row) => row.key));
}

/**
 * Bitta maydondagi fayl almashtirilganda eskisini o'chiradi.
 * `oldUrl`/`newUrl` — `/api/files/<key>` yoki tashqi havola bo'lishi mumkin.
 */
export async function replaceSingleFile(
  env: Env,
  db: PrismaClient,
  oldUrl: string | null | undefined,
  newUrl: string | null | undefined
): Promise<void> {
  const [oldKey] = extractFileKeys(oldUrl);
  const [newKey] = extractFileKeys(newUrl);
  if (oldKey && oldKey !== newKey) {
    await deleteKeys(env, db, [oldKey]);
  }
}
