import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

export function getDb(databaseUrl: string): PrismaClient {
  if (!_prisma) {
    // Neon HTTP drayveri uchun `PrismaNeonHTTP` ishlatiladi.
    // `PrismaNeon` esa WebSocket `Pool` uchun mo'ljallangan va `PoolConfig`
    // kutadi — unga `neon()` natijasini uzatish connection string'ni
    // umuman yo'qotadi ("No database host or connection string was set").
    const adapter = new PrismaNeonHTTP(databaseUrl, {});
    _prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }
  return _prisma;
}
