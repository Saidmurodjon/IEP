import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { reindex } from '../lib/search-index';
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
