import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

let _prisma: PrismaClient | null = null;

/**
 * Node kirish nuqtasi (`src/node.ts`) oddiy PostgreSQL uchun o'z klientini
 * shu yerda o'rnatadi — shunda Neon HTTP drayveri umuman ishlatilmaydi.
 * Workers'da chaqirilmaydi.
 */
export function setDb(client: PrismaClient): void {
  _prisma = client;
}

export function getDb(databaseUrl: string): PrismaClient {
  if (!_prisma) {
    // Neon HTTP drayveri uchun `PrismaNeonHTTP` ishlatiladi.
    // `PrismaNeon` esa WebSocket `Pool` uchun mo'ljallangan va `PoolConfig`
    // kutadi — unga `neon()` natijasini uzatish connection string'ni
    // umuman yo'qotadi ("No database host or connection string was set").
    //
    // Lokal ishlab chiqishda (host `neon.tech` emas) haqiqiy Neon o'rniga
    // `local-neon-http-proxy` (`iep-neon-proxy`, port 4444) ishlatiladi — u
    // Neon HTTP protokolini oddiy Postgres'ga tarjima qiladi. Drayver
    // manzilni ulanish satridan o'zi hisoblab, HTTPS/443'ni taxmin qiladi,
    // shuning uchun proksi manzili qo'lda ko'rsatilishi kerak
    // (`packages/db/src/test-content.ts` bilan bir xil naqsh).
    if (!/neon\.tech/.test(databaseUrl)) {
      const { hostname, port } = new URL(databaseUrl.replace(/^postgres(ql)?:/, 'http:'));
      const proxyUrl = `http://${hostname}:${port || '4444'}/sql`;
      neonConfig.fetchEndpoint = () => proxyUrl;
      neonConfig.useSecureWebSocket = false;
      neonConfig.poolQueryViaFetch = true;
    }
    const adapter = new PrismaNeonHTTP(databaseUrl, {});
    _prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
  }
  return _prisma;
}
