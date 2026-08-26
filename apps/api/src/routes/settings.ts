import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import type { AppContext } from '../index';

export const settingsRouter = new Hono<AppContext>();

settingsRouter.get('/', async (c) => {
  const db = c.get('db');
  // `lastUpdatedAt` — 373-son qarorning 6-bandi (axborot sanasi) uchun:
  // saytdagi ochiq kontentning eng so'nggi o'zgarish vaqti. Alohida so'rov
  // bo'lmasligi uchun sozlamalar bilan birga qaytariladi.
  const [settings, news, publication, unit, setting] = await Promise.all([
    db.siteSetting.findMany(),
    db.news.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    db.publication.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    db.structureUnit.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
    db.siteSetting.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
  ]);

  const times = [news, publication, unit, setting]
    .map((row) => row?.updatedAt?.getTime())
    .filter((time): time is number => typeof time === 'number');
  const lastUpdatedAt = times.length ? new Date(Math.max(...times)).toISOString() : null;

  return c.json({
    data: Object.fromEntries(settings.map((s) => [s.key, s.value])),
    lastUpdatedAt,
  });
});

settingsRouter.put('/:key', requireAuth, zValidator('json', z.object({ value: z.string() })), async (c) => {
  const db = c.get('db');
  const key = c.req.param('key');
  const { value } = c.req.valid('json');
  const setting = await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  return c.json({ data: setting });
});

settingsRouter.post('/bulk', requireAuth, zValidator('json', z.record(z.string())), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  return c.json({ message: 'Settings updated' });
});
