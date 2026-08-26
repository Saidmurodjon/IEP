import { describe, it, expect } from 'vitest';
import {
  REDACTED, bodyFieldNames, maskEmail, redactHeaders, redactMessage,
  redactObject, redactStack, redactText,
} from '../redact';

/**
 * `redact.ts` uchun birlik sinovlari.
 *
 * Bu fayl xavfsizlik chegarasini tekshiradi: parol, token va shaxsiy
 * ma'lumot jurnalga tushmasligi kerak. Yangi maxfiy maydon qo'shilsa,
 * unga MOS SINOV ham shu yerga yoziladi.
 */

describe('maskEmail', () => {
  it('faqat birinchi harfni qoldiradi, domen saqlanadi', () => {
    expect(maskEmail('saidmurod@academy.uz')).toBe('s***@academy.uz');
    expect(maskEmail('a@b.uz')).toBe('a***@b.uz');
  });

  it('pochta bo\'lmagan matnni butunlay yashiradi', () => {
    expect(maskEmail('salom')).toBe(REDACTED);
    expect(maskEmail('@academy.uz')).toBe(REDACTED);
  });
});

describe('redactText', () => {
  it('ulanish satrini yashiradi', () => {
    const text = 'connect failed: postgresql://neondb_owner:SuperSecret@ep-x.neon.tech/neondb';
    const out = redactText(text);
    expect(out).not.toContain('SuperSecret');
    expect(out).not.toContain('neondb_owner');
    expect(out).toContain(REDACTED);
  });

  it('Bearer tokenni yashiradi', () => {
    const out = redactText('Authorization: Bearer abc.def.ghi123');
    expect(out).not.toContain('abc.def.ghi123');
    expect(out).toContain(REDACTED);
  });

  it('sarlavhasiz JWT ni ham yashiradi', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbklkIjoiMSJ9.s1gnatur3';
    const out = redactText(`token=${jwt} bilan kirdi`);
    expect(out).not.toContain('s1gnatur3');
    expect(out).toContain(REDACTED);
  });

  it('kalit=qiymat juftliklarini yashiradi', () => {
    expect(redactText('password=Admin123!')).not.toContain('Admin123!');
    expect(redactText('parol: "MaxfiyParol"')).not.toContain('MaxfiyParol');
    expect(redactText('"apiKey": "sk-12345"')).not.toContain('sk-12345');
    expect(redactText('JWT_SECRET=abcdefghijklmnop')).not.toContain('abcdefghijklmnop');
  });

  it('pochta manzillarini niqoblaydi', () => {
    const out = redactText('foydalanuvchi admin@iep.uz tizimga kirdi');
    expect(out).toContain('a***@iep.uz');
    expect(out).not.toContain('admin@iep.uz');
  });

  it('oddiy matnni o\'zgartirmaydi', () => {
    expect(redactText('Yangilik saqlanmadi')).toBe('Yangilik saqlanmadi');
  });

  it('matn bo\'lmasa bo\'sh satr qaytaradi', () => {
    expect(redactText(null)).toBe('');
    expect(redactText(undefined)).toBe('');
    expect(redactText(42)).toBe('');
  });
});

describe('redactObject', () => {
  it('maxfiy kalitlarni yashiradi', () => {
    const out = redactObject({
      email: 'admin@iep.uz',
      password: 'Admin123!',
      token: 'eyJhbGciOi.x.y',
      authorization: 'Bearer xyz',
      cookie: 'session=abc',
      phone: '+998 90 123-45-67',
      title: 'Yangilik',
    }) as Record<string, unknown>;

    expect(out.password).toBe(REDACTED);
    expect(out.token).toBe(REDACTED);
    expect(out.authorization).toBe(REDACTED);
    expect(out.cookie).toBe(REDACTED);
    expect(out.phone).toBe(REDACTED);
    expect(out.title).toBe('Yangilik');
    expect(out.email).toBe('a***@iep.uz');
  });

  it('kalit nomining turli yozilishini taniydi', () => {
    const out = redactObject({
      'Authorization': 'Bearer a',
      'X-Auth-Token': 'b',
      'user_password': 'c',
      'DATABASE_URL': 'postgres://u:p@h/db',
    }) as Record<string, unknown>;
    expect(Object.values(out).every((v) => v === REDACTED)).toBe(true);
  });

  it('so\'rov tanasini butunlay tushiradi', () => {
    const out = redactObject({ path: '/api/contact', body: { message: 'maxfiy' } }) as Record<string, unknown>;
    expect(out.body).toBeUndefined();
    expect(out.path).toBe('/api/contact');
  });

  it('ichma-ich obyektlarni ham tozalaydi', () => {
    const out = redactObject({ req: { headers: { authorization: 'Bearer z' } } }) as Record<string, unknown>;
    const req = out.req as Record<string, unknown>;
    const headers = req.headers as Record<string, unknown>;
    expect(headers.authorization).toBe(REDACTED);
  });

  it('juda chuqur obyektda to\'xtaydi (cheksiz rekursiyaga tushmaydi)', () => {
    type Nested = { next?: Nested; value?: string };
    const deep: Nested = {};
    let cursor = deep;
    for (let i = 0; i < 20; i++) {
      cursor.next = {};
      cursor = cursor.next;
    }
    expect(() => redactObject(deep)).not.toThrow();
  });

  it('halqali havolada ham yiqilmaydi', () => {
    const a: Record<string, unknown> = { name: 'a' };
    a.self = a;
    expect(() => redactObject(a)).not.toThrow();
  });
});

describe('bodyFieldNames', () => {
  it('faqat maydon nomlarini qaytaradi, qiymatlarni emas', () => {
    const names = bodyFieldNames({ email: 'a@b.uz', password: 'x', message: 'maxfiy matn' });
    expect(names).toEqual(['email', 'password', 'message']);
    expect(names.join(' ')).not.toContain('maxfiy');
  });

  it('obyekt bo\'lmasa bo\'sh ro\'yxat', () => {
    expect(bodyFieldNames('matn')).toEqual([]);
    expect(bodyFieldNames(null)).toEqual([]);
    expect(bodyFieldNames([1, 2])).toEqual([]);
  });
});

describe('redactStack', () => {
  it('zanjirni qisqartiradi va tozalaydi', () => {
    const stack = ['Error: postgres://u:secret@h/db'].concat(
      Array.from({ length: 30 }, (_, i) => `    at fn${i} (file.ts:${i})`)
    ).join('\n');
    const out = redactStack(stack);
    expect(out).not.toContain('secret');
    expect(out!.split('\n').length).toBeLessThanOrEqual(12);
  });

  it('bo\'sh zanjir uchun null', () => {
    expect(redactStack('')).toBeNull();
    expect(redactStack(undefined)).toBeNull();
  });
});

describe('redactMessage', () => {
  it('uzun matnni qisqartiradi', () => {
    expect(redactMessage('x'.repeat(5000)).length).toBe(1000);
  });

  it('bo\'sh xabar uchun o\'rin egallovchi', () => {
    expect(redactMessage('')).toBe('Unknown error');
    expect(redactMessage(null)).toBe('Unknown error');
  });

  it('maxfiy qismni yashiradi', () => {
    expect(redactMessage('login failed for admin@iep.uz password=X1')).not.toContain('X1');
  });
});

describe('redactHeaders', () => {
  it('faqat xavfsiz sarlavhalarni qoldiradi', () => {
    const out = redactHeaders({
      'authorization': 'Bearer abc',
      'cookie': 'a=b',
      'user-agent': 'Mozilla/5.0',
      'referer': 'https://iep.uz/uz/news',
      'x-secret': 'nope',
    });
    expect(out.authorization).toBeUndefined();
    expect(out.cookie).toBeUndefined();
    expect(out['x-secret']).toBeUndefined();
    expect(out['user-agent']).toBe('Mozilla/5.0');
    expect(out.referer).toBe('https://iep.uz/uz/news');
  });
});
