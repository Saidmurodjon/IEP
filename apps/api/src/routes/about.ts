import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AboutContent, AboutStats } from '@energetika/shared';
import { requireAuth } from '../middleware/auth';
import { sanitizeHtml } from '../lib/sanitize';
import { syncContentFiles } from '../lib/media';
import type { AppContext } from '../index';

/**
 * «Institut haqida» sahifasining kontenti va saytdagi umumiy raqamlar.
 *
 * Kontent alohida jadval o'rniga `site_settings` dagi bitta `about_page`
 * kalitida JSON sifatida saqlanadi: sahifa bitta, migratsiya kerak emas.
 * `summary` — oddiy matn (bosh sahifa va sarlavha uchun), `content` — HTML,
 * saqlashdan oldin `sanitizeHtml` dan o'tadi.
 *
 * Raqamlar QO'LDA KIRITILMAYDI — har so'rovda bazadan hisoblanadi.
 */
export const aboutRouter = new Hono<AppContext>();

const ABOUT_KEY = 'about_page';
/** `media_files.ownerType/ownerId` — matndagi rasmlar shu yozuvga biriktiriladi. */
const MEDIA_OWNER = { type: 'about', id: 'page' } as const;

const localized = (max: number) =>
  z.object({ uz: z.string().max(max), en: z.string().max(max), ru: z.string().max(max) });

const aboutSchema = z.object({
  summary: localized(600),
  content: localized(100_000),
}) satisfies z.ZodType<AboutContent>;

const EMPTY: AboutContent = {
  summary: { uz: '', en: '', ru: '' },
  content: { uz: '', en: '', ru: '' },
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
  const [setting, labs, employees, scientists, publications] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: ABOUT_KEY } }),
    db.structureUnit.count({ where: { type: 'laboratory' } }),
    db.employee.count({ where: { isActive: true } }),
    // Ilmiy xodim — ilmiy darajasi ko'rsatilgan faol xodim.
    db.employee.count({ where: { isActive: true, degreeUz: { not: null }, NOT: { degreeUz: '' } } }),
    db.publication.count(),
  ]);

  const stats: AboutStats = { labs, employees, scientists, publications };
  return c.json({ data: parseContent(setting?.value), stats });
});

aboutRouter.put('/', requireAuth, zValidator('json', aboutSchema), async (c) => {
  const db = c.get('db');
  const body = c.req.valid('json');
  const content: AboutContent = {
    summary: {
      uz: body.summary.uz.trim(),
      en: body.summary.en.trim(),
      ru: body.summary.ru.trim(),
    },
    content: {
      uz: sanitizeHtml(body.content.uz),
      en: sanitizeHtml(body.content.en),
      ru: sanitizeHtml(body.content.ru),
    },
  };
  const value = JSON.stringify(content);
  await db.siteSetting.upsert({ where: { key: ABOUT_KEY }, update: { value }, create: { key: ABOUT_KEY, value } });
  await syncContentFiles(c.env, db, MEDIA_OWNER.type, MEDIA_OWNER.id, [
    content.content.uz, content.content.en, content.content.ru,
  ]);
  return c.json({ data: content });
});
