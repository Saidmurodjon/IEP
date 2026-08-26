import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import { deleteKeys } from '../lib/media';
import type { AppContext } from '../index';

export const documentsRouter = new Hono<AppContext>();

const documentSchema = z.object({
  titleUz: z.string().min(1), titleEn: z.string().min(1), titleRu: z.string().min(1),
  descriptionUz: z.string().optional(), descriptionEn: z.string().optional(), descriptionRu: z.string().optional(),
  /** `MediaFile.key` — fayl allaqachon `POST /api/uploads` orqali yuklangan. */
  fileKey: z.string().min(1),
  documentNumber: z.string().max(100).optional(),
  documentDate: z.string().optional(),
  category: z.string().max(50).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

documentsRouter.get('/', async (c) => {
  const db = c.get('db');
  const includeInactive = c.req.query('includeInactive') === 'true';
  const items = await db.document.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ order: 'asc' }, { documentDate: 'desc' }],
  });
  return c.json({ data: items });
});

documentsRouter.post('/', requireAuth, zValidator('json', documentSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const item = await db.document.create({
    data: { ...data, documentDate: data.documentDate ? new Date(data.documentDate) : null },
  });
  // Fayl shu hujjatga biriktiriladi — aks holda 24 soatdan keyin egasiz deb tozalanardi.
  await db.mediaFile.updateMany({
    where: { key: data.fileKey },
    data: { ownerType: 'document', ownerId: item.id },
  });
  return c.json({ data: item }, 201);
});

documentsRouter.put('/:id', requireAuth, zValidator('json', documentSchema.partial()), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const data = c.req.valid('json');
  const before = await db.document.findUnique({ where: { id } });
  if (!before) return fail(c, 'NOT_FOUND', 'Document not found');

  const item = await db.document.update({
    where: { id },
    data: {
      ...data,
      documentDate: data.documentDate ? new Date(data.documentDate) : undefined,
    },
  });

  // Fayl almashtirilgan bo'lsa, eskisi ombordan o'chiriladi.
  if (data.fileKey && data.fileKey !== before.fileKey) {
    await deleteKeys(c.env, db, [before.fileKey]);
    await db.mediaFile.updateMany({
      where: { key: data.fileKey },
      data: { ownerType: 'document', ownerId: id },
    });
  }
  return c.json({ data: item });
});

documentsRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const before = await db.document.findUnique({ where: { id } });
  if (!before) return fail(c, 'NOT_FOUND', 'Document not found');
  await deleteKeys(c.env, db, [before.fileKey]);
  await db.document.delete({ where: { id } });
  return c.json({ message: 'Deleted successfully' });
});
