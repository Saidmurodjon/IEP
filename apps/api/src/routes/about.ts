import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { ABOUT_VALUE_ICONS, type AboutContent } from '@energetika/shared';
import { requireAuth } from '../middleware/auth';
import type { AppContext } from '../index';

/**
 * «Institut haqida» sahifasining kontenti.
 *
 * Alohida jadval o'rniga `site_settings` dagi bitta `about_page` kalitida
 * JSON sifatida saqlanadi: sahifa bitta, ro'yxat emas, migratsiya kerak emas.
 * Hamma matn ODDIY MATN (HTML emas) — sanitizatsiya talab qilinmaydi,
 * frontend uni React matni sifatida chiqaradi.
 */
export const aboutRouter = new Hono<AppContext>();

const ABOUT_KEY = 'about_page';

const text = (max: number) => z.string().trim().max(max);
const localized = (max: number) => z.object({ uz: text(max), en: text(max), ru: text(max) });

const aboutSchema = z.object({
  tagline: localized(200),
  intro: localized(1000),
  foundedYear: z.number().int().min(1900).max(2100).nullable(),
  mission: localized(1500),
  vision: localized(1500),
  history: localized(8000),
  stats: z.object({
    scientists: z.number().int().min(0).max(10000).nullable(),
    staff: z.number().int().min(0).max(10000).nullable(),
  }),
  milestones: z
    .array(z.object({ year: text(20).min(1), title: localized(200), text: localized(1000) }))
    .max(40),
  values: z
    .array(z.object({ icon: z.enum(ABOUT_VALUE_ICONS), title: localized(120), text: localized(500) }))
    .max(8),
}) satisfies z.ZodType<AboutContent>;

const emptyLocalized = () => ({ uz: '', en: '', ru: '' });

const EMPTY: AboutContent = {
  tagline: emptyLocalized(),
  intro: emptyLocalized(),
  foundedYear: null,
  mission: emptyLocalized(),
  vision: emptyLocalized(),
  history: emptyLocalized(),
  stats: { scientists: null, staff: null },
  milestones: [],
  values: [],
};

/** Bazadagi JSON buzilgan yoki eski shaklda bo'lsa — bo'sh kontent (sahifa yiqilmaydi). */
function parseContent(raw: string | undefined): AboutContent {
  if (!raw) return EMPTY;
  try {
    const parsed = aboutSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

aboutRouter.get('/', async (c) => {
  const db = c.get('db');
  const [setting, labs, employees, publications] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: ABOUT_KEY } }),
    db.structureUnit.count({ where: { type: 'laboratory' } }),
    db.employee.count({ where: { isActive: true } }),
    db.publication.count(),
  ]);

  return c.json({
    data: parseContent(setting?.value),
    // Jonli raqamlar — admin kiritmaydi, bazadan hisoblanadi.
    live: { labs, employees, publications },
  });
});

aboutRouter.put('/', requireAuth, zValidator('json', aboutSchema), async (c) => {
  const db = c.get('db');
  const value = JSON.stringify(c.req.valid('json'));
  await db.siteSetting.upsert({ where: { key: ABOUT_KEY }, update: { value }, create: { key: ABOUT_KEY, value } });
  return c.json({ message: 'About page updated' });
});
