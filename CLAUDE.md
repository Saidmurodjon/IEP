# CLAUDE.md

O'zbekiston Respublikasi Fanlar akademiyasi **Energetika muammolari instituti** rasmiy veb-sayti.
Bu fayl Claude Code uchun loyiha qoidalari. Ish boshlashdan oldin to'liq o'qing.

---

## 1. Loyiha haqida

Rasmiy davlat ilmiy muassasasi sayti. Bu shuni anglatadi:

- **Xavfsizlik birinchi o'rinda.** Bu blog emas — admin panel buzilsa, institut nomidan soxta kontent chiqadi.
- **Uch til majburiy** (uz / en / ru). Har qanday yangi kontent modeli uchta tilda bo'lishi shart.
- **Ishonchlilik > tezlik.** Yarim ishlaydigan funksiyani deploy qilishdan ko'ra, kechroq to'liq chiqargan afzal.

Sayt hozir ishlab turibdi:
- Frontend: https://energetika-institute.pages.dev (Cloudflare Pages)
- API: https://energetika-api.saidmurodjon1020.workers.dev (Cloudflare Workers)
- Kelajakda: `iep.uz`

---

## 2. Texnologiyalar

| Qatlam | Texnologiya |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, react-router-dom |
| i18n | react-i18next (uz/en/ru) |
| State | Zustand (`apps/web/src/store`) |
| HTTP | axios (`apps/web/src/lib/api.ts`) |
| Backend | Hono → Cloudflare Workers |
| DB | Neon PostgreSQL + Prisma (`@prisma/adapter-neon`) |
| Auth | JWT (Web Crypto, HS256) |

**Muhim cheklov:** API Cloudflare Workers'da ishlaydi, Node.js'da emas.
Node-ga xos modullar (`fs`, `crypto` moduli, `bcryptjs`, `jsonwebtoken`) **ishlamaydi**.
Faqat Web Crypto API (`crypto.subtle`) va Workers qo'llab-quvvatlaydigan kutubxonalardan foydalaning.

---

## 3. Tuzilma

```
apps/
  web/          React + Vite frontend
    src/pages/public/   Ochiq sahifalar (Home, About, Structure, Labs, News, Publications, Contact)
    src/pages/admin/    Admin panel (Login, Dashboard, News, Publications, Structure, Settings, Messages)
    src/lib/api.ts      Barcha API chaqiruvlari SHU YERDA
    src/i18n/locales/   uz.json / en.json / ru.json
  api/          Hono API
    src/routes/         auth, news, publications, structure, settings, contact
    src/middleware/     requireAuth
    src/lib/            db, jwt
packages/
  db/           Prisma schema + seed
  shared/       Ikkala app ishlatadigan tiplar
```

---

## 4. Qat'iy qoidalar

### 4.1 Xavfsizlik

1. **Hech qachon secret uchun default qiymat yozmang.**
   `c.env.JWT_SECRET ?? 'dev-secret'` kabi kod — kritik zaiflik. Secret yo'q bo'lsa, xato tashlang (fail closed).
2. **Parolni hech qachon oddiy hash bilan saqlamang.** Salt'siz SHA-256 / MD5 taqiqlanadi.
3. **Secret'lar hech qachon repoga tushmasin.** `.env` `.gitignore` da. Workers secret'lari faqat `wrangler secret put` orqali.
4. **Har bir yozuv (POST/PUT/PATCH/DELETE) endpoint'i `requireAuth` bilan himoyalansin.** Faqat quyidagilar ochiq:
   `GET /api/news`, `GET /api/news/:slug`, `GET /api/publications`, `GET /api/publications/:id`,
   `GET /api/structure`, `GET /api/settings`, `POST /api/contact`.
5. **Kiruvchi ma'lumot doim zod bilan tekshirilsin** (`zValidator`). Validatsiyasiz `c.req.json()` ishlatmang.
6. **Xato xabarlari ichki tafsilotni oshkor qilmasin.** Login uchun doim `Invalid credentials` — "email topilmadi" demang.
7. **HTML kontent** (`contentUz` va h.k.) frontendda `dangerouslySetInnerHTML` bilan chiqariladi — uni ko'rsatishdan oldin sanitizatsiya qiling.

### 4.2 Ma'lumotlar bazasi

8. **Schema o'zgarsa — migratsiya yozing.** `prisma db push` ishlatmang, `prisma migrate dev` ishlating.
9. **Yangi kontent modelida uch til majburiy**: `nameUz/nameEn/nameRu` yoki `titleUz/titleEn/titleRu`.
10. **Prisma client Workers'da `getDb(c.env.DATABASE_URL)` orqali olinadi**, global `new PrismaClient()` yozmang.

### 4.3 Frontend

11. **Barcha API chaqiruvlari `src/lib/api.ts` orqali.** Komponent ichida to'g'ridan-to'g'ri `axios` yoki `fetch` yozmang.
12. **Matnlar hard-code qilinmasin** — `useTranslation()` va `locales/*.json`. Yangi matn qo'shsangiz, **uchala** json'ni ham yangilang.
13. **Yangi admin sahifasi `ProtectedRoute` ichida bo'lsin** (`App.tsx`).
14. **Tailwind utility class'lari** ishlatiladi; alohida CSS fayl yaratmang.

### 4.4 Umumiy

15. **TypeScript `strict`.** `any` ishlatmang; iloji bo'lmasa `unknown` + tekshiruv.
16. **Build artefaktlarini commit qilmang** (`*.tsbuildinfo`, `dist/`, generatsiya qilingan `vite.config.js`).
17. **Kommentlar o'zbekcha yoki inglizcha** — lekin loyiha bo'ylab bir xil bo'lsin. Yangi kod uchun: o'zbekcha.
18. **Kommit xabarlari Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

---

## 5. Ma'lum muammolar (tuzatilishi kerak)

Ustuvorlik tartibida. Batafsil topshiriqlar: `docs/tasks/`.

| # | Muammo | Holat |
|---|---|---|
| 1 | ~~Admin login umuman ishlamaydi~~ — bcrypt o'rniga PBKDF2-HMAC-SHA256 (`packages/shared/src/password.ts`) | ✅ Tuzatildi |
| 2 | ~~JWT_SECRET fallback repoda ochiq~~ — fallback o'chirildi, `lib/env.ts` fail closed (secret yo'q/32 belgidan qisqa → 500) | ✅ Tuzatildi |
| 3 | ~~Parol hashlash — salt'siz SHA-256~~ — PBKDF2, 210 000 iteratsiya, 16-baytli tasodifiy salt, timing-safe taqqoslash | ✅ Tuzatildi |
| 4 | ~~`/api/auth/login` da rate limit yo'q~~ — IP+email uchun 15 daqiqada 5 urinish, 6-chisi 429 (TODO: KV/Durable Object) | ✅ Tuzatildi |
| 5 | Fayl yuklash yo'q — R2 binding yo'q, `imageUrl`/`fileUrl` faqat qo'lda URL | 🟠 Ochiq |
| 6 | Kontakt formasi email yubormaydi, faqat bazaga yozadi | 🟠 Ochiq |
| 7 | SSR/prerender va sitemap yo'q — SEO nolga teng | 🟠 Ochiq |
| 8 | Bazada faqat demo ma'lumot (`prof. Mirzayev A.K.` — o'ylab topilgan) | 🟡 Ochiq |
| 9 | Cloudflare Pages GitHub'ga ulanmagan — deploy qo'lda | 🟡 Ochiq |
| 10 | Test yo'q, CI yo'q | 🟡 Ochiq |
| 11 | ~~`apps/api/src/lib/db.ts` — `PrismaNeon` HTTP drayveri bilan noto'g'ri ishlatilgan~~ — `PrismaNeonHTTP` ga o'tkazildi, haqiqiy Neon bilan tekshirildi | ✅ Tuzatildi |

Muammoni tuzatganingizda shu jadvalni ham yangilang (🔴 → ✅).

---

## 6. Ishlash tartibi

```bash
npm install
cp .env.example .env        # DATABASE_URL va JWT_SECRET ni to'ldiring
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev                 # web :5173, api :3000
```

Deploy:
```bash
cd apps/api && wrangler deploy          # secret'lar oldindan o'rnatilgan bo'lsin
cd apps/web && npm run build            # VITE_API_URL Pages dashboard'da
```

---

## 7. Har bir o'zgarishdan keyin majburiy tekshiruv

Ishni tugadi deb hisoblashdan oldin:

1. `npx tsc --noEmit` — apps/api va apps/web da xato yo'q.
2. `cd apps/api && npm run build` (`wrangler deploy --dry-run`) — Workers uchun bundle yig'iladi.
3. Login yoki auth'ga tegilgan bo'lsa — **haqiqiy HTTP so'rov bilan** tekshiring, faqat kodni o'qib "to'g'ri ko'rinadi" demang.
4. Frontend o'zgargan bo'lsa — `npm run dev` da sahifani ochib ko'ring.
5. O'zgarishlar xulosasini ayting: qaysi fayllar, nima uchun, nima tekshirildi.

**Tekshirilmagan ishni "tayyor" deb aytmang.** Agar biror narsani tekshira olmagan bo'lsangiz, buni ochiq ayting.

---

## 8. Nima qilmaslik kerak

- Ruxsatsiz `git push` qilmang. Kommit qiling, push'ni men qilaman.
- Ma'lumotlar bazasidan ma'lumot o'chirmang (`migrate reset`, `DELETE FROM`) — avval so'rang.
- Production'ga (`wrangler deploy`) so'ramasdan deploy qilmang.
- Katta refactor'ni o'z bilganingizcha boshlamang — avval reja taklif qiling.
- Ishlab turgan funksiyani "yaxshilash" uchun sindirmang.
