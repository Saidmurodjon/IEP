import type { AdminRole } from '@prisma/client';

export interface AdminState {
  id: string;
  role: AdminRole;
  isActive: boolean;
}

const isActiveSuper = (a: Pick<AdminState, 'role' | 'isActive'>) =>
  a.role === 'SUPER_ADMIN' && a.isActive;

/**
 * Berilgan admin o'zgarishdan (yoki o'chirilishdan, `next = null`) keyin
 * tizimda kamida bitta faol SUPER_ADMIN qoladimi.
 */
export function leavesActiveSuperAdmin(
  all: AdminState[],
  targetId: string,
  next: Pick<AdminState, 'role' | 'isActive'> | null
): boolean {
  return all.some((a) => {
    if (a.id === targetId) return next !== null && isActiveSuper(next);
    return isActiveSuper(a);
  });
}
