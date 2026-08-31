import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { reindex } from '../lib/search-index';
import type { AppContext } from '../index';

export const publicationsRouter = new Hono<AppContext>();

const pubSchema = z.object({
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  authors: z.string().min(1),
  journal: z.string().optional(),
  year: z.number().int().min(1900).max(2100),
  doi: z.string().optional(),
  fileUrl: z.string().url().optional().or(z.literal('')),
  category: z.enum(['article', 'monograph', 'conference', 'patent', 'report']).default('article'),
});

publicationsRouter.get('/', async (c) => {
  const db = c.get('db');
  const page = parseInt(c.req.query('page') ?? '1');
  const limit = parseInt(c.req.query('limit') ?? '20');
  const category = c.req.query('category');
  const skip = (page - 1) * limit;
  const where = category ? { category } : {};
  const [items, total] = await Promise.all([
    db.publication.findMany({ where, orderBy: { year: 'desc' }, skip, take: limit }),
    db.publication.count({ where }),
  ]);
  return c.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

publicationsRouter.get('/:id', async (c) => {
  const db = c.get('db');
  const item = await db.publication.findUnique({ where: { id: c.req.param('id') } });
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: item });
});

publicationsRouter.post('/', requireAuth, zValidator('json', pubSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.publication.create({
    data: { ...data, doi: data.doi || null, fileUrl: data.fileUrl || null, journal: data.journal || null },
  });
  await reindex(c, 'publications', item.id);
  return c.json({ data: item }, 201);
});

publicationsRouter.put('/:id', requireAuth, zValidator('json', pubSchema.partial()), async (c) => {
  const db = c.get('db');
  const item = await db.publication.update({ where: { id: c.req.param('id') }, data: c.req.valid('json') });
  await reindex(c, 'publications', item.id);
  return c.json({ data: item });
});

publicationsRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.publication.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});
