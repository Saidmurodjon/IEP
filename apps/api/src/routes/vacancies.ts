import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import { sanitizeFields } from '../lib/sanitize';
import { deleteOwnerFiles, syncContentFiles } from '../lib/media';
import type { AppContext } from '../index';

export const vacanciesRouter = new Hono<AppContext>();

const DESCRIPTION_FIELDS = ['descriptionUz', 'descriptionEn', 'descriptionRu'] as const;

/** Bo'sh satr → null. */
const emptyToNull = (v: unknown) => (v === '' ? null : v);

const unitInclude = {
  select: { id: true, nameUz: true, nameEn: true, nameRu: true, type: true },
} as const;

const description = z.string().max(50000).optional().default('');

const baseSchema = z.object({
  titleUz: z.string().min(1).max(300),
  titleEn: z.string().min(1).max(300),
  titleRu: z.string().min(1).max(300),
  descriptionUz: description,
  descriptionEn: description,
  descriptionRu: description,
  unitId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  employmentType: z.enum(['full', 'part', 'contract']),
  salaryFrom: z.number().int().nonnegative().nullable().optional(),
  salaryTo: z.number().int().nonnegative().nullable().optional(),
  deadline: z.preprocess(
    emptyToNull,
    z
      .string()
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')
      .nullable()
      .optional()
  ),
  contactEmail: z.preprocess(emptyToNull, z.string().email().max(200).nullable().optional()),
  contactPhone: z.preprocess(emptyToNull, z.string().max(50).nullable().optional()),
  order: z.number().int(),
  isActive: z.boolean(),
});

const salaryOk = (d: { salaryFrom?: number | null; salaryTo?: number | null }) =>
  d.salaryFrom == null || d.salaryTo == null || d.salaryFrom <= d.salaryTo;
const salaryMsg = { message: 'salaryFrom must be <= salaryTo', path: ['salaryFrom'] };

// Yaratishda: tavsif bo'sh bo'lishi mumkin, qolgan sozlamalarda standart qiymat bor.
const createSchema = baseSchema
  .extend({
    employmentType: baseSchema.shape.employmentType.default('full'),
    order: baseSchema.shape.order.default(0),
    isActive: baseSchema.shape.isActive.default(true),
  })
  .refine(salaryOk, salaryMsg);

// Yangilashda: yuborilmagan maydon o'zgarmaydi (tavsif standart qiymati ham qo'llanmaydi).
const updateSchema = baseSchema
  .extend({
    descriptionUz: z.string().max(50000).optional(),
    descriptionEn: z.string().max(50000).optional(),
    descriptionRu: z.string().max(50000).optional(),
  })
  .partial()
  .refine(salaryOk, salaryMsg);

function toDate(v: string | null | undefined): Date | null | undefined {
  if (v === undefined) return undefined;
  return v === null ? null : new Date(v);
}

const order = [{ order: 'asc' as const }, { createdAt: 'desc' as const }];

// Ochiq: faqat faol va muddati o'tmagan (bugun boshidan, UTC).
vacanciesRouter.get('/', async (c) => {
  const db = c.get('db');
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const items = await db.vacancy.findMany({
    where: { isActive: true, OR: [{ deadline: null }, { deadline: { gte: startOfToday } }] },
    include: { unit: unitInclude },
    orderBy: order,
  });
  return c.json({ data: items });
});

// '/:id' dan OLDIN e'lon qilinishi shart.
vacanciesRouter.get('/admin', requireAuth, async (c) => {
  const db = c.get('db');
  const items = await db.vacancy.findMany({ include: { unit: unitInclude }, orderBy: order });
  return c.json({ data: items });
});

vacanciesRouter.post('/', requireAuth, zValidator('json', createSchema), async (c) => {
  const db = c.get('db');
  const data = sanitizeFields(c.req.valid('json'), DESCRIPTION_FIELDS);
  // HTTP drayverda tranzaksiya yo'q: create + include o'rniga alohida o'qiladi.
  const { id } = await db.vacancy.create({
    data: { ...data, deadline: toDate(data.deadline) },
    select: { id: true },
  });
  const item = await db.vacancy.findUnique({ where: { id }, include: { unit: unitInclude } });
  if (item) {
    // Tavsif ichidagi rasmlar shu vakansiyaga biriktiriladi.
    await syncContentFiles(c.env, db, 'vacancy', id, [item.descriptionUz, item.descriptionEn, item.descriptionRu]);
  }
  return c.json({ data: item }, 201);
});

vacanciesRouter.put('/:id', requireAuth, zValidator('json', updateSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const data = sanitizeFields(c.req.valid('json'), DESCRIPTION_FIELDS);
  const before = await db.vacancy.findUnique({ where: { id } });
  if (!before) return fail(c, 'NOT_FOUND', 'Vacancy not found');
  await db.vacancy.update({
    where: { id },
    data: { ...data, deadline: toDate(data.deadline) },
    select: { id: true },
  });
  const item = await db.vacancy.findUnique({ where: { id }, include: { unit: unitInclude } });
  if (item) {
    // Tavsif ichidagi rasmlar shu vakansiyaga biriktiriladi.
    await syncContentFiles(c.env, db, 'vacancy', id, [item.descriptionUz, item.descriptionEn, item.descriptionRu]);
  }
  return c.json({ data: item });
});

vacanciesRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const before = await db.vacancy.findUnique({ where: { id } });
  if (!before) return fail(c, 'NOT_FOUND', 'Vacancy not found');
  await db.vacancy.delete({ where: { id } });
  await deleteOwnerFiles(c.env, db, 'vacancy', before.id);
  return c.json({ message: 'Deleted successfully' });
});
