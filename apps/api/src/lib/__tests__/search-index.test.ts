import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEARCH_TABLES, VECTOR_SQL } from '../search-index';
import { toTsQuery } from '../../routes/search';

/**
 * Qidiruv indeksi uchun birlik sinovlari.
 *
 * Eng muhimi — `VECTOR_SQL` bilan migratsiyadagi to'ldirish ifodalari BIR XIL
 * bo'lishi. Farq bo'lsa, eski yozuvlar boshqa qoida bo'yicha indekslanadi va
 * qidiruv ko'zga tashlanmaydigan tarzda buziladi.
 */

const here = dirname(fileURLToPath(import.meta.url));
const migration = readFileSync(
  resolve(here, '../../../../../packages/db/prisma/migrations/7_search_vectors/migration.sql'),
  'utf8'
);

describe('VECTOR_SQL va migratsiya', () => {
  it('har bir jadval uchun ustun va GIN indeks yaratiladi', () => {
    for (const table of SEARCH_TABLES) {
      expect(migration).toContain(`ALTER TABLE "${table}" ADD COLUMN "searchVector" tsvector;`);
      expect(migration).toContain(
        `CREATE INDEX "${table}_searchVector_idx" ON "${table}" USING GIN ("searchVector");`
      );
    }
  });

  it('to\'ldirish ifodasi VECTOR_SQL bilan aynan bir xil', () => {
    for (const table of SEARCH_TABLES) {
      expect(migration).toContain(`UPDATE "${table}" SET "searchVector" = ${VECTOR_SQL[table]};`);
    }
  });

  it('uchala til ham indeksga tushadi', () => {
    for (const table of SEARCH_TABLES) {
      const sql = VECTOR_SQL[table];
      expect(sql).toMatch(/Uz"/);
      expect(sql).toMatch(/En"/);
      expect(sql).toMatch(/Ru"/);
    }
  });

  it('sarlavha eng yuqori vaznda (A)', () => {
    for (const table of SEARCH_TABLES) {
      expect(VECTOR_SQL[table].indexOf("'A'")).toBeGreaterThan(-1);
      expect(VECTOR_SQL[table].indexOf("'A'")).toBeLessThan(VECTOR_SQL[table].indexOf("'B'"));
    }
  });

  it("HTML saqlaydigan maydonlardan teglar olib tashlanadi", () => {
    expect(VECTOR_SQL.news).toContain(`regexp_replace(coalesce("contentUz", ''), '<[^>]*>', ' ', 'g')`);
  });

  it('lug\'at hamma joyda `simple`', () => {
    for (const table of SEARCH_TABLES) {
      expect(VECTOR_SQL[table]).not.toMatch(/to_tsvector\('(?!simple)/);
    }
  });
});

describe('toTsQuery', () => {
  it('har bir so\'zga prefiks belgisini qo\'yadi va & bilan bog\'laydi', () => {
    expect(toTsQuery('energetika muammolari')).toBe("'energetika':* & 'muammolari':*");
  });

  it('apostrofni ikkilantiradi — tsquery sintaksisi buzilmaydi', () => {
    expect(toTsQuery("o'zbekiston")).toBe("'o''zbekiston':*");
  });

  it('egri apostrof (’) oddiysiga keltiriladi', () => {
    expect(toTsQuery('o’zbekiston')).toBe("'o''zbekiston':*");
  });

  it('tsquery operatorlari matn sifatida qaralmaydi', () => {
    expect(toTsQuery('a & b | !c')).toBe("'a':* & 'b':* & 'c':*");
  });

  it('kirill va raqam ham qidiriladi', () => {
    expect(toTsQuery('Энергетика 2025')).toBe("'Энергетика':* & '2025':*");
  });

  it('faqat tinish belgilaridan iborat so\'rov bo\'sh qaytadi', () => {
    expect(toTsQuery('---!!!')).toBe('');
  });

  it('so\'zlar soni o\'nta bilan cheklanadi', () => {
    const many = Array.from({ length: 30 }, (_, i) => `w${i}`).join(' ');
    expect(toTsQuery(many).split('&')).toHaveLength(10);
  });
});
