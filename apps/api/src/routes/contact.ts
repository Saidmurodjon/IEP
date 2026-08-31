import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { fail } from '../lib/errors';
import { clientIp, createStore, overLimit } from '../lib/rate-limit';
import { logEvent } from '../lib/error-log';
import { sendMail } from '../lib/mail';
import {
  citizenAnswered, citizenReceipt, formatDateUz, staffNotification,
} from '../lib/mail-templates';
import type { AppContext, Env } from '../index';

export const contactRouter = new Hono<AppContext>();

/** Murojaat holatlari. */
const STATUSES = ['new', 'in_review', 'answered', 'closed'] as const;
type Status = (typeof STATUSES)[number];

const messageSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(10).max(2000),
  /**
   * Ko'rinmas maydon (honeypot). Odam uni to'ldirmaydi, robot to'ldiradi.
   * To'ldirilgan bo'lsa murojaat JIMGINA rad etiladi.
   */
  website: z.string().max(200).optional(),
  /** Forma ochilgan vaqt (ms). Juda tez yuborilgan murojaat — robot. */
  formOpenedAt: z.number().int().optional(),
});

/** Formani to'ldirish uchun eng kam vaqt. */
const MIN_FILL_MS = 3000;
/** Bitta IP uchun soatiga qabul qilinadigan murojaatlar. */
const IP_LIMIT_PER_HOUR = 3;
/** Holat tekshirish: bitta IP uchun daqiqasiga. */
const STATUS_LIMIT_PER_MINUTE = 5;

const submitHits = createStore();
const statusHits = createStore();

/**
 * Navbatdagi murojaat raqamini beradi: `M-YYYY-NNNN`.
 *
 * Yil boshida hisob noldan boshlanadi. Raqam KETMA-KET — fuqaro uni
 * telefonda aytishi kerak bo'ladi.
 */
async function nextTicketNumber(db: PrismaClient): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `M-${year}-`;
  const last = await db.contactMessage.findFirst({
    where: { ticketNumber: { startsWith: prefix } },
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true },
  });
  const lastNumber = last ? parseInt(last.ticketNumber.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
}

/** Holatni tekshirish sahifasining to'liq manzili. */
async function statusUrl(db: PrismaClient): Promise<string> {
  const setting = await db.siteSetting.findUnique({ where: { key: 'site_url' } });
  const base = (setting?.value ?? '').replace(/\/+$/, '');
  return `${base}/uz/appeal-status`;
}

/** Bildirishnoma yuboriladigan manzil — sozlamalardan, kodga yozilmaydi. */
async function staffEmail(db: PrismaClient): Promise<string | null> {
  const specific = await db.siteSetting.findUnique({ where: { key: 'appeals_email' } });
  if (specific?.value?.trim()) return specific.value.trim();
  const general = await db.siteSetting.findUnique({ where: { key: 'email' } });
  return general?.value?.trim() || null;
}

/**
 * Xat yuboradi va natijani jurnalga yozadi.
 *
 * Kalit sozlanmagan bo'lsa — bu XATO EMAS: `warning` darajasida qayd etiladi
 * va murojaat baribir saqlangan holicha qoladi.
 */
async function deliver(
  env: Env,
  db: PrismaClient,
  ctx: { get: (key: 'db') => PrismaClient; executionCtx?: { waitUntil: (p: Promise<unknown>) => void } },
  to: string,
  mail: { subject: string; text: string },
  ticketNumber: string
): Promise<boolean> {
  const result = await sendMail(env, { to, ...mail });
  if (result.ok) return true;

  if (result.reason === 'not_configured') {
    logEvent(ctx, {
      source: 'server',
      level: 'warning',
      code: 'MAIL_NOT_CONFIGURED',
      message: `Email not sent for ${ticketNumber}: RESEND_API_KEY or MAIL_FROM is not configured`,
      path: '/api/contact',
      method: 'POST',
    });
  } else {
    logEvent(ctx, {
      source: 'server',
      level: 'error',
      code: 'MAIL_SEND_FAILED',
      message: `Email delivery failed for ${ticketNumber}: ${result.detail}`,
      path: '/api/contact',
      method: 'POST',
    });
  }
  // Qabul qiluvchi manzil ATAYLAB jurnal MATNIGA yozilmaydi — `redact` uni
  // niqoblasa ham, umuman bo'lmagani xavfsizroq.
  void db;
  return false;
}

contactRouter.post('/', zValidator('json', messageSchema), async (c) => {
  const db = c.get('db');
  const data = c.req.valid('json');
  const ip = clientIp(c.req.raw.headers);

  /**
   * Robotga muvaffaqiyat ko'rinishi qaytariladi — u rad etilganini
   * bilmasligi kerak, aks holda himoyani aylanib o'tishga urinadi.
   */
  const silentSuccess = () => c.json({ data: { ticketNumber: null }, message: 'Message sent successfully' }, 201);

  // 1. Ko'rinmas maydon to'ldirilgan — robot.
  if (data.website && data.website.trim().length > 0) return silentSuccess();

  // 2. Juda tez yuborilgan — robot.
  if (typeof data.formOpenedAt === 'number') {
    const elapsed = Date.now() - data.formOpenedAt;
    if (elapsed >= 0 && elapsed < MIN_FILL_MS) return silentSuccess();
  }

  // 3. IP cheklovi.
  if (overLimit(submitHits, ip, IP_LIMIT_PER_HOUR, 60 * 60 * 1000)) {
    return c.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many appeals from this address' } },
      429
    );
  }

  // 4. Bir xil matn takroran yuborilgan — yangi yozuv yaratilmaydi.
  const duplicate = await db.contactMessage.findFirst({
    where: {
      email: data.email,
      subject: data.subject,
      message: data.message,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { ticketNumber: true },
  });
  if (duplicate) {
    return c.json({ data: { ticketNumber: duplicate.ticketNumber }, message: 'Already received' }, 200);
  }

  const ticketNumber = await nextTicketNumber(db);
  const created = await db.contactMessage.create({
    data: {
      ticketNumber,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message,
      status: 'new',
      statusChangedAt: new Date(),
    },
  });

  // Xatlar murojaat SAQLANGANIDAN keyin yuboriladi va javobni kutmaydi.
  const url = await statusUrl(db);
  const receivedAt = formatDateUz(created.createdAt);
  const staff = await staffEmail(db);

  const send = (async () => {
    const sent = await deliver(
      c.env, db, c, created.email,
      citizenReceipt({ ticketNumber, statusUrl: url, receivedAt }),
      ticketNumber
    );
    if (sent) {
      await db.contactMessage.update({ where: { id: created.id }, data: { notifiedAt: new Date() } });
    }
    if (staff) {
      const base = url.replace('/uz/appeal-status', '');
      await deliver(
        c.env, db, c, staff,
        staffNotification({
          ticketNumber, statusUrl: url, receivedAt,
          subject: created.subject,
          adminUrl: `${base}/admin/messages`,
        }),
        ticketNumber
      );
    }
  })();

  try {
    c.executionCtx.waitUntil(send);
  } catch {
    void send;
  }

  return c.json({ data: { ticketNumber }, message: 'Message sent successfully' }, 201);
});

/**
 * Holatni tekshirish. OCHIQ endpoint.
 *
 * Raqam VA pochta manzili ikkalasi ham talab qilinadi: raqamlar ketma-ket
 * bo'lgani uchun faqat raqam bilan begona odam boshqalarning murojaatini
 * ko'rib chiqa olardi (09-topshiriq, 4-bo'lim).
 *
 * Javobda murojaat matni va shaxsiy ma'lumot QAYTARILMAYDI.
 */
contactRouter.get('/status', async (c) => {
  const ip = clientIp(c.req.raw.headers);
  if (overLimit(statusHits, ip, STATUS_LIMIT_PER_MINUTE, 60_000)) {
    return c.json({ error: { code: 'RATE_LIMITED', message: 'Too many lookups' } }, 429);
  }

  const ticket = (c.req.query('ticket') ?? '').trim();
  const email = (c.req.query('email') ?? '').trim().toLowerCase();
  if (!ticket || !email) {
    return fail(c, 'VALIDATION_ERROR', 'Both ticket number and email are required');
  }

  const db = c.get('db');
  const item = await db.contactMessage.findUnique({
    where: { ticketNumber: ticket },
    select: { ticketNumber: true, email: true, status: true, createdAt: true, statusChangedAt: true },
  });

  // Mos kelmasa — sabab AYTILMAYDI. "Raqam yo'q" va "pochta mos emas"
  // javoblari farq qilsa, raqamlarni birma-bir sinab ko'rish mumkin bo'lardi.
  if (!item || item.email.toLowerCase() !== email) {
    return fail(c, 'NOT_FOUND', 'No appeal matches the provided details');
  }

  return c.json({
    data: {
      ticketNumber: item.ticketNumber,
      status: item.status,
      createdAt: item.createdAt,
      statusChangedAt: item.statusChangedAt,
    },
  });
});

contactRouter.get('/', requireAuth, async (c) => {
  const db = c.get('db');
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10) || 1);
  const limit = Math.min(100, parseInt(c.req.query('limit') ?? '20', 10) || 20);
  const status = c.req.query('status');
  const where = STATUSES.includes(status as Status) ? { status } : {};

  const [items, total, unanswered] = await Promise.all([
    db.contactMessage.findMany({
      where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
    }),
    db.contactMessage.count({ where }),
    db.contactMessage.count({ where: { status: { in: ['new', 'in_review'] } } }),
  ]);
  return c.json({ data: items, total, page, limit, totalPages: Math.ceil(total / limit), unanswered });
});

contactRouter.patch(
  '/:id',
  requireAuth,
  zValidator('json', z.object({
    status: z.enum(STATUSES).optional(),
    answerNote: z.string().max(4000).optional(),
  })),
  async (c) => {
    const db = c.get('db');
    const id = c.req.param('id');
    const data = c.req.valid('json');

    const before = await db.contactMessage.findUnique({ where: { id } });
    if (!before) return fail(c, 'NOT_FOUND', 'Appeal not found');

    const statusChanged = data.status !== undefined && data.status !== before.status;
    const item = await db.contactMessage.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status, statusChangedAt: new Date() } : {}),
        ...(data.status === 'answered' ? { answeredAt: new Date() } : {}),
        ...(data.answerNote !== undefined ? { answerNote: data.answerNote || null } : {}),
      },
    });

    // `answered` holatiga o'tkazilganda fuqaroga xabar yuboriladi.
    if (statusChanged && data.status === 'answered') {
      const url = await statusUrl(db);
      const send = deliver(
        c.env, db, c, item.email,
        citizenAnswered({
          ticketNumber: item.ticketNumber,
          statusUrl: url,
          receivedAt: formatDateUz(item.createdAt),
        }),
        item.ticketNumber
      );
      try {
        c.executionCtx.waitUntil(send);
      } catch {
        void send;
      }
    }

    return c.json({ data: item });
  }
);

contactRouter.delete('/:id', requireAuth, async (c) => {
  const db = c.get('db');
  await db.contactMessage.delete({ where: { id: c.req.param('id') } });
  return c.json({ message: 'Deleted successfully' });
});

/**
 * TODO: yopilgan murojaatlarni arxivlash yoki o'chirish.
 *
 * Murojaatlar shaxsiy ma'lumot saqlaydi va cheksiz turishi kerak emas.
 * Aniq muddat institut hujjat aylanishi qoidalariga bog'liq, shuning uchun
 * `appeals_retention_days` sozlamasiga chiqarilgan (sukut bo'yicha 365).
 * Muddatni institut YURISKONSULTIDAN aniqlashtirish kerak, keyin bu
 * endpoint cron bilan ishga tushiriladi.
 */
contactRouter.post('/cleanup', requireAuth, async (c) => {
  const db = c.get('db');
  const setting = await db.siteSetting.findUnique({ where: { key: 'appeals_retention_days' } });
  const days = Number(setting?.value ?? '365');
  if (!Number.isFinite(days) || days < 30) {
    return fail(c, 'VALIDATION_ERROR', 'appeals_retention_days must be at least 30');
  }
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await db.contactMessage.deleteMany({
    where: { status: 'closed', statusChangedAt: { lt: cutoff } },
  });
  return c.json({ data: { deleted: result.count, retentionDays: days } });
});
