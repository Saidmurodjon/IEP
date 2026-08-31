// Sayt bo'ylab to'liq matnli qidiruv uchun SQL ifodalari.
//
// Bu fayl SHARED paketda turadi, chunki uni ikki joy ishlatadi:
//   * API — yozuv saqlanganda vektorni yangilaydi (`lib/search-index.ts`),
//   * seed — bazaga qo'yilgan yozuvlarni indekslaydi (`packages/db/src/seed.ts`).
// Ikki nusxa bo'lsa, ular vaqt o'tib bir-biridan uzoqlashadi.

/**
 * Sayt bo'ylab to'liq matnli qidiruv indeksi (373-son qaror, 11-band).
 *
 * **Til sozlamasi `simple`.** PostgreSQL da o'zbek tili uchun lug'at yo'q,
 * shuning uchun morfologik tahlil (`to_tsvector('russian', ...)` kabi)
 * ishlamaydi. `simple` so'zlarni faqat kichik harfga o'giradi va ajratadi —
 * bizning holatimizda shu yetarli, chunki qidiruv prefiks bo'yicha (`so'z:*`)
 * bajariladi.
 *
 * **Vektor DASTUR KODIDA yangilanadi, trigger bilan emas** — Prisma
 * migratsiyalari bilan trigger boshqarish murakkablashadi (topshiriq 10, A1).
 * Har bir yozuv saqlangandan keyin `reindex()` chaqiriladi.
 *
 * DIQQAT: bu yerdagi ifodalar `packages/db/prisma/migrations/7_search_vectors/
 * migration.sql` dagi to'ldirish (backfill) ifodalari bilan **bir xil** bo'lishi
 * shart. Mos kelishini `__tests__/search-index.test.ts` tekshiradi.
 */
export const SEARCH_TABLES = [
  'news',
  'publications',
  'documents',
  'employees',
  'structure_units',
] as const;

export type SearchTable = (typeof SEARCH_TABLES)[number];

/** Oddiy matn ustuni. `null` bo'sh satrga aylanadi. */
const plain = (column: string) => `coalesce("${column}", '')`;

/**
 * HTML saqlaydigan ustun. Teglar indeksga tushmasligi kerak, aks holda
 * `div` yoki `href` kabi so'zlar bo'yicha natija chiqadi.
 */
const stripHtml = (column: string) =>
  `regexp_replace(coalesce("${column}", ''), '<[^>]*>', ' ', 'g')`;

const joinCols = (parts: string[]) => parts.join(" || ' ' || ");

/**
 * Vazn: `A` — sarlavha, `B` — qisqa tavsif, `C` — asosiy matn.
 * `ts_rank` shu vaznlarni hisobga oladi, ya'ni sarlavhada topilgan so'z
 * matn ichida topilganidan yuqori turadi.
 */
const weigh = (expression: string, weight: 'A' | 'B' | 'C') =>
  `setweight(to_tsvector('simple', ${expression}), '${weight}')`;

/** Uchala tildagi bir xil maydon bitta vektorga qo'shiladi. */
const trilingual = (prefix: string, suffix = '') =>
  [`${prefix}Uz${suffix}`, `${prefix}En${suffix}`, `${prefix}Ru${suffix}`];

/** Har bir jadval uchun `searchVector` ustunini hisoblaydigan SQL ifoda. */
export const VECTOR_SQL: Record<SearchTable, string> = {
  news: [
    weigh(joinCols(trilingual('title').map(plain)), 'A'),
    weigh(joinCols(trilingual('summary').map(plain)), 'B'),
    weigh(joinCols(trilingual('content').map(stripHtml)), 'C'),
  ].join(' || '),

  publications: [
    weigh(joinCols(trilingual('title').map(plain)), 'A'),
    weigh(plain('authors'), 'B'),
    weigh(joinCols([plain('journal'), plain('doi'), `coalesce("year"::text, '')`]), 'C'),
  ].join(' || '),

  documents: [
    weigh(joinCols(trilingual('title').map(plain)), 'A'),
    weigh(joinCols(trilingual('description').map(stripHtml)), 'B'),
    weigh(plain('documentNumber'), 'C'),
  ].join(' || '),

  employees: [
    weigh(joinCols(trilingual('fullName').map(plain)), 'A'),
    weigh(joinCols(trilingual('position').map(plain)), 'B'),
    weigh(
      joinCols([
        ...trilingual('degree').map(plain),
        ...trilingual('title').map(plain),
        ...trilingual('researchArea').map(plain),
      ]),
      'C'
    ),
  ].join(' || '),

  structure_units: [
    weigh(joinCols(trilingual('name').map(plain)), 'A'),
    weigh(joinCols(trilingual('description').map(stripHtml)), 'B'),
    weigh(plain('head'), 'C'),
  ].join(' || '),
};


/**
 * Bitta jadvalning HAMMA yozuvini qayta indekslaydi.
 *
 * Seed va migratsiyadan keyin ishlatiladi: Prisma orqali yozilgan yozuvlarda
 * `searchVector` bo'sh qoladi va ular qidiruvda topilmaydi.
 */
export function reindexAllSql(table: SearchTable): string {
  return `UPDATE "${table}" SET "searchVector" = ${VECTOR_SQL[table]}`;
}

/** Bitta yozuv uchun. `$1` — yozuv `id` si. */
export function reindexOneSql(table: SearchTable): string {
  return `UPDATE "${table}" SET "searchVector" = ${VECTOR_SQL[table]} WHERE "id" = $1`;
}
