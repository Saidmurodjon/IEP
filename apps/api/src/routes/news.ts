import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AppContext } from '../index';

export const newsRouter = new Hono<AppContext>();

const newsSchema = z.object({
  slug: z.string().min(1),
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  summaryUz: z.string().min(1), summaryEn: z.string().min(1), summaryRu: z.string().min(1),
  contentUz: z.string().min(1), contentEn: z.string().min(1), contentRu: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal('')),
  // Manba — 373-son qarorning 4-bandi talabi. Ixtiyoriy, lekin boshqa
  // manbadan olingan material uchun to'ldirilishi shart.
  sourceName: z.string().max(200).optional().or(z.literal('')),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  publishedAt: z.string().optional(),
});

/** Bo'sh satrni `null` ga aylantiradi — bazada bo'sh satr saqlanmasin. */
function orNull(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  return value === '' ? null : value;
}

newsRouter.get('/', async (c) => {
  const db = c.get('db');
  const page = parseInt(c.req.query('page') ?? '1');
  const limit = parseInt(c.req.query('limit') ?? '10');
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    db.news.findMany({
      orderBy: { publishedAt: 'desc' }, skip, take: limit,
      select: { id: true, slug: true, imageUrl: true, publishedAt: true,
        titleUz: true, titleEn: true, titleRu: true,
        summaryUz: true, summaryEn: true, summaryRu: true,
        sourceName: true, sourceUrl: true },
    }),
    db.news.count(),
  ]);

  return c.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

newsRouter.get('/:slug', async (c) => {
  const db = c.get('db');
  const item = await db.news.findUnique({ where: { slug: c.req.param('slug') } });
  if (!item) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: item });
});

newsRouter.post('/', requireAuth, zValidator('json', newsSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.news.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      sourceName: orNull(data.sourceName) ?? null,
      sourceUrl: orNull(data.sourceUrl) ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    },
  });
  return c.json({ data: item }, 201);
});

newsRouter.put('/:id', requireAuth, zValidator('json', newsSchema.partial()), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.news.update({
    where: { id: c.req.param('id') },
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      sourceName: orNull(data.sourceName),
      sourceUrl: orNull(data.sourceUrl),
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    },
  });
  return c.json({ data: item });
});

newsRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.news.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});
