import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import type { AppContext } from '../index';
import {
  fillPeriods, fillYearRange, foldUnits, resolveRange,
  type PeriodCount, type YearCount,
} from '../lib/stats';

export const statsRouter = new Hono<AppContext>();

const APPEAL_STATUSES = ['new', 'in_review', 'answered', 'closed'] as const;

interface PeriodRow { period: string; count: bigint | number }

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const rangeSchema = z.object({ from: day.optional(), to: day.optional() });
const searchSchema = rangeSchema.extend({ q: z.string().trim().min(2).max(100) });

const SEARCH_LIMIT = 5;

statsRouter.get('/', requireAuth, zValidator('query', rangeSchema, (result, c) => {
  if (!result.success) return fail(c, 'VALIDATION_ERROR', 'Invalid date range');
}), async (c) => {
  const db = c.get('db');
  const { from, to } = c.req.valid('query');
  const range = resolveRange(new Date(), from, to);
  if (!range) return fail(c, 'VALIDATION_ERROR', 'Invalid date range');
  const { start, end, keys } = range;
  // Ustunlar `timestamp without time zone` (UTC) — avval UTC deb belgilab, keyin Toshkentga o'tkaziladi.
  const unit = range.granularity;
  const fmt = unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM';
  const fromYear = Number(range.from.slice(0, 4));
  const toYear = Number(range.to.slice(0, 4));

  const toPeriods = (rows: PeriodRow[]): PeriodCount[] =>
    fillPeriods(keys, rows.map((r) => ({ period: r.period, count: Number(r.count) })));

  const inRange = { gte: start, lt: end };

  const [
    newsPublished, newsDrafts, publications, employeesActive, documentsActive,
    appealsOpen, appealsTotal, media,
    periodNews, periodAppeals, periodPublications,
    newsRows, appealRows, statusRows, yearRows, unitRows,
  ] = await Promise.all([
    db.news.count({ where: { isPublished: true } }),
    db.news.count({ where: { isPublished: false } }),
    db.publication.count(),
    db.employee.count({ where: { isActive: true } }),
    db.document.count({ where: { isActive: true } }),
    db.contactMessage.count({ where: { status: { in: ['new', 'in_review'] } } }),
    db.contactMessage.count(),
    db.mediaFile.aggregate({ _sum: { size: true }, _count: { _all: true } }),
    db.news.count({ where: { isPublished: true, publishedAt: inRange } }),
    db.contactMessage.count({ where: { createdAt: inRange } }),
    db.publication.count({ where: { year: { gte: fromYear, lte: toYear } } }),
    db.$queryRaw<PeriodRow[]>`
      SELECT to_char(date_trunc(${unit}, "publishedAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tashkent'), ${fmt}) AS period,
             COUNT(*) AS count
      FROM "news"
      WHERE "isPublished" = true AND "publishedAt" >= ${start} AND "publishedAt" < ${end}
      GROUP BY 1`,
    db.$queryRaw<PeriodRow[]>`
      SELECT to_char(date_trunc(${unit}, "createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tashkent'), ${fmt}) AS period,
             COUNT(*) AS count
      FROM "contact_messages"
      WHERE "createdAt" >= ${start} AND "createdAt" < ${end}
      GROUP BY 1`,
    db.contactMessage.groupBy({ by: ['status'], where: { createdAt: inRange }, _count: { _all: true } }),
    db.publication.groupBy({
      by: ['year'], where: { year: { gte: fromYear, lte: toYear } }, _count: { _all: true },
    }),
    db.employee.groupBy({ by: ['unitId'], where: { isActive: true }, _count: { _all: true } }),
  ]);

  const statusMap = new Map(statusRows.map((r) => [r.status, r._count._all]));
  const appealsByStatus = APPEAL_STATUSES.map((status) => ({
    status, count: statusMap.get(status) ?? 0,
  }));

  const publicationsByYear = fillYearRange(
    yearRows.map((r): YearCount => ({ year: r.year, count: r._count._all })),
    fromYear, toYear,
  );

  // Bo'linma nomlari faqat guruhlangan unitId lar uchun olinadi
  const unitIds = unitRows.flatMap((r) => (r.unitId ? [r.unitId] : []));
  const units = unitIds.length
    ? await db.structureUnit.findMany({
        where: { id: { in: unitIds } },
        select: { id: true, nameUz: true, nameEn: true, nameRu: true },
      })
    : [];
  const unitById = new Map(units.map((u) => [u.id, u]));
  const employeesByUnit = foldUnits(
    unitRows.map((r) => {
      const u = r.unitId ? unitById.get(r.unitId) : undefined;
      return {
        unitId: r.unitId,
        nameUz: u?.nameUz ?? '', nameEn: u?.nameEn ?? '', nameRu: u?.nameRu ?? '',
        count: r._count._all,
      };
    }),
  );

  return c.json({
    data: {
      totals: {
        newsPublished, newsDrafts, publications, employeesActive, documentsActive,
        appealsOpen, appealsTotal,
        storageBytes: media._sum.size ?? 0,
        mediaFiles: media._count._all,
      },
      range: { from: range.from, to: range.to, granularity: unit },
      period: { news: periodNews, appeals: periodAppeals, publications: periodPublications },
      newsSeries: toPeriods(newsRows),
      appealsSeries: toPeriods(appealRows),
      appealsByStatus,
      publicationsByYear,
      employeesByUnit,
    },
  });
});

/**
 * Dashboard qidiruvi — yangiliklar (qoralamalar ham), nashrlar, xodimlar, murojaatlar.
 * Har turdan ko'pi bilan 5 ta. Sana oralig'i berilsa, sanasi bor yozuvlar shu oraliqda.
 */
statsRouter.get('/search', requireAuth, zValidator('query', searchSchema, (result, c) => {
  if (!result.success) return fail(c, 'VALIDATION_ERROR', 'Invalid search query');
}), async (c) => {
  const db = c.get('db');
  const { q, from, to } = c.req.valid('query');
  const range = from || to ? resolveRange(new Date(), from, to) : null;
  if ((from || to) && !range) return fail(c, 'VALIDATION_ERROR', 'Invalid date range');
  const dates = range ? { gte: range.start, lt: range.end } : undefined;
  const has = { contains: q, mode: 'insensitive' as const };

  const [news, publications, employees, appeals] = await Promise.all([
    db.news.findMany({
      where: {
        OR: [{ titleUz: has }, { titleEn: has }, { titleRu: has }],
        ...(dates && { publishedAt: dates }),
      },
      select: { id: true, titleUz: true, titleEn: true, titleRu: true, isPublished: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: SEARCH_LIMIT,
    }),
    db.publication.findMany({
      where: {
        OR: [{ titleUz: has }, { titleEn: has }, { titleRu: has }, { authors: has }],
        ...(range && {
          year: { gte: Number(range.from.slice(0, 4)), lte: Number(range.to.slice(0, 4)) },
        }),
      },
      select: { id: true, titleUz: true, titleEn: true, titleRu: true, year: true },
      orderBy: { year: 'desc' },
      take: SEARCH_LIMIT,
    }),
    // Xodimlar sanaga bog'liq emas — oraliq qo'llanmaydi.
    db.employee.findMany({
      where: { OR: [{ fullNameUz: has }, { fullNameEn: has }, { fullNameRu: has }] },
      select: { id: true, fullNameUz: true, fullNameEn: true, fullNameRu: true, isActive: true },
      orderBy: { fullNameUz: 'asc' },
      take: SEARCH_LIMIT,
    }),
    db.contactMessage.findMany({
      where: {
        OR: [{ ticketNumber: has }, { name: has }, { subject: has }],
        ...(dates && { createdAt: dates }),
      },
      select: { id: true, ticketNumber: true, name: true, subject: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: SEARCH_LIMIT,
    }),
  ]);

  return c.json({ data: { news, publications, employees, appeals } });
});
