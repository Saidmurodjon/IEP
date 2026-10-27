import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hashPassword } from '@energetika/shared';
import { requireAuth, requireRole } from '../middleware/auth';
import { fail } from '../lib/errors';
import { leavesActiveSuperAdmin } from '../lib/admin-guard';
import type { AppContext } from '../index';

export const adminsRouter = new Hono<AppContext>();

// Barcha endpoint'lar faqat SUPER_ADMIN uchun.
adminsRouter.use('*', requireAuth, requireRole('SUPER_ADMIN'));

// Parol hech qachon javobga tushmasligi uchun doim shu `select`.
const ADMIN_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

const roleSchema = z.enum(['SUPER_ADMIN', 'ADMIN']);
const passwordSchema = z.string().min(10).max(200);

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(1).max(100),
  password: passwordSchema,
  role: roleSchema,
});

const updateSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    role: roleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.name !== undefined || v.role !== undefined || v.isActive !== undefined, {
    message: 'At least one field is required',
  });

const resetSchema = z.object({ password: passwordSchema });

adminsRouter.get('/', async (c) => {
  const items = await c.get('db').admin.findMany({
    select: ADMIN_SELECT,
    orderBy: { createdAt: 'asc' },
  });
  return c.json({ data: items });
});

adminsRouter.post('/', zValidator('json', createSchema), async (c) => {
  const db = c.get('db');
  const { email, name, password, role } = c.req.valid('json');

  const existing = await db.admin.findUnique({ where: { email }, select: { id: true } });
  if (existing) return fail(c, 'CONFLICT', 'Email already in use');

  try {
    const item = await db.admin.create({
      data: { email, name, role, password: await hashPassword(password) },
      select: ADMIN_SELECT,
    });
    return c.json({ data: item }, 201);
  } catch (err) {
    // Poyga holati: pre-check va yozish orasida boshqa so'rov email'ni band qilgan.
    if (typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 'P2002') {
      return fail(c, 'CONFLICT', 'Email already in use');
    }
    throw err;
  }
});

adminsRouter.patch('/:id', zValidator('json', updateSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const selfId = c.get('adminId');

  const all = await db.admin.findMany({ select: { id: true, role: true, isActive: true } });
  const target = all.find((a) => a.id === id);
  if (!target) return fail(c, 'NOT_FOUND', 'Admin not found');

  if (id === selfId) {
    if (body.role !== undefined && body.role !== target.role) {
      return fail(c, 'SELF_ACTION', 'Cannot change own role');
    }
    if (body.isActive === false) {
      return fail(c, 'SELF_ACTION', 'Cannot deactivate yourself');
    }
  }

  const next = {
    role: body.role ?? target.role,
    isActive: body.isActive ?? target.isActive,
  };
  if (!leavesActiveSuperAdmin(all, id, next)) {
    return fail(c, 'LAST_SUPER_ADMIN', 'At least one active super admin is required');
  }

  const item = await db.admin.update({
    where: { id },
    data: { name: body.name, role: body.role, isActive: body.isActive },
    select: ADMIN_SELECT,
  });
  return c.json({ data: item });
});

adminsRouter.post('/:id/reset-password', zValidator('json', resetSchema), async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');
  const { password } = c.req.valid('json');

  const target = await db.admin.findUnique({ where: { id }, select: { id: true } });
  if (!target) return fail(c, 'NOT_FOUND', 'Admin not found');

  await db.admin.update({ where: { id }, data: { password: await hashPassword(password) } });
  return c.json({ data: { success: true } });
});

adminsRouter.delete('/:id', async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  if (id === c.get('adminId')) return fail(c, 'SELF_ACTION', 'Cannot delete yourself');

  const all = await db.admin.findMany({ select: { id: true, role: true, isActive: true } });
  if (!all.some((a) => a.id === id)) return fail(c, 'NOT_FOUND', 'Admin not found');
  if (!leavesActiveSuperAdmin(all, id, null)) {
    return fail(c, 'LAST_SUPER_ADMIN', 'At least one active super admin is required');
  }

  await db.admin.delete({ where: { id } });
  return c.json({ data: { success: true } });
});
