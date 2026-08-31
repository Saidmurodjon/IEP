import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { reindex } from '../lib/search-index';
import type { AppContext } from '../index';

export const employeesRouter = new Hono<AppContext>();

/**
 * DIQQAT: `phone` va `email` — faqat XIZMAT aloqa ma'lumotlari.
 * Shaxsiy mobil raqam yoki shaxsiy pochta saqlanmaydi (06-topshiriq).
 */
const employeeSchema = z.object({
  fullNameUz: z.string().min(1), fullNameEn: z.string().min(1), fullNameRu: z.string().min(1),
  positionUz: z.string().min(1), positionEn: z.string().min(1), positionRu: z.string().min(1),
  degreeUz: z.string().optional(), degreeEn: z.string().optional(), degreeRu: z.string().optional(),
  titleUz: z.string().optional(), titleEn: z.string().optional(), titleRu: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  photoUrl: z.string().optional(),
  orcid: z.string().max(50).optional(),
  scopusId: z.string().max(50).optional(),
  researchAreaUz: z.string().optional(), researchAreaEn: z.string().optional(), researchAreaRu: z.string().optional(),
  officeRoom: z.string().max(50).optional(),
  receptionHoursUz: z.string().optional(), receptionHoursEn: z.string().optional(), receptionHoursRu: z.string().optional(),
  isManagement: z.boolean().optional(),
  isUnitHead: z.boolean().optional(),
  unitId: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** Bo'sh satrni `null` ga aylantiradi — bazada bo'sh satr saqlanmasin. */
function clean<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = { ...data };
  for (const [key, value] of Object.entries(out)) {
    if (value === '') out[key] = null;
  }
  return out as T;
}

employeesRouter.get('/', async (c) => {
  const db = c.get('db');
  const unitId = c.req.query('unitId');
  // Ochiq saytda faqat faol xodimlar. Ishdan ketgan xodim o'chirilmaydi,
  // `isActive = false` bo'ladi va admin panelda ko'rinib turadi.
  const includeInactive = c.req.query('includeInactive') === 'true';

  const items = await db.employee.findMany({
    where: {
      ...(unitId ? { unitId } : {}),
      ...(includeInactive ? {} : { isActive: true }),
    },
    orderBy: [{ order: 'asc' }, { fullNameUz: 'asc' }],
  });
  return c.json({ data: items });
});

employeesRouter.get('/:id', async (c) => {
  const db = c.get('db');
  const item = await db.employee.findUnique({ where: { id: c.req.param('id') } });
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: item });
});

employeesRouter.post('/', requireAuth, zValidator('json', employeeSchema), async (c) => {
  const db = c.get('db');
  const item = await db.employee.create({ data: clean(c.req.valid('json')) });
  await reindex(c, 'employees', item.id);
  return c.json({ data: item }, 201);
});

employeesRouter.put('/:id', requireAuth, zValidator('json', employeeSchema.partial()), async (c) => {
  const db = c.get('db');
  const item = await db.employee.update({
    where: { id: c.req.param('id') },
    data: clean(c.req.valid('json')),
  });
  await reindex(c, 'employees', item.id);
  return c.json({ data: item });
});

employeesRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.employee.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});
