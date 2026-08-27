# CLAUDE.md

O'zbekiston Respublikasi Fanlar akademiyasi **Energetika muammolari instituti** rasmiy veb-sayti.
Bu fayl Claude Code uchun loyiha qoidalari. Ish boshlashdan oldin to'liq o'qing.

> ⚠️ **Har bir sessiya `docs/JOURNAL.md` ni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.**
> Batafsil qoida — 9-bo'lim. Buni o'tkazib yubormang: sizdan oldin nima qilinganini faqat shu fayl biladi.

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
    src/pages/public/   Ochiq sahifalar (Home, About, Management, Structure, Labs, LabDetail,
                        Employees, News, Publications, Documents, Contact, AppealStatus,
                        NotFound)
    src/pages/admin/    Admin panel (Login, Dashboard, News, Publications, Structure, Employees,
                        Partners, Documents, Settings, Messages)
    src/lib/api.ts      Barcha API chaqiruvlari SHU YERDA
    src/i18n/locales/   uz.json / en.json / ru.json
  api/          Hono API
    src/routes/         auth, news, publications, structure, settings, contact, employees,
                        partners, documents, uploads, files
    src/lib/            db, jwt, env, errors, storage, file-types, sanitize, media,
                        redact, error-log, mail, mail-templates
    src/lib/__tests__/  vitest birlik sinovlari (`npm test --workspace=apps/api`)
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
   `GET /api/structure`, `GET /api/settings`, `GET /api/employees`, `GET /api/employees/:id`,
   `GET /api/partners`, `GET /api/documents`, `GET /api/files/:key`, `POST /api/contact`,
   `GET /api/contact/status`, `POST /api/logs/client`.
   **`POST /api/logs/client` nega ochiq:** JavaScript xatosi tizimga kirmagan foydalanuvchida
   ham yuz beradi, shuning uchun uni `requireAuth` bilan yopib bo'lmaydi. Buning evaziga
   cheklovlar qattiq: IP bo'yicha daqiqasiga 10 ta, matn uzunligi cheklangan, `zValidator`.
5. **Kiruvchi ma'lumot doim zod bilan tekshirilsin** (`zValidator`). Validatsiyasiz `c.req.json()` ishlatmang.
6. **Xato xabarlari ichki tafsilotni oshkor qilmasin.** Login uchun doim `Invalid credentials` — "email topilmadi" demang.
7. ✅ **HTML kontent sanitizatsiyasi bajarildi.** Server saqlashdan oldin tozalaydi
   (`apps/api/src/lib/sanitize.ts`, allowlist), frontend ko'rsatishdan oldin ikkinchi marta
   tozalaydi (`apps/web/src/lib/sanitize.ts`, DOMPurify). Ruxsat etilgan teglar ro'yxatini
   kengaytirsangiz — **ikkala faylni ham** yangilang. `img` faqat `/api/files/` dan.

### 4.2 Ma'lumotlar bazasi

8. **Schema o'zgarsa — migratsiya yozing.** `prisma db push` ishlatmang, `prisma migrate dev` ishlating.
9. **Yangi kontent modelida uch til majburiy**: `nameUz/nameEn/nameRu` yoki `titleUz/titleEn/titleRu`.
10. **Prisma client Workers'da `getDb(c.env.DATABASE_URL)` orqali olinadi**, global `new PrismaClient()` yozmang.

### 4.3 Frontend

11. **Barcha API chaqiruvlari `src/lib/api.ts` orqali.** Komponent ichida to'g'ridan-to'g'ri `axios` yoki `fetch` yozmang.
12. **Matnlar hard-code qilinmasin** — `useTranslation()` va `locales/*.json`. Yangi matn qo'shsangiz, **uchala** json'ni ham yangilang.
13. **Yangi admin sahifasi `ProtectedRoute` ichida bo'lsin** (`App.tsx`).
14. **Tailwind utility class'lari** ishlatiladi; alohida CSS fayl yaratmang.
15. **Ochiq sahifalardagi barcha ichki havolalar `LocalizedLink` (yoki `LocalizedNavLink`) orqali yozilsin.**
    `react-router-dom` dan olingan oddiy `Link`/`NavLink` ochiq qismda ishlatilmaydi — u til
    prefiksini yo'qotadi. `to` prefikssiz beriladi (`to="/news"`), prefiksni komponent qo'yadi.
    Dastur ichida yo'naltirish kerak bo'lsa, `useLocalizedPath()` bilan manzil tayyorlanadi.
    Admin marshrutlari (`/admin/...`) prefikssiz qoladi va oddiy `Link` bilan yoziladi.
    Yangi ochiq sahifa qo'shilganda u avval `src/lib/routes.ts` dagi `PUBLIC_ROUTES` ro'yxatiga
    yoziladi, keyin `App.tsx` ga.
16. **Fayl yuklash faqat `POST /api/uploads` orqali.** Fayl turi **magic bayt** bo'yicha
    aniqlanadi (`lib/file-types.ts`) — `Content-Type` va kengaytmaga ishonilmaydi. SVG
    qabul qilinmaydi. Yangi format qo'shsangiz imzosini ham yozing.
17. **Fayl o'chirish faqat `media_files` jadvalida qayd etilgan kalitlar bo'yicha.** Ombor
    bo'ylab ommaviy o'chirish (`list()` + `delete`) hech qachon qilinmaydi.
18. **Jurnalga yoziladigan har qanday ma'lumot `lib/redact.ts` dan o'tkazilsin.** Parol,
    token, `Authorization`/`Cookie`, murojaat matni, telefon va ulanish satri hech qachon
    yozilmaydi; pochta niqoblanadi. Yangi maxfiy maydon qo'shsangiz — `redact.test.ts` ga
    unga mos sinov ham yozing.
19. **Admin paneldagi barcha xabarlar `useToast()` orqali.** Xato kodi API dan keladi,
    o'zbekcha matn `locales/*.json` dagi `errors.<KOD>` dan olinadi.


### 4.4 Umumiy

20. **TypeScript `strict`.** `any` ishlatmang; iloji bo'lmasa `unknown` + tekshiruv.
21. **Build artefaktlarini commit qilmang** (`*.tsbuildinfo`, `dist/`, generatsiya qilingan `vite.config.js`).
22. **Kommentlar o'zbekcha yoki inglizcha** — lekin loyiha bo'ylab bir xil bo'lsin. Yangi kod uchun: o'zbekcha.
23. **Kommit xabarlari Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

---

## 5. Ma'lum muammolar (tuzatilishi kerak)

Ustuvorlik tartibida. Batafsil topshiriqlar: `docs/tasks/`.

| # | Muammo | Holat |
|---|---|---|
| 1 | ~~Admin login umuman ishlamaydi~~ — bcrypt o'rniga PBKDF2-HMAC-SHA256 (`packages/shared/src/password.ts`) | ✅ Tuzatildi |
| 2 | ~~JWT_SECRET fallback repoda ochiq~~ — fallback o'chirildi, `lib/env.ts` fail closed (secret yo'q/32 belgidan qisqa → 500) | ✅ Tuzatildi |
| 3 | ~~Parol hashlash — salt'siz SHA-256~~ — PBKDF2, 210 000 iteratsiya, 16-baytli tasodifiy salt, timing-safe taqqoslash | ✅ Tuzatildi |
| 4 | ~~`/api/auth/login` da rate limit yo'q~~ — IP+email uchun 15 daqiqada 5 urinish, 6-chisi 429 (TODO: KV/Durable Object) | ✅ Tuzatildi |
| 5 | ~~Fayl yuklash yo'q~~ — R2 binding (`MEDIA`), `POST /api/uploads` magic bayt tekshiruvi bilan, `MediaFile` jadvali, avtomatik tozalash, tiptap tahrirlagich. Production'da bucket yaratilishi kerak | ✅ Tuzatildi |
| 6 | ~~Kontakt formasi email yubormaydi~~ — Resend orqali fuqaroga tasdiq, institutga bildirishnoma va holat o'zgarganda xabar. Murojaat raqami `M-YYYY-NNNN`, holat kuzatuvi, spam himoyasi. `RESEND_API_KEY` va `MAIL_FROM` production'da o'rnatilishi kerak | ✅ Tuzatildi |
| 7 | SSR/prerender va sitemap yo'q — SEO nolga teng | 🟠 Ochiq |
| 8 | ~~Bazada faqat demo ma'lumot~~ — tuzilma rasmiy 2025 hujjatiga ko'chirildi (kod tayyor, lokal test bazada tasdiqlangan). Production seed foydalanuvchi tasdig'ini kutmoqda; demo nashrlar hali qolgan | 🟠 Qisman |
| 9 | ~~Cloudflare Pages GitHub'ga ulanmagan~~ — GitHub Actions workflow yozildi (`.github/workflows/deploy.yml`), sozlash: `docs/deploy.md`. Secret'lar + baseline foydalanuvchi tomonidan kutilmoqda | 🟠 Qisman |
| 10 | Test yo'q, CI yo'q — `redact.ts` uchun 23 ta vitest sinovi yozildi, qolgan modullar hali qamrab olinmagan, CI yo'q | 🟠 Qisman |
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
1a. `npm test --workspace=apps/api` — birlik sinovlari o'tadi.
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

---

## 8a. Samarali ishlash

Kontekst va token cheklangan resurs.

**O'qishda.** Butun faylni o'qimang, avval `grep` bilan kerakli joyni toping.
Bir marta o'qigan faylni qayta o'qimang. `git log`, `ls`, `build` chiqishlarini
`head` yoki `tail` bilan cheklang. Topshiriq faylini bir marta o'qing.

**Tekshirishda.** Skrinshot qimmat. Uni faqat dizayn o'zgarganda oling.
Mantiqni tekshirish uchun DOM so'rovi yoki HTTP javobi yetarli.

**Yozishda.** Butun faylni qayta yozmang, faqat o'zgargan qismni almashtiring.
Bir vaqtda bitta masala. Yo'l-yo'lakay topilgan boshqa kamchilikni darhol
tuzatmang, jurnalga yozing. Takroriy kod yozmang.

**Javob berishda.** Ikki uch jumla. Kod nusxasini javobga ko'chirmang.

**To'xtash.** Uch marta urinib xato tuzatilmasa to'xtang va so'rang.
Topshiriqda yo'q katta o'zgarish kerak bo'lsa, avval taklif qiling.

**Chegara.** Tezlik sifat hisobiga bo'lmasin. Kiruvchi ma'lumot tekshiruvi,
xato holatlari, `tsc` va `build` tozaligi, qabul mezonlarini haqiqatan bajarish —
bular hech qachon o'tkazib yuborilmaydi. Vaqt yetmasa hajmni qisqartiring.

---

## 9. Ish jurnali — `docs/JOURNAL.md`

Sessiyalar orasidagi yagona xotira. Git "nima o'zgardi" ni, jurnal "nega va
nima tekshirildi" ni saqlaydi.

**Boshlashda.** `docs/JOURNAL.md` ni o'qing, avval "HOZIRGI HOLAT" ni.
"Kim nima ustida ishlayapti" jadvaliga qarang, boshqa sessiya siz tegmoqchi
bo'lgan fayllarda ishlayotgan bo'lsa boshlamang. O'zingizni jadvalga qo'shing.
`git status` va `git log --oneline -5` bilan jurnal haqiqatga mos ekanini
tekshiring, mos kelmasa foydalanuvchidan so'rang.

**Tugatganda.** Kommitdan keyin "HOZIRGI HOLAT" ni to'liq yangilang.
"YOZUVLAR" tepasiga yangi yozuv qo'shing: sana, kommit, nima qilindi,
**nima tekshirildi va qanday**, **nima tekshirilmadi**, qabul qilingan
qarorlar va sabablari. O'zingizni jadvaldan o'chiring.

**Qoidalar.** "HOZIRGI HOLAT" doim joriy bo'lsin. Yozuv 25 qatordan oshmasin.
Yozuvlar tahrirlanmaydi va o'chirilmaydi, faqat yangisi qo'shiladi.
Jurnal 250 qatordan oshsa, eng eskisidan boshlab
`docs/journal-archive/YYYY-MM.md` ga ko'chiring. Tekshirilmagan narsani
"tayyor" deb yozmang. Jurnal ishning o'zi bilan birga kommit qilinsin.

**Parallel sessiyalar.** Bitta faylni ikki sessiya bir vaqtda tahrirlamasin.
Konflikt chiqsa o'zingiz hal qilmang, so'rang.
