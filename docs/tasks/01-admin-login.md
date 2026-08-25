# Topshiriq 01 — Admin panelga kirishni ishlaydigan holga keltirish

**Ustuvorlik:** 🔴 Kritik — birinchi navbatda
**Tegishli fayllar:** `apps/api/src/routes/auth.ts`, `apps/api/src/middleware/auth.ts`, `apps/api/src/lib/jwt.ts`, `packages/db/src/seed.ts`, `packages/shared/src/`

---

## Muammo

Admin panel to'liq yozilgan (7 ta sahifa), lekin **unga kirib bo'lmaydi**. Login har doim `401` qaytaradi.

Sabab — hashlash usullari mos kelmaydi:

`packages/db/src/seed.ts` parolni **bcrypt** bilan yozadi:
```ts
const hashedPassword = await hash('Admin123!', 12);   // "$2b$12$..."
```

`apps/api/src/routes/auth.ts` esa bcrypt'ni tekshira olmaydi va shartsiz `false` qaytaradi:
```ts
if (stored.startsWith('$2')) {
  return false;
}
```

Ikkinchi urinish ham ishlamaydi — bcrypt hash SHA-256 hex bilan solishtiriladi:
```ts
const plainMatch = admin.password === await hashPassword(password);   // doim false
```

Natija: `admin@energetika.uz / Admin123!` bilan kirish mumkin emas.

### Ikkinchi muammo (shu topshiriq ichida hal qilinadi)

`auth.ts` va `middleware/auth.ts` da bir xil qator bor:
```ts
const secret = c.env.JWT_SECRET ?? 'dev-secret-change-in-production';
```
Bu default qiymat **repoda ochiq turibdi**. Agar Worker'da `JWT_SECRET` o'rnatilmagan bo'lsa, istalgan odam shu satr bilan haqiqiy admin JWT yasab, saytni to'liq boshqara oladi.

---

## Nima qilish kerak

### 1. PBKDF2 asosidagi parol moduli

`bcrypt` Cloudflare Workers'da ishlamaydi, shuning uchun undan butunlay voz kechamiz.
O'rniga **PBKDF2-HMAC-SHA256** (Web Crypto `crypto.subtle`) — u Workers'da ham, Bun'da ham, Node 18+ da ham bir xil ishlaydi.

Modul `packages/shared/src/` ichida bo'lsin (API ham, seed ham ishlatadi) va `packages/shared/src/index.ts` dan eksport qilinsin.

Talablar:

- Har bir parol uchun **tasodifiy salt** (kamida 16 bayt, `crypto.getRandomValues`).
- Iteratsiya soni: **kamida 210 000** (OWASP 2023 tavsiyasi PBKDF2-HMAC-SHA256 uchun).
- Saqlanadigan format — bitta string, ichida algoritm, iteratsiya, salt va hash bo'lsin.
  Masalan: `pbkdf2$sha256$<iterations>$<saltBase64>$<hashBase64>`.
  Format o'zini tavsiflashi kerak — kelajakda parametrlar o'zgarsa, eski hash'lar ham tekshirilishi mumkin bo'lsin.
- Taqqoslash **timing-safe** bo'lsin (oddiy `===` emas — bayt-bayt XOR, erta `return` qilmasdan).
- `verifyPassword` hech qachon `throw` qilmasin — format buzuq bo'lsa `false` qaytarsin.
- `packages/db` ga `@energetika/shared` dependency sifatida qo'shilsin (hozir yo'q).

### 2. `auth.ts` login'ini qayta yozish

- Yangi moduldagi `verifyPassword` ishlatilsin. Eski `hashPassword`/`verifyPassword` funksiyalari o'chirilsin.
- **User enumeration** bo'lmasin: email topilmasa ham parol tekshiruvi bajarilsin (dummy hash bilan), javob vaqti bir xil bo'lsin. Xato xabari ikkala holatda ham `Invalid credentials`.
- **Rate limiting**: bitta IP + email juftligi uchun 15 daqiqada 5 tadan ko'p urinish bo'lsa `429`.
  Hozircha Worker xotirasidagi `Map` yetarli; kodga `TODO: KV yoki Durable Object` izohi qo'shilsin.
- `loginSchema` da parol minimal uzunligi `6` dan **`8`** ga oshirilsin.

### 3. JWT secret fallback'ini olib tashlash

- `?? 'dev-secret-change-in-production'` ikkala fayldan ham **butunlay** o'chirilsin.
- Secret'ni bitta joydan oladigan yordamchi funksiya bo'lsin (masalan `apps/api/src/lib/env.ts`).
  Secret yo'q yoki 32 belgidan qisqa bo'lsa — `throw`.
- `middleware/auth.ts` da: secret yo'qligi **konfiguratsiya xatosi**, shuning uchun `500` qaytarsin, `401` emas. Foydalanuvchi tokeni noto'g'ri bo'lsa — `401`.
- `middleware/auth.ts` hozir JWT'ni qo'lda tekshiryapti, `lib/jwt.ts` dagi `verifyToken` esa alohida turibdi — bir xil mantiq ikki joyda. Middleware `verifyToken` ni chaqirsin.

### 4. `seed.ts` ni moslash

- `bcryptjs` import'i olib tashlansin, yangi `hashPassword` ishlatilsin.
- Parol **kodda hard-code qilinmasin** — `process.env.ADMIN_PASSWORD` dan olinsin.
  O'zgaruvchi yo'q bo'lsa, seed aniq xato xabari bilan to'xtasin (jimgina default parol qo'ymasin).
- `.env.example` dagi `ADMIN_PASSWORD` izohi shunga mos yangilansin.
- `apps/api/package.json` dan endi kerak bo'lmagan `bcryptjs`, `@types/bcryptjs`, `jsonwebtoken`, `@types/jsonwebtoken` dependency'lari olib tashlansin (ular Workers'da baribir ishlamaydi).

### 5. Parolni almashtirish endpoint'i

`POST /api/auth/change-password` qo'shilsin:
- `requireAuth` bilan himoyalangan.
- Joriy parolni tekshiradi, yangisini kamida 10 belgi talab qiladi.
- README'dagi "birinchi kirishdan keyin parolni almashtiring" ko'rsatmasi shusiz bajarib bo'lmaydi.

---

## Qabul mezonlari

Har birini **haqiqatan bajarib** ko'ring, kodni o'qib taxmin qilmang.

- [ ] `npx tsc --noEmit` — `apps/api` da xato yo'q.
- [ ] `cd apps/api && npm run build` (`wrangler deploy --dry-run`) muvaffaqiyatli.
- [ ] Repo bo'ylab `dev-secret-change-in-production` qatori qolmagan (`grep -r` bilan tekshiring).
- [ ] Repo bo'ylab `bcrypt` ishlatilmayapti.
- [ ] Lokal API ishga tushadi, seed yangi admin yozadi.
- [ ] `POST /api/auth/login` to'g'ri parol bilan → `200` va token qaytaradi.
- [ ] Noto'g'ri parol bilan → `401`, xabar `Invalid credentials`.
- [ ] Mavjud bo'lmagan email bilan → `401`, **xuddi shu** xabar.
- [ ] 6-urinishdan keyin → `429`.
- [ ] `GET /api/auth/me` olingan token bilan → `200`.
- [ ] Token'ning oxirgi belgisi o'zgartirilsa → `401`.
- [ ] `JWT_SECRET` o'chirilgan holda API ishga tushirilsa, himoyalangan endpoint `500` qaytaradi (`401` emas) va login ham ishlamaydi.
- [ ] Brauzerda `http://localhost:5173/admin/login` orqali kirib, Dashboard ochiladi.

## Tugatgandan keyin

- `CLAUDE.md` dagi "Ma'lum muammolar" jadvalida 1, 2, 3 va 4-qatorlar ✅ ga o'zgartirilsin.
- Kommit: `fix(auth): replace broken bcrypt check with PBKDF2 and remove JWT secret fallback`
- **Push qilmang** — men tekshirib, o'zim push qilaman.

## Diqqat

Production bazasidagi mavjud admin yozuvida hali ham eski bcrypt hash turibdi.
Kod tayyor bo'lgach, o'sha yozuvni yangi format bilan qayta yozish kerak bo'ladi — buni **men bajaraman**, siz bazaga tegmang.
