import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import type { AppContext } from '../index';

export const settingsRouter = new Hono<AppContext>();

/**
 * Ochiq `GET /api/settings` da QAYTARILMAYDIGAN kalitlar. Pochta va murojaat
 * sozlamalari endi kodda (`lib/site-config.ts`), lekin eski bazalarda qatorlari
 * qolgan — tashqariga chiqmasin. `about_page` — o'z endpointi (`/api/about`) bor.
 */
const PRIVATE_KEYS = new Set(['email', 'appeals_email', 'appeals_retention_days', 'about_page']);

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
    data: Object.fromEntries(settings.filter((s) => !PRIVATE_KEYS.has(s.key)).map((s) => [s.key, s.value])),
    lastUpdatedAt,
  });
});

// `about_page` faqat `/api/about` orqali yoziladi — u yerda to'liq sxema tekshiruvi bor.
const writableKey = z.string().refine((key) => key !== 'about_page');

settingsRouter.put('/:key', requireAuth, requireRole('SUPER_ADMIN'), zValidator('param', z.object({ key: writableKey })), zValidator('json', z.object({ value: z.string() })), async (c) => {
  const db = c.get('db');
  const { key } = c.req.valid('param');
  const { value } = c.req.valid('json');
  const setting = await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  return c.json({ data: setting });
});

settingsRouter.post('/bulk', requireAuth, requireRole('SUPER_ADMIN'), zValidator('json', z.record(writableKey, z.string())), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  await Promise.all(
    Object.entries(data).map(([key, value]) =>
      db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
  return c.json({ message: 'Settings updated' });
});
