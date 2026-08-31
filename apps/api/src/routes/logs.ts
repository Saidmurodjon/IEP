import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import { clientIp, createStore, overLimit } from '../lib/rate-limit';
import { cleanupOldLogs, recordError } from '../lib/error-log';
import type { AppContext } from '../index';

export const logsRouter = new Hono<AppContext>();

/**
 * Foydalanuvchi tomonidan kelgan xato.
 *
 * Endpoint OCHIQ bo'lishi shart: JavaScript xatosi tizimga kirmagan
 * foydalanuvchida ham yuz beradi. Shuning uchun cheklovlar qattiq:
 * IP bo'yicha daqiqasiga 10 ta, matn uzunligi cheklangan, zod bilan tekshiriladi.
 */
const clientLogSchema = z.object({
  message: z.string().min(1).max(1000),
  stack: z.string().max(5000).optional(),
  path: z.string().max(500).optional(),
  level: z.enum(['error', 'warning', 'info']).optional(),
  code: z.string().max(50).optional(),
  statusCode: z.number().int().min(0).max(599).optional(),
});

/** Bitta IP uchun daqiqasiga qabul qilinadigan yozuvlar soni. */
const CLIENT_RATE_LIMIT = 10;
const CLIENT_RATE_WINDOW_MS = 60_000;

/**
 * IP bo'yicha hisoblagich (`lib/rate-limit.ts`). Izolyat xotirasida saqlanadi
 * (TODO: KV yoki Durable Object).
 */
const clientHits = createStore();

logsRouter.post('/client', zValidator('json', clientLogSchema), async (c) => {
  const ip = clientIp(c.req.raw.headers);
  if (overLimit(clientHits, ip, CLIENT_RATE_LIMIT, CLIENT_RATE_WINDOW_MS)) {
    return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many log reports' } }, 429);
  }

  const data = c.req.valid('json');
  const db = c.get('db');

  // Jurnalga yozish javobni kutib turmasin.
  await recordError(db, {
    source: 'client',
    level: data.level ?? 'error',
    code: data.code ?? null,
    message: data.message,
    stack: data.stack ?? null,
    path: data.path ?? null,
    statusCode: data.statusCode ?? null,
    userAgent: c.req.header('User-Agent') ?? null,
  });

  return c.json({ data: { accepted: true } }, 202);
});

logsRouter.get('/', requireAuth, async (c) => {
  const db = c.get('db');
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(c.req.query('limit') ?? '25', 10) || 25));

  const source = c.req.query('source');
  const level = c.req.query('level');
  const resolved = c.req.query('resolved');
  const from = c.req.query('from');
  const to = c.req.query('to');

  const where = {
    ...(source === 'server' || source === 'client' ? { source } : {}),
    ...(level === 'error' || level === 'warning' || level === 'info' ? { level } : {}),
    ...(resolved === 'true' ? { isResolved: true } : resolved === 'false' ? { isResolved: false } : {}),
    ...(from || to
      ? {
          lastSeenAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          },
        }
      : {}),
  };

  const [items, total, unresolvedLastDay] = await Promise.all([
    db.errorLog.findMany({
      where,
      orderBy: { lastSeenAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      // Zanjir ro'yxatda kerak emas — u faqat bitta yozuv sahifasida ochiladi.
      select: {
        id: true, fingerprint: true, source: true, level: true, code: true,
        message: true, path: true, method: true, statusCode: true,
        count: true, firstSeenAt: true, lastSeenAt: true, isResolved: true,
      },
    }),
    db.errorLog.count({ where }),
    db.errorLog.count({
      where: { isResolved: false, lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return c.json({
    data: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    unresolvedLastDay,
  });
});

logsRouter.get('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  const item = await db.errorLog.findUnique({ where: { id: c.req.param('id') } });
  if (!item) return fail(c, 'NOT_FOUND', 'Log entry not found');
  return c.json({ data: item });
});

logsRouter.patch(
  '/:id',
  requireAuth,
  zValidator('json', z.object({ isResolved: z.boolean().optional(), note: z.string().max(2000).optional() })),
  async (c) => {
    const db = c.get('db');
    const data = c.req.valid('json');
    const item = await db.errorLog.update({
      where: { id: c.req.param('id') },
      data: { ...data, note: data.note === '' ? null : data.note },
    });
    return c.json({ data: item });
  }
);

logsRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.errorLog.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});

logsRouter.post('/cleanup', requireAuth, async (c) => {
  const db = c.get('db');
  const deleted = await cleanupOldLogs(db);
  return c.json({ data: { deleted } });
});
