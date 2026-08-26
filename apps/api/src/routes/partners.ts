import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AppContext } from '../index';

export const partnersRouter = new Hono<AppContext>();

const partnerSchema = z.object({
  nameUz: z.string().min(1), nameEn: z.string().min(1), nameRu: z.string().min(1),
  logoUrl: z.string().min(1),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

partnersRouter.get('/', async (c) => {
  const db = c.get('db');
  const includeInactive = c.req.query('includeInactive') === 'true';
  const items = await db.partner.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ order: 'asc' }, { nameUz: 'asc' }],
  });
  return c.json({ data: items });
});

partnersRouter.post('/', requireAuth, zValidator('json', partnerSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.partner.create({ data: { ...data, websiteUrl: data.websiteUrl || null } });
  return c.json({ data: item }, 201);
});

partnersRouter.put('/:id', requireAuth, zValidator('json', partnerSchema.partial()), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.partner.update({
    where: { id: c.req.param('id') },
    data: { ...data, websiteUrl: data.websiteUrl === '' ? null : data.websiteUrl },
  });
  return c.json({ data: item });
});

partnersRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.partner.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});
