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
15. **Ochiq sahifalardagi barcha ichki havolalar `LocalizedLink` (yoki `LocalizedNavLink`) orqali yozilsin.**
    `react-router-dom` dan olingan oddiy `Link`/`NavLink` ochiq qismda ishlatilmaydi — u til
    prefiksini yo'qotadi. `to` prefikssiz beriladi (`to="/news"`), prefiksni komponent qo'yadi.
    Dastur ichida yo'naltirish kerak bo'lsa, `useLocalizedPath()` bilan manzil tayyorlanadi.
    Admin marshrutlari (`/admin/...`) prefikssiz qoladi va oddiy `Link` bilan yoziladi.
    Yangi ochiq sahifa qo'shilganda u avval `src/lib/routes.ts` dagi `PUBLIC_ROUTES` ro'yxatiga
    yoziladi, keyin `App.tsx` ga.

### 4.4 Umumiy

16. **TypeScript `strict`.** `any` ishlatmang; iloji bo'lmasa `unknown` + tekshiruv.
17. **Build artefaktlarini commit qilmang** (`*.tsbuildinfo`, `dist/`, generatsiya qilingan `vite.config.js`).
18. **Kommentlar o'zbekcha yoki inglizcha** — lekin loyiha bo'ylab bir xil bo'lsin. Yangi kod uchun: o'zbekcha.
19. **Kommit xabarlari Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

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
| 8 | ~~Bazada faqat demo ma'lumot~~ — tuzilma rasmiy 2025 hujjatiga ko'chirildi (kod tayyor, lokal test bazada tasdiqlangan). Production seed foydalanuvchi tasdig'ini kutmoqda; demo nashrlar hali qolgan | 🟠 Qisman |
| 9 | ~~Cloudflare Pages GitHub'ga ulanmagan~~ — GitHub Actions workflow yozildi (`.github/workflows/deploy.yml`), sozlash: `docs/deploy.md`. Secret'lar + baseline foydalanuvchi tomonidan kutilmoqda | 🟠 Qisman |
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

---

## 8a. Samarali ishlash

Kontekst cheklangan resurs. Uni tejab ishlatgan sessiya uzoqroq ishlaydi va
kamroq xato qiladi. Quyidagilar majburiy.

### 8a.1 O'qishda

**Butun faylni o'qimang.** Avval `grep` bilan kerakli joyni toping, keyin
faqat o'sha qismni o'qing. `apps/web/src/pages` dagi fayllar yuzlab qatordan
iborat, ularning to'liq mazmuni deyarli hech qachon kerak emas.

**Bir marta o'qigan faylni qayta o'qimang.** Tahrirlagandan keyin natijani
tekshirish uchun qayta o'qish shart emas, chunki tahrir muvaffaqiyatsiz
bo'lsa xato qaytadi.

**Katta chiqishlarni cheklang.** `git log`, `ls`, `npm run build` natijalarini
`head` yoki `tail` bilan qisqartiring.

**Topshiriq faylini bir marta o'qing** va undan ish rejasini tuzing. Har bir
qadamda qayta ochmang.

### 8a.2 Yozishda

**Kichik va aniq tahrirlar qiling.** Butun faylni qayta yozish o'rniga faqat
o'zgargan qismni almashtiring.

**Bir vaqtda bitta masalani hal qiling.** Yo'l-yo'lakay ko'zga tashlangan
boshqa kamchilikni darhol tuzatmang, uni jurnalga yozib qo'ying.

**Takroriy kod yozmang.** Bir xil mantiq ikkinchi marta kerak bo'lsa, uni
umumiy funksiyaga chiqaring. Uchinchi marta yozilayotgan bo'lsa, bu xato.

### 8a.3 Javob berishda

**Uzun tushuntirish yozmang.** Nima qilganingizni ikki uch jumlada ayting.
Kod nusxasini javobga ko'chirmang, fayl nomi va qator raqami yetarli.

**Bajarilgan ishni qayta sanab bermang.** Foydalanuvchi jarayonni kuzatib
turadi.

### 8a.4 Qachon to'xtash kerak

Uch marta urinib xato tuzatilmasa, davom etmang. To'xtang, nima
sinaganingizni va nima natija berganini yozing, foydalanuvchidan so'rang.

Topshiriqda yozilmagan katta o'zgarish kerak bo'lib qolsa, o'z bilganingizcha
boshlamang. Avval taklif qiling.

### 8a.5 Kod sifati

Tezlik sifat hisobiga bo'lmasin. Quyidagilar hech qanday holatda
o'tkazib yuborilmaydi.

Kiruvchi ma'lumot tekshiruvi. Xato holatlarini qayta ishlash.
`tsc` va `build` toza bo'lishi. Topshiriqdagi qabul mezonlarini haqiqatan
bajarib ko'rish.

Vaqt yetmasa, ishning **hajmini** qisqartiring, sifatini emas. Yarim
bajarilgan lekin to'g'ri ishlaydigan qism, to'liq lekin tekshirilmagan
ishdan yaxshiroq.

---

## 9. Ish jurnali — `docs/JOURNAL.md`

Kontekst siqilganda (compaction) yoki yangi sessiya boshlanganda, sizdan oldin nima qilinganini
**faqat shu fayl biladi**. Git tarixi "nima o'zgardi" ni ko'rsatadi, jurnal esa "nega, nima
tekshirildi, nima qolib ketdi" ni saqlaydi.

### 9.1 Ish boshlashda — majburiy

1. `docs/JOURNAL.md` ni o'qing. Avval **"HOZIRGI HOLAT"** blokini — u eng muhim qismi.
2. **"HOZIRDA KIM NIMA USTIDA ISHLAYAPTI"** jadvaliga qarang. Agar boshqa sessiya siz
   tegmoqchi bo'lgan fayllar ustida ishlayotgan bo'lsa — **boshlamang**, foydalanuvchidan so'rang.
3. O'zingizni o'sha jadvalga qo'shing: sessiya nomi, topshiriq, tegilayotgan fayllar, sana.
4. `git status` va `git log --oneline -5` bilan jurnal haqiqatga mos ekanini tekshiring.
   Mos kelmasa — foydalanuvchini ogohlantiring, o'zingiz taxmin qilib tuzatmang.

### 9.2 Ish tugaganda — majburiy

Kommit qilgandan **keyin**, quyidagilarni bajaring:

1. **"HOZIRGI HOLAT"** blokini yangilang — eskisini o'chirib, o'rniga joriy holatni yozing:
   HEAD, push qilinganmi, nima ishlaydi, nima ishlamaydi, keyingi qadam, ochiq savollar.
2. **"YOZUVLAR"** bo'limining **eng tepasiga** yangi yozuv qo'shing:
   - Sana, kim (Claude Code / PM sessiyasi), kommit hash'lari.
   - Nima qilindi — qisqa, fayl nomlari bilan.
   - **Nima tekshirildi va qanday** — "tsc toza", "haqiqiy HTTP so'rov bilan 200 olindi".
   - **Nima tekshirilmadi** — buni yashirmang.
   - Spetsifikatsiyada yo'q, lekin yo'l-yo'lakay topilgan narsalar.
   - Qabul qilingan qarorlar va **sababi** (masalan: "bcryptjs emas, PBKDF2 — Workers'da sekin").
3. O'zingizni **"KIM NIMA USTIDA ISHLAYAPTI"** jadvalidan o'chiring.

### 9.3 Jurnal qoidalari

- **"HOZIRGI HOLAT" doim joriy bo'lsin** — u tarix emas, snapshot. Eskirgan ma'lumot
  jurnalni foydasiz qiladi.
- **Yozuvlar qisqa bo'lsin.** Har biri 20–30 qatordan oshmasin. Kod nusxasini yozmang —
  fayl nomi va kommit hash'i yetarli.
- **Yozuvlar hech qachon tahrirlanmaydi va o'chirilmaydi** — faqat yangisi qo'shiladi.
  Xato qilgan bo'lsangiz, keyingi yozuvda tuzating.
- Jurnal 400 qatordan oshsa, eng eski yozuvlarni `docs/journal-archive/YYYY-MM.md` ga
  ko'chiring va jurnalda faqat havola qoldiring.
- **Tekshirilmagan narsani "tayyor" deb yozmang.** Bu 7-bo'lim qoidasining davomi.
- Jurnal kommitga kirsin — alohida `docs:` kommit qilmang, ishning o'zi bilan birga ketsin.

### 9.4 Bir vaqtda bir nechta sessiya ishlaganda

- Bitta faylni ikki sessiya bir vaqtda tahrirlamasin — jadval shuning uchun.
- Boshqa sessiya kommit qilgan bo'lsa, ishni davom ettirishdan oldin `git log` ni qayta o'qing.
- Konflikt chiqsa — o'zingiz hal qilmang, foydalanuvchidan so'rang.
