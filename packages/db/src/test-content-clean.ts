/**
 * 14-topshiriq test ma'lumotlarini olib tashlaydi — FAQAT lokal baza.
 *
 * `npm run db:test:clean`. Barcha `test-` prefiksli yozuvlarni o'chiradi,
 * so'ng fayllarni ombordan tozalash uchun `POST /api/uploads/cleanup`ni
 * chaqiradi (mavjud "egasiz fayl" mantig'idan foydalanadi — CLAUDE.md
 * 17-qoida: ombor bo'ylab ommaviy o'chirish hech qachon qilinmaydi, faqat
 * `media_files`da qayd etilgan kalitlar bo'yicha).
 */
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { reindexAllSql, SEARCH_TABLES } from '@energetika/shared';

function assertLocalDatabase(url: string | undefined): asserts url is string {
  if (!url) throw new Error('DATABASE_URL o\'rnatilmagan.');
  const isLocal = /@(localhost|127\.0\.0\.1|iep-pg|iep-neon-proxy)[:/]/.test(url);
  if (!isLocal && process.env.ALLOW_REMOTE_TEST_CONTENT !== 'yes') {
    throw new Error(
      'Bu skript FAQAT lokal baza uchun. DATABASE_URL lokal emas.\n' +
        'Test ma\'lumotini production bazasidan tozalash bu skript orqali qilinmaydi.'
    );
  }
}

assertLocalDatabase(process.env.DATABASE_URL);
const DATABASE_URL = process.env.DATABASE_URL;

/** `local-neon-http-proxy` orqali ishlaganda — `lib/db.ts`, `test-content.ts` bilan bir xil. */
if (!/neon\.tech/.test(DATABASE_URL)) {
  const { hostname, port } = new URL(DATABASE_URL.replace(/^postgres(ql)?:/, 'http:'));
  const proxyUrl = `http://${hostname}:${port || '4444'}/sql`;
  neonConfig.fetchEndpoint = () => proxyUrl;
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const API_URL = process.env.TEST_CONTENT_API_URL ?? 'http://localhost:3000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const db = (() => {
  const adapter = new PrismaNeonHTTP(DATABASE_URL, {});
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
})();

async function login(): Promise<string> {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD o\'rnatilmagan.');
  }
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login muvaffaqiyatsiz (${res.status}).`);
  const json = (await res.json()) as { data: { token: string } };
  return json.data.token;
}

async function main(): Promise<void> {
  console.log("Test ma'lumotlari tozalanmoqda...\n");

  const empResult = await db.employee.deleteMany({ where: { id: { startsWith: 'test-' } } });
  const partnerResult = await db.partner.deleteMany({ where: { id: { startsWith: 'test-' } } });
  const newsResult = await db.news.deleteMany({ where: { slug: { startsWith: 'test-' } } });
  const pubResult = await db.publication.deleteMany({ where: { id: { startsWith: 'test-' } } });
  const docResult = await db.document.deleteMany({ where: { id: { startsWith: 'test-' } } });
  const msgResult = await db.contactMessage.deleteMany({ where: { ticketNumber: { startsWith: 'M-2026-900' } } });
  const errResult = await db.errorLog.deleteMany({ where: { fingerprint: { startsWith: 'test-' } } });

  console.log(`✓ Xodimlar: ${empResult.count}`);
  console.log(`✓ Hamkorlar: ${partnerResult.count}`);
  console.log(`✓ Yangiliklar: ${newsResult.count}`);
  console.log(`✓ Nashrlar: ${pubResult.count}`);
  console.log(`✓ Hujjatlar: ${docResult.count}`);
  console.log(`✓ Murojaatlar: ${msgResult.count}`);
  console.log(`✓ Xatolik yozuvlari: ${errResult.count}`);

  // Fayllar: yozuvlar allaqachon o'chirilgani uchun `test-` bilan boshlanadigan
  // MediaFile'lar endi "egasiz" — ularni shu holatga o'tkazib, mavjud
  // tozalash yo'lidan (`/api/uploads/cleanup`) foydalanamiz (bu ombordan HAM
  // o'chiradi). Yosh chegarasi (24 soat) bu yozuvlar uchun chetlab o'tiladi —
  // `createdAt` ataylab eski sanaga o'tkaziladi, faqat SHU yozuvlar uchun.
  const testFiles = await db.mediaFile.findMany({
    where: { originalName: { startsWith: 'test-' } },
    select: { id: true, key: true },
  });
  if (testFiles.length > 0) {
    // `updateMany()` EMAS — `PrismaNeonHTTP` bilan "Transactions are not
    // supported in HTTP mode" bilan yiqiladi (`test-content.ts`dagi izohga
    // qarang). Xom SQL orqali bitta so'rovda yangilanadi.
    await db.$executeRawUnsafe(
      `UPDATE media_files SET "ownerType" = NULL, "ownerId" = NULL, "createdAt" = '2000-01-01'
       WHERE id = ANY($1::text[])`,
      testFiles.map((f) => f.id)
    );
    const token = await login();
    const res = await fetch(`${API_URL}/api/uploads/cleanup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error(`⚠️  /api/uploads/cleanup muvaffaqiyatsiz (${res.status}) — fayllar bazada egasiz qoldi.`);
    } else {
      const json = (await res.json()) as { data: { deleted: number } };
      console.log(`✓ Fayllar ombordan tozalandi: ${json.data.deleted}`);
    }
  } else {
    console.log('✓ Tozalanadigan fayl topilmadi');
  }

  console.log('\nQidiruv indeksi qayta hisoblanmoqda...');
  for (const table of SEARCH_TABLES) {
    await db.$executeRawUnsafe(reindexAllSql(table));
  }
  console.log('✓ Qidiruv indeksi yangilandi');

  console.log('\n✅ Test ma\'lumotlari tozalandi.');
}

main()
  .catch((err: unknown) => {
    console.error('\n❌ Tozalash muvaffaqiyatsiz:', err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
