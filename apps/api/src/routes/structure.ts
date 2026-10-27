import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { reindex } from '../lib/search-index';
import { fail } from '../lib/errors';
import { extractFileKeys, deleteKeys } from '../lib/media';
import { LIMITS } from '../lib/file-types';
import type { AppContext } from '../index';

export const structureRouter = new Hono<AppContext>();

const unitSchema = z.object({
  nameUz: z.string().min(1), nameEn: z.string().min(1), nameRu: z.string().min(1),
  descriptionUz: z.string().default(''),
  descriptionEn: z.string().default(''),
  descriptionRu: z.string().default(''),
  head: z.string().optional().nullable(),
  type: z
    .enum(['department', 'laboratory', 'division', 'center', 'sector', 'council', 'position', 'service'])
    .default('department'),
  staffCount: z.number().int().nonnegative().optional().nullable(),
  isAdvisory: z.boolean().optional().default(false),
  order: z.number().int().default(0),
  parentId: z.string().optional().nullable(),
});

function buildTree(units: Record<string, unknown>[], parentId: string | null = null): unknown[] {
  return units
    .filter((u) => u.parentId === parentId)
    .sort((a, b) => (a.order as number) - (b.order as number))
    .map((u) => ({ ...u, children: buildTree(units, u.id as string) }));
}

structureRouter.get('/', async (c) => {
  const db = c.get('db');
  const units = await db.structureUnit.findMany({ orderBy: { order: 'asc' } });
  return c.json({ data: buildTree(units as Record<string, unknown>[], null) });
});

structureRouter.get('/:id', async (c) => {
  const db = c.get('db');
  const unit = await db.structureUnit.findUnique({ where: { id: c.req.param('id') } });
  if (!unit) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: unit });
});

structureRouter.post('/', requireAuth, zValidator('json', unitSchema), async (c) => {
  const db = c.get('db');
  const unit = await db.structureUnit.create({ data: c.req.valid('json') });
  await reindex(c, 'structure_units', unit.id);
  return c.json({ data: unit }, 201);
});

const chartSchema = z.object({ url: z.string().max(500).nullable() });

/** Eski `structureChart` qiymatidan fayl kalitini xavfsiz ajratadi. */
function oldChartKey(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'url' in parsed && typeof parsed.url === 'string') {
      return extractFileKeys(parsed.url)[0] ?? null;
    }
  } catch {
    // buzilgan JSON — eski qiymat yo'q deb hisoblanadi
  }
  return null;
}

// `/:id` dan OLDIN ro'yxatdan o'tadi, aks holda "chart" id sifatida ushlanadi.
structureRouter.put('/chart', requireAuth, zValidator('json', chartSchema), async (c) => {
  const db = c.get('db');
  const { url } = c.req.valid('json');
  const KEY = 'structureChart';
  const previous = await db.siteSetting.findUnique({ where: { key: KEY } });
  const prevKey = oldChartKey(previous?.value);

  if (url === null) {
    await db.siteSetting.deleteMany({ where: { key: KEY } });
    if (prevKey) await deleteKeys(c.env, db, [prevKey]);
    return c.json({ data: null });
  }

  const keys = extractFileKeys(url);
  if (keys.length !== 1) return fail(c, 'VALIDATION_ERROR', 'Invalid chart file url');
  const [key] = keys;
  const media = await db.mediaFile.findUnique({ where: { key } });
  if (!media || !LIMITS.chart.mimes.includes(media.mimeType)) {
    return fail(c, 'VALIDATION_ERROR', 'Chart file not found or type not allowed');
  }
  // Boshqa yozuvga tegishli fayl olinmaydi — almashtirilganda o'chib ketardi.
  if (media.ownerId && !(media.ownerType === 'structure' && media.ownerId === 'chart')) {
    return fail(c, 'VALIDATION_ERROR', 'File belongs to another record');
  }

  await db.mediaFile.update({ where: { key }, data: { ownerType: 'structure', ownerId: 'chart' } });
  const data = {
    url: `/api/files/${key}`,
    mime: media.mimeType,
    name: media.originalName,
    updatedAt: new Date().toISOString(),
  };
  const value = JSON.stringify(data);
  await db.siteSetting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
  if (prevKey && prevKey !== key) await deleteKeys(c.env, db, [prevKey]);
  return c.json({ data });
});

structureRouter.put('/:id', requireAuth, zValidator('json', unitSchema.partial()), async (c) => {
  const db = c.get('db');
  const unit = await db.structureUnit.update({ where: { id: c.req.param('id') }, data: c.req.valid('json') });
  await reindex(c, 'structure_units', unit.id);
  return c.json({ data: unit });
});

structureRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const unit = await db.structureUnit.findUnique({ where: { id } });
  if (unit) {
    await db.structureUnit.updateMany({ where: { parentId: id }, data: { parentId: unit.parentId } });
  }
  await db.structureUnit.delete({ where: { id } });
  return c.json({ message: 'Deleted successfully' });
});
