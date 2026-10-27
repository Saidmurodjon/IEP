import { describe, expect, it } from 'vitest';
import { leavesActiveSuperAdmin, type AdminState } from '../admin-guard';

const a = (id: string, role: AdminState['role'], isActive = true): AdminState => ({ id, role, isActive });

describe('leavesActiveSuperAdmin', () => {
  const all = [a('1', 'SUPER_ADMIN'), a('2', 'SUPER_ADMIN'), a('3', 'ADMIN')];
  it('ikkinchi super admin bor — pasaytirish mumkin', () => {
    expect(leavesActiveSuperAdmin(all, '1', { role: 'ADMIN', isActive: true })).toBe(true);
  });
  it('yagona super adminni o\'chirib bo\'lmaydi', () => {
    expect(leavesActiveSuperAdmin([a('1', 'SUPER_ADMIN'), a('3', 'ADMIN')], '1', null)).toBe(false);
  });
  it('yagona faol super adminni bloklab bo\'lmaydi', () => {
    const list = [a('1', 'SUPER_ADMIN'), a('2', 'SUPER_ADMIN', false)];
    expect(leavesActiveSuperAdmin(list, '1', { role: 'SUPER_ADMIN', isActive: false })).toBe(false);
  });
  it('oddiy adminni o\'chirish super adminlarga tegmaydi', () => {
    expect(leavesActiveSuperAdmin([a('1', 'SUPER_ADMIN'), a('3', 'ADMIN')], '3', null)).toBe(true);
  });
});
