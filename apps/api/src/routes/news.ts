import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { sanitizeFields, CONTENT_FIELDS } from '../lib/sanitize';
import { deleteOwnerFiles, replaceSingleFile, syncContentFiles } from '../lib/media';
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
  // Qoralama ochiq sahifada ko'rinmaydi.
  isPublished: z.boolean().optional(),
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

  // Qoralamalar ochiq saytda ko'rinmaydi. Admin panel `?drafts=true` bilan so'raydi.
  const includeDrafts = c.req.query('drafts') === 'true';
  const where = includeDrafts ? {} : { isPublished: true };

  const [items, total] = await Promise.all([
    db.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' }, skip, take: limit,
      select: { id: true, slug: true, imageUrl: true, publishedAt: true,
        titleUz: true, titleEn: true, titleRu: true,
        summaryUz: true, summaryEn: true, summaryRu: true,
        sourceName: true, sourceUrl: true, isPublished: true },
    }),
    db.news.count({ where }),
  ]);

  return c.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit) });
});

newsRouter.get('/:slug', async (c) => {
  const db = c.get('db');
  const item = await db.news.findUnique({ where: { slug: c.req.param('slug') } });
  if (!item) return c.json({ error: 'Not found' }, 404);
  // Qoralamani faqat admin panel ko'ra oladi.
  if (!item.isPublished && c.req.query('drafts') !== 'true') {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json({ data: item });
});

newsRouter.post('/', requireAuth, zValidator('json', newsSchema), async (c) => {
  const db = c.get('db');
  // Moderator ixtiyoriy HTML yuborishi mumkin — saqlashdan OLDIN tozalanadi.
  const data = sanitizeFields(c.req.valid('json'), CONTENT_FIELDS);
  const item = await db.news.create({
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      sourceName: orNull(data.sourceName) ?? null,
      sourceUrl: orNull(data.sourceUrl) ?? null,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    },
  });
  // Matn ichidagi rasmlar shu yangilikka biriktiriladi.
  await syncContentFiles(c.env, db, 'news', item.id, [
    item.contentUz, item.contentEn, item.contentRu, item.imageUrl,
  ]);
  return c.json({ data: item }, 201);
});

newsRouter.put('/:id', requireAuth, zValidator('json', newsSchema.partial()), async (c) => {
  const db = c.get('db');
  const data = sanitizeFields(c.req.valid('json'), CONTENT_FIELDS);
  const before = await db.news.findUnique({ where: { id: c.req.param('id') } });
  if (!before) return c.json({ error: 'Not found' }, 404);
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
  // Bosh rasm almashtirilgan bo'lsa, eskisi ombordan o'chiriladi.
  await replaceSingleFile(c.env, db, before.imageUrl, item.imageUrl);
  await syncContentFiles(c.env, db, 'news', item.id, [
    item.contentUz, item.contentEn, item.contentRu, item.imageUrl,
  ]);
  return c.json({ data: item });
});

newsRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Not found' }, 404);
  // Avval fayllar, keyin yozuv — aks holda fayllar egasiz qolib ketardi.
  await deleteOwnerFiles(c.env, db, 'news', id);
  await db.news.delete({ where: { id } });
  return c.json({ message: 'Deleted successfully' });
});
