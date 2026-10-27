import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import type { AppContext } from '../index';
import {
  fillMonths, fillYears, foldUnits, lastMonthKeys, monthWindowStart,
  type MonthCount, type YearCount,
} from '../lib/stats';

export const statsRouter = new Hono<AppContext>();

const APPEAL_STATUSES = ['new', 'in_review', 'answered', 'closed'] as const;

interface MonthRow { month: string; count: bigint | number }

statsRouter.get('/', requireAuth, async (c) => {
  const db = c.get('db');
  const now = new Date();
  const keys = lastMonthKeys(now);
  const since = monthWindowStart(now);

  const toMonths = (rows: MonthRow[]): MonthCount[] =>
    fillMonths(keys, rows.map((r) => ({ month: r.month, count: Number(r.count) })));

  const [
    newsPublished, newsDrafts, publications, employeesActive, documentsActive,
    appealsOpen, appealsTotal, media, newsRows, appealRows, statusRows, yearRows, unitRows,
  ] = await Promise.all([
    db.news.count({ where: { isPublished: true } }),
    db.news.count({ where: { isPublished: false } }),
    db.publication.count(),
    db.employee.count({ where: { isActive: true } }),
    db.document.count({ where: { isActive: true } }),
    db.contactMessage.count({ where: { status: { in: ['new', 'in_review'] } } }),
    db.contactMessage.count(),
    db.mediaFile.aggregate({ _sum: { size: true }, _count: { _all: true } }),
    db.$queryRaw<MonthRow[]>`
      SELECT to_char(date_trunc('month', "publishedAt" AT TIME ZONE 'Asia/Tashkent'), 'YYYY-MM') AS month,
             COUNT(*) AS count
      FROM "news"
      WHERE "isPublished" = true AND "publishedAt" >= ${since}
      GROUP BY 1`,
    db.$queryRaw<MonthRow[]>`
      SELECT to_char(date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Tashkent'), 'YYYY-MM') AS month,
             COUNT(*) AS count
      FROM "contact_messages"
      WHERE "createdAt" >= ${since}
      GROUP BY 1`,
    db.contactMessage.groupBy({ by: ['status'], _count: { _all: true } }),
    db.publication.groupBy({ by: ['year'], _count: { _all: true } }),
    db.employee.groupBy({ by: ['unitId'], where: { isActive: true }, _count: { _all: true } }),
  ]);

  const statusMap = new Map(statusRows.map((r) => [r.status, r._count._all]));
  const appealsByStatus = APPEAL_STATUSES.map((status) => ({
    status, count: statusMap.get(status) ?? 0,
  }));

  const publicationsByYear = fillYears(
    yearRows.map((r): YearCount => ({ year: r.year, count: r._count._all })),
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
      newsByMonth: toMonths(newsRows),
      appealsByMonth: toMonths(appealRows),
      appealsByStatus,
      publicationsByYear,
      employeesByUnit,
    },
  });
});
