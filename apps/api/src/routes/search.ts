import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { fail } from '../lib/errors';
import { clientIp, createStore, overLimit } from '../lib/rate-limit';
import type { SearchTable } from '../lib/search-index';
import type { AppContext } from '../index';

export const searchRouter = new Hono<AppContext>();

/** Ochiq API dagi bo'lim nomlari. */
const SEARCH_TYPES = ['news', 'publications', 'documents', 'employees', 'structure'] as const;
type SearchType = (typeof SEARCH_TYPES)[number];

const LANGS = ['uz', 'en', 'ru'] as const;
type Lang = (typeof LANGS)[number];

/** Bitta IP uchun daqiqasiga qabul qilinadigan so'rovlar (topshiriq 10, A2). */
const LIMIT_PER_MINUTE = 30;
const searchHits = createStore();

const querySchema = z.object({
  // Bir belgili so'rov rad etiladi: 'simple' lug'atida u butun bazani qaytaradi.
  q: z.string().min(2).max(100),
  type: z.enum(['all', ...SEARCH_TYPES]).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  lang: z.enum(LANGS).optional(),
  page: z.coerce.number().int().min(1).max(1000).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/** Til bo'yicha ustun: bo'sh bo'lsa o'zbekchasiga qaytadi. */
function localized(prefix: string, lang: Lang, suffix = ''): string {
  const cap = lang.charAt(0).toUpperCase() + lang.slice(1);
  const own = `"${prefix}${cap}${suffix}"`;
  const fallback = `"${prefix}Uz${suffix}"`;
  return `coalesce(NULLIF(btrim(${own}), ''), ${fallback}, '')`;
}

/** HTML saqlaydigan maydondan teglarni olib tashlaydi. */
function stripHtml(expression: string): string {
  return `regexp_replace(${expression}, '<[^>]*>', ' ', 'g')`;
}

interface TypeConfig {
  table: SearchTable;
  /** Faqat ochiq yozuvlar ko'rinsin (qoralama, arxivlangan hujjat chiqmasin). */
  filter: string | null;
  /** Sana filtri qaysi ustunga qo'llanadi. */
  dateSql: string;
  /** Natijadagi havola — TIL PREFIKSISIZ (prefiksni frontend qo'yadi). */
  urlSql: string;
  title: (lang: Lang) => string;
  /** Parcha (`snippet`) olinadigan matn. */
  body: (lang: Lang) => string;
}

const TYPES: Record<SearchType, TypeConfig> = {
  news: {
    table: 'news',
    filter: '"isPublished" = true',
    dateSql: '"publishedAt"::timestamp',
    urlSql: `'/news/' || "slug"`,
    title: (lang) => localized('title', lang),
    body: (lang) => `${localized('summary', lang)} || ' ' || ${stripHtml(localized('content', lang))}`,
  },
  publications: {
    table: 'publications',
    filter: null,
    dateSql: 'make_date("year", 1, 1)::timestamp',
    urlSql: `'/publications'`,
    title: (lang) => localized('title', lang),
    body: () => `"authors" || ' ' || coalesce("journal", '') || ' ' || "year"::text`,
  },
  documents: {
    table: 'documents',
    filter: '"isActive" = true',
    dateSql: 'coalesce("documentDate", "createdAt")::timestamp',
    urlSql: `'/documents'`,
    title: (lang) => localized('title', lang),
    body: (lang) =>
      `${stripHtml(localized('description', lang))} || ' ' || coalesce("documentNumber", '')`,
  },
  employees: {
    table: 'employees',
    filter: '"isActive" = true',
    dateSql: '"createdAt"::timestamp',
    urlSql: `'/employees'`,
    title: (lang) => localized('fullName', lang),
    body: (lang) =>
      `${localized('position', lang)} || ' ' || ${localized('researchArea', lang)} || ' ' || ${localized('degree', lang)}`,
  },
  structure: {
    table: 'structure_units',
    filter: null,
    dateSql: '"createdAt"::timestamp',
    // Laboratoriyaning alohida sahifasi bor, qolgan bo'linmalar tuzilma sahifasida.
    urlSql: `CASE WHEN "type" = 'laboratory' THEN '/laboratories/' || "id" ELSE '/structure' END`,
    title: (lang) => localized('name', lang),
    body: (lang) => `${stripHtml(localized('description', lang))} || ' ' || coalesce("head", '')`,
  },
};

/**
 * Foydalanuvchi so'rovini `tsquery` satriga aylantiradi.
 *
 * Har bir so'z bittalik qo'shtirnoq ichiga olinadi (ichidagi `'` ikkilanadi),
 * shuning uchun `o'zbek` kabi so'zlar `tsquery` sintaksisini buzmaydi.
 * Prefiks belgisi `:*` qo'yiladi — `simple` lug'ati so'z o'zagini ajratmaydi,
 * shusiz `energetika` so'rovi `energetikasi` ni topmaydi.
 *
 * Bo'sh natija qaytsa, qidiradigan so'z qolmagan.
 */
export function toTsQuery(input: string): string {
  return input
    .split(/[^\p{L}\p{N}'’]+/u)
    .map((word) => word.replace(/’/g, "'").trim())
    .filter((word) => word.length > 0)
    .slice(0, 10)
    .map((word) => `'${word.replace(/'/g, "''")}':*`)
    .join(' & ');
}

/** Bitta jadval uchun UNION bo'lagi. Ustunlar tartibi hamma turda bir xil. */
function subQuery(type: SearchType, lang: Lang, withSnippet: boolean): string {
  const cfg = TYPES[type];
  const snippet = withSnippet
    ? `ts_headline('simple', ${cfg.body(lang)}, q.query,
        'StartSel=<mark>, StopSel=</mark>, MaxWords=30, MinWords=15, ShortWord=2, MaxFragments=2, FragmentDelimiter=" … "')`
    : `''`;

  const conditions = ['"searchVector" @@ q.query'];
  if (cfg.filter) conditions.push(cfg.filter);
  conditions.push(`($2::timestamp IS NULL OR ${cfg.dateSql} >= $2::timestamp)`);
  // `to` — SHU KUNNI o'z ichiga oladi, shuning uchun keyingi kunning boshigacha.
  conditions.push(
    `($3::timestamp IS NULL OR ${cfg.dateSql} < $3::timestamp + interval '1 day')`
  );

  return `SELECT '${type}'::text AS type,
      "id"::text AS id,
      ${cfg.title(lang)} AS title,
      ${snippet} AS snippet,
      ${cfg.urlSql} AS url,
      to_char(${cfg.dateSql}, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
      ts_rank("searchVector", q.query) AS rank
    FROM "${cfg.table}", q
    WHERE ${conditions.join(' AND ')}`;
}

interface Row {
  type: SearchType;
  id: string;
  title: string;
  snippet: string;
  url: string;
  /** ISO-8601 satr. Sana SQL da matnga o'giriladi — tartiblash ham shu ustun
   *  bo'yicha ketadi va ISO satrlari leksikografik jihatdan to'g'ri saraladi. */
  date: string | null;
  rank: number;
}

searchRouter.get('/', zValidator('query', querySchema, (result, c) => {
  if (!result.success) return fail(c, 'VALIDATION_ERROR', 'Invalid search query');
}), async (c) => {
  const ip = clientIp(c.req.raw.headers);
  if (overLimit(searchHits, ip, LIMIT_PER_MINUTE, 60_000)) {
    return fail(c, 'RATE_LIMITED', 'Too many search requests');
  }

  const { q, type = 'all', from, to, lang = 'uz', page = 1, limit = 10 } = c.req.valid('query');

  const tsquery = toTsQuery(q);
  // Faqat tinish belgilaridan iborat so'rov — qidiradigan so'z yo'q.
  if (!tsquery) return fail(c, 'VALIDATION_ERROR', 'Query has no searchable words');

  const types = type === 'all' ? [...SEARCH_TYPES] : [type];
  const db = c.get('db');

  const withQuery = `WITH q AS (SELECT to_tsquery('simple', $1) AS query)`;
  const params = [tsquery, from ?? null, to ?? null];

  // Hisob HAMMA bo'limlar bo'yicha olinadi (tanlangani bo'yicha emas): filtr
  // tugmalaridagi sonlar bo'lim almashtirilganda o'zgarib ketmasligi kerak.
  const countsSql = `${withQuery}
    SELECT type, count(*)::int AS total
    FROM (${SEARCH_TYPES.map((t) => subQuery(t, lang, false)).join(' UNION ALL ')}) AS matches
    GROUP BY type`;

  const rowsSql = `${withQuery}
    SELECT * FROM (${types.map((t) => subQuery(t, lang, true)).join(' UNION ALL ')}) AS matches
    ORDER BY rank DESC, date DESC NULLS LAST, title ASC
    LIMIT $4 OFFSET $5`;

  const [counts, rows] = await Promise.all([
    db.$queryRawUnsafe<{ type: SearchType; total: number }[]>(countsSql, ...params),
    db.$queryRawUnsafe<Row[]>(rowsSql, ...params, limit, (page - 1) * limit),
  ]);

  const totalByType = new Map(counts.map((row) => [row.type, row.total] as const));
  // Sahifalash faqat TANLANGAN bo'limlar bo'yicha hisoblanadi.
  const total = types.reduce((sum, t) => sum + (totalByType.get(t) ?? 0), 0);

  // Natijalar turlari bo'yicha guruhlanadi; guruhlar tartibi SEARCH_TYPES bo'yicha
  // qat'iy — shunda filtrlar ro'yxati sahifadan sahifaga sakramaydi.
  const groups = SEARCH_TYPES.filter((t) => types.includes(t)).map((t) => ({
    type: t,
    total: totalByType.get(t) ?? 0,
    items: rows
      .filter((row) => row.type === t)
      .map((row) => ({
        type: row.type,
        id: row.id,
        title: row.title,
        snippet: row.snippet,
        url: row.url,
        date: row.date,
      })),
  }));

  return c.json({
    q,
    lang,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    /** Filtr tugmalari uchun — barcha bo'limlardagi natijalar soni. */
    counts: Object.fromEntries(SEARCH_TYPES.map((t) => [t, totalByType.get(t) ?? 0])),
    groups,
  });
});
