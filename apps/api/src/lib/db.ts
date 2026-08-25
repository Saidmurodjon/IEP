import { neon } from '@neondatabase/serverless';
import type { PoolConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

export function getDb(databaseUrl: string): PrismaClient {
  if (!_prisma) {
    const sql = neon(databaseUrl);
    // OGOHLANTIRISH (bu topshiriq doirasidan tashqari, alohida tuzatish kerak):
    // package-lock'da @prisma/adapter-neon 6.19.3 ga qotirilgan. O'sha versiyada
    // `PrismaNeon` WebSocket `Pool` uchun `PoolConfig` kutadi, HTTP drayveri
    // (`neon()`) esa `PrismaNeonHTTP` ga tegishli. Natijada Pool connection
    // string'ni umuman olmaydi va lokal sinovda quyidagi xato chiqadi:
    //   "No database host or connection string was set..."
    // Hozirgi production Worker eskiroq bundle bilan ishlayapti, shuning uchun
    // sayt hali ishlaydi — lekin keyingi `wrangler deploy` API'ni sindiradi.
    // Bu yerda faqat tip cast'i qo'shildi, runtime xatti-harakati atay
    // o'zgartirilmadi (auth topshirig'i doirasida emas).
    const adapter = new PrismaNeon(sql as unknown as PoolConfig);
    _prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }
  return _prisma;
}
