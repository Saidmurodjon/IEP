# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-09-23

**🆕 16 — webname.uz hostingiga ko'chish.** Sayt **sinov domenida to'liq ishlaydi (HTTPS)**:
https://iep-95-46-96-12.sslip.io (API: `api.iep-95-46-96-12.sslip.io`; sslip.io IP'ni nomdan
oladi, domen sotib olinmagan). Node ilova URL'i va `FRONTEND_URL` HOZIR shu sinov domeniga
qaragan. SSH: `iepuz@web2.webspace.uz`, kalit `~/.ssh/iep_webname`.
**`iep.uz` bloklangan:** whois `Status: AUCTION`, NS `ns1.redemption.uz` — egalik cctld.uz da
tekshirilishi kerak; keyin NS → `dns1–4.webspace.uz`, zonaga `www`, SSL, ilova URL'i +
`FRONTEND_URL` ni `iep.uz` ga qaytarish, `apps/web/dist-webname` (api.iep.uz bilan) yuklash.
Reja: `docs/tasks/16-webname-hosting.md`. **Push qilinmagan.**

**Branch:** `master` · **Push qilinganmi:** ✅ ha — hammasi `origin/master` ga yuborilgan
(`e177810..3a013da`), shu jumladan 13-navbar Bosqich C/D, test-rejim banneri va qidiruv/
maxsus imkoniyatlar ikonka tuzatishlari (batafsil pastdagi 13-yozuv va undan keyingi
yozuvlar).

**⚠️ `apps/api/.dev.vars` foydalanuvchi tasdig'i bilan production Neon bazasiga qaraydi**
(2026-08-31) — lokal `wrangler dev` va testlar endi HAQIQIY production ma'lumotiga
o'qiydi/yozadi. Migratsiya/seed ehtiyotkorlik bilan bajarilsin.

**⏸️ PRODUCTION MIGRATSIYASI TO'XTATILGAN (yarim yo'lda, foydalanuvchi so'rovi bilan).**
Production Neon sxemasi faqat `0_init` darajasida ekani aniqlandi (`_prisma_migrations`da
bitta yozuv, boshqa nom bilan: `20260423052242_init`). Bajarildi: `prisma migrate resolve
--applied 0_init` — bazaviy nuqta to'g'ri belgilandi (SQL qayta ishga tushirilmadi, faqat
`_prisma_migrations`ga yozuv qo'shildi — bu XAVFSIZ va allaqachon production'da amalga
oshgan). **BAJARILMAGAN:** `prisma migrate deploy` (1–7 migratsiyalarni qo'llash) — Claude
Code'ning auto-mode klassifikatori production DB ustidagi sxema o'zgarishini bloklaydi,
buni faqat foydalanuvchi o'zi (`!` prefiksi bilan) yoki Bash ruxsat qoidasi qo'shilgandan
keyin bajarish mumkin. Barcha 7 migratsiya xavfsizlik uchun oldindan tekshirilgan (faqat
`ADD COLUMN`/`CREATE TABLE`, 6-migratsiya `read` ustunini backfill'dan keyin o'chiradi —
ma'lumot yo'qolmaydi). Buyruq va Neon URL foydalanuvchiga alohida xabarda berilgan.
**14-topshiriq (test ma'lumotlari, LOKAL bazada) endi BAJARILDI** — batafsil pastdagi
14-yozuvda. Shu ish uchun `apps/api/.dev.vars` vaqtincha LOKAL bazaga qaytarilgan edi
(yuqoridagi production-ogohlantirish shu sababli hozircha amal qilmaydi — foydalanuvchi
production'ga qaytishni xohlasa, qayta almashtirish kerak).

### Nima ishlaydi
- **09, 10A va 10B PM tomonidan QABUL QILINDI.**
- **10C — xavfsizlik sarlavhalari tayyor.** Frontend: `apps/web/public/_headers`
  (Cloudflare Pages) — HSTS (1 yil), `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (kamera/mikrofon/joylashuv o'chirilgan). API:
  `apps/api/src/index.ts` ga xuddi shu uchtasini qo'shadigan oraliq qatlam —
  `finally` bilan, xatoli javobda ham ishlaydi.
- **CSP — FAQAT `Content-Security-Policy-Report-Only`.** `script-src`/`style-src` da
  `unsafe-inline`/`unsafe-eval` yo'q (build inline skript yozmaydi — tekshirildi).
  `connect-src` ga production API manzili qo'shildi, `style-src`/`font-src` ga
  Google Fonts, `img-src` ga `self`+`data:`. Haqiqiy rejimga **hali o'tkazilmagan** —
  bir necha kun konsolda kuzatilishi kerak.
- **`FRONTEND_URL` bo'sh bo'lsa API fail closed** (`lib/env.ts`, `getFrontendUrl()`).
  CORS endi shu qiymatdan olinadi, `localhost:5173` ga jimgina tushib qolish yo'q.
- **404 sahifasidagi qidiruv maydoni endi ishlaydi** — `/search?q=` ga yo'naltiradi
  (avvalgi `disabled` holat olib tashlandi, `search_soon` kaliti o'chirildi).
- **Admin panelga ham `main#main-content` va skip-link qo'shildi** (`AdminLayout`).
- **Header'dagi fokus xatosi tuzatildi:** `AccessibilityPanel`ga uzatilgan `onClose`
  endi `useCallback` bilan barqaror — sozlama panelda o'zgartirilganda fokus endi
  bosilgan tugmada qoladi, panelning boshiga sakramaydi.
- **Fayl havolalari to'g'irlandi** (`fix(files)`) — `fileUrl()`/`isOwnFileUrl()`
  (`lib/api.ts`), Documents/Publications endi to'liq manzil bilan ishlaydi.
- **Ikki darajali mega-menyu (desktop)** — batafsil pastdagi 13-yozuvda.
- **Aloqa ma'lumotlari (manzil/telefon/pochta/ish vaqti) endi STATIK**
  (`apps/web/src/config/contact.ts`) — bazadan olinmaydi. Sabab: bu ma'lumot
  amalda o'zgarmaydi, har sahifada `/api/settings` so'rovi keraksiz edi.
  `AdminSettingsPage`dan o'lik maydonlar (manzil, telefon, ish vaqti) olib
  tashlandi. `email` sozlamasi DB da QOLDI — u endi ko'rsatiladigan aloqa
  emaili emas, murojaat bildirishnomalari uchun zaxira manzil
  (`appeals_email` bo'sh bo'lsa ishlatiladi); qiymati `energy@academy.uz`
  ga moslashtirildi (statik konfiguratsiya bilan bir xil bo'lishi uchun,
  production Neon'da ham yangilandi).

### Nima hali ishlamaydi / bajarilmagan
- **13-navbar TO'LIQ BAJARILDI va PUSH QILINDI** (Bosqich A/B/C/D + qidiruv/maxsus imkoniyatlar
  ikonka tuzatishlari — batafsil pastdagi yozuvlar). PM tekshiruvini kutmoqda.
- **CSP hali Report-Only** — production'da bir necha kun kuzatilib, keyin haqiqiy
  rejimga (`Content-Security-Policy`) o'tkazilishi kerak.
- **Admin panelda YANGI axe-core topilmalari bor** (10C tekshiruvida aniqlandi,
  TUZATILMAGAN — jurnalga yozildi, 10-topshiriq doirasidan tashqarida):
  `/admin/news` — 6 ta ikonka tugmada nom yo'q (`button-name`) + sana ustunida
  kontrast; `/admin/employees` — bo'sh holat matni kontrasti; `/admin/messages` va
  `/admin/logs` — filtr `<select>` larida nom yo'q (`select-name`), sana maydonida
  `label` yo'q; dashboard'da sana kontrasti. Bular 373-son qaror doirasiga
  kirmaydi (admin — ichki xodim vositasi), lekin qulaylik uchun alohida
  topshiriq sifatida qilinishi tavsiya etiladi.
- **Hostda `node`/`npm` PATH da yo'q.** Butun tekshiruv Docker orqali: `postgres:16`
  (5433), `node:20`, `local-neon-http-proxy`, `puppeteer` + `axe-core`,
  `wrangler pages dev` (CSP/sarlavha tekshiruvi uchun).
- `apps/web` da birlik sinovlari yo'q (vitest faqat `apps/api` da).
- **`RESEND_API_KEY` va `MAIL_FROM` o'rnatilmagan**, **R2 bucket production'da yo'q**,
  **migratsiyalar 2–7 production'ga qo'llanmagan.**
- Murojaatlarni saqlash muddati yuriskonsultdan kutilmoqda. Cron sozlanmagan.
- Throttle va rate limitlar izolyat xotirasida (KV/Durable Object kerak).
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda.

### Keyingi qadam
1. **14-topshiriq TAYYOR (lokal baza, TO'LIQ hajm)** — batafsil yuqoridagi 14-yozuvda.
   Foydalanuvchi o'z `npm run dev`ida `npm run db:test` ishga tushirsin (lokal baza
   hozir bo'sh — sabab yuqoridagi yozuvda).
2. Production migratsiyasini yakunlash (`prisma migrate deploy`, 1–7) — foydalanuvchi
   ruxsati bilan to'xtatilgan, yuqoriga qarang.
3. 10C va 13-navbar'ni PM tekshirsin.
4. Yangi topshiriq takliflari (14-yozuvda aniqlangan): (a) `apps/api/src/lib/*.ts`da
   Prisma `updateMany`/`upsert` ishlatilgan joylar `PrismaNeonHTTP` bilan mos
   kelishini tekshirish (HTTP rejimida ikkalasi ham "Transactions are not supported"
   bilan yiqiladi); (b) `AdminNewsPage`da `imageUrl` uchun `fileUrl()` o'ramini
   qo'shish (`AdminPublicationsPage`dagi kabi) — `.url()` validatsiyasi nisbiy
   manzilni rad etadi; (c) admin panel accessibility (yuqoridagi axe topilmalari).
5. Production'ga chiqishdan oldin: CSP'ni bir necha kun Report-Only rejimida
   kuzatish, keyin haqiqiy rejimga o'tkazish; R2 bucket; Resend secret'lari;
   `wrangler deploy` va Cloudflare Pages qayta deploy (hozirgi live sayt ESKI
   kodni ishlatadi — `/api/employees` 404 qaytaradi).

### Ochiq savollar
- Yopilgan murojaatlarni qancha muddat saqlash kerak? **Yuriskonsult javobi kutilmoqda.**
- Murojaat bildirishnomalari uchun alohida pochta manzili bormi (`appeals_email`)?
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?
- `apps/web` uchun vitest qo'shilsinmi (a11y va sanitizatsiya funksiyalari uchun)?
- Admin panel accessibility alohida topshiriq sifatida navbatga qo'shilsinmi?

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 11 | Logotip, 404, huquqiy bandlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 06 | Xodimlar, laboratoriyalar, hamkorlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 07 | Fayl yuklash va tahrirlagich | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 08 | Xatoliklar jurnali | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 09 | Murojaatlar va Resend | ✅ **Qabul qilindi** |
| 10A | Sayt bo'ylab qidiruv | ✅ **Qabul qilindi** |
| 10B | Imkoniyati cheklanganlar uchun qulayliklar | ✅ **Qabul qilindi** |
| 10C | Xavfsizlik sarlavhalari va CSP | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 13 | Ikki darajali mega-menyu | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 14 | Test ma'lumotlari (lokal baza) | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 15 | Xodim rasmi 3x4, admin ommaviy amal, modal fokus xatosi | 🟠 Bajarildi, brauzerda tekshirilmadi (PM tekshiruvi kutilmoqda) |

03-production alohida turadi va `wrangler login` dan keyin bajariladi.

**Foydalanuvchi zimmasidagi ochiq masalalar** (batafsil: `docs/kerakli-malumotlar.md`). 373-son qaror bo'yicha
yuriskonsult javobi. **Logotipning vektor fayli (SVG/AI/EPS) yoki 1000px shaffof PNG** va brend qo'llanmasi. Xodimlar ma'lumoti va rasmlari. Hamkorlar ro'yxati. Institut telefon raqami.

---

## HOZIRDA KIM NIMA USTIDA ISHLAYAPTI

> Bir vaqtda bir nechta sessiya ishlaganda to'qnashuvni oldini olish uchun.
> Ish boshlashda o'zingizni qo'shing, tugaganda o'chiring.

| Sessiya | Topshiriq | Tegilayotgan fayllar | Boshlangan |
|---|---|---|---|
| — | — | — | — |

---

## YOZUVLAR

> Eng yangisi tepada. Har bir yozuv qisqa bo'lsin — nima qilindi, nima tekshirildi, nima qolib ketdi.

### 2026-09-23 · 16 — sslip.io sinov domeni; rasmlar va 500 tuzatildi

**Kim:** Claude Code (Opus 5.5). Domen/SSL/ilova sozlamasi — foydalanuvchi (panel).
**Rasmlar** (`7876021`): `<img>` nisbiy `/api/files/...` bilan frontend domeniga ketardi, bazada
`http://localhost:3000/...` ham bor. `fileUrl()` endi har qanday `/api/files/` manzilini
`VITE_API_URL` ga o'giradi; `A11yImage`, yangilik HTML, admin logo/preview shundan o'tadi.
**500** (`7876021`, `1994e94`): CloudLinux LVE oqimlarni ham sanaydi; Prisma tokio yadro
soniga qarab ~52 oqim/jarayon ochardi → Passenger jarayonlari 4–12 s da o'ldirilardi, DB
ulanishi 5 s timeout, SSH ham uzilardi. `node.ts`: `TOKIO_WORKER_THREADS=2`,
`connection_limit=2`, `pool_timeout=20`. Lokal: CONNECTION LIMIT 3 rol bilan eski kod 11/12
500, yangi 12/12 200; oqimlar 21→11.
**Tekshirildi (serverda):** 12 parallel `/api/settings` 200; NodeApp 13–15 oqim, >1 daqiqa
yashaydi; SSH barqaror. Headless Chrome (CDP): 7 sahifa, 0 buzilgan rasm, 0 ta 4xx/5xx.
**Tekshirilmadi:** admin login (parol yo'q), fayl yuklash va kontakt formasi (production DB'ga
yozadi — foydalanuvchi bilan), email. Yuklash panel Fayl menejeri orqali bo'ldi (SSH o'shanda
ishlamasdi; auto-mode production'ga yozishni ham bloklaydi).

### 2026-09-23 · 16 — C: frontend serverda, CORS tuzatildi

**Qilindi (foydalanuvchi):** `dist-webname` `public_html` ga yuklandi (tar | ssh), panel
namunasi `~/tmp/da-placeholder-index.html`; panelda `FRONTEND_URL` dagi bo'sh joy olib tashlandi.
**Tekshirildi (`--resolve iep.uz:80:95.46.96.12`):** `/`, `/uz/news`, `/en/about` 200 (SPA
fallback), `/_headers` 403, `robots.txt` 200; bizning sarlavhalar va CSP Report-Only bor;
`/assets/*.js` `immutable`, `index.html` `no-cache`; API `Access-Control-Allow-Origin: https://iep.uz`.
**Tekshirilmadi:** brauzerda render (API `https://api.iep.uz` DNS/SSL'siz ochilmaydi), HTTPS.
**Topildi:** hosting o'z sarlavhalarini qo'shadi — `X-Frame-Options` ikki xil qiymat bilan keladi.

### 2026-09-23 · 16 — B + C (qisman): server'da API, media, frontend paketi

**Kim:** Claude Code (Opus 5.5). SSH ochildi (DirectAdmin → SSH kalitlari, ed25519).
**Qilindi:** `scripts/export-media.mjs` (`npm run export:media`) — miniflare R2 sqlite'dan
`<key>` + `<key>.meta.json`, kalit `isValidKey` regex'i, hajm tekshiruvi, `COPYFILE_DISABLE`
(macOS `._*` fayllari tushmasin — birinchi yuklashda tushgan, serverda o'chirildi).
`apps/web/public/.htaccess` — SPA fallback, `_headers` dagi sarlavhalar (HSTS faqat HTTPS'da,
CSP Report-Only `api.iep.uz` bilan), kesh; HTTPS redirect yo'q (sertifikat hali yo'q).
**Serverda topildi:** `DATABASE_URL` `postgresql:/` (bitta slash) → 500; foydalanuvchi panelda
tuzatdi. `FRONTEND_URL` boshida bo'sh joy → `Access-Control-Allow-Origin` chiqmaydi (tuzatilmagan).
**Tekshirildi (HTTP, `--resolve api.iep.uz:80:95.46.96.12`):** news/structure/search 200,
29 xodim; noto'g'ri login 401; auth'siz upload 401; `/api/files/...png` 200, `image/png`,
bayt lokal fayl bilan bir xil. api `tsc`, vitest 50/50, `wrangler --dry-run`, web `tsc`, build.
**Tekshirilmadi:** frontend serverda (yuklanmagan), `.htaccess` Apache'da, HTTPS, haqiqiy
admin login (parol yo'q), CORS (FRONTEND_URL tuzatilmaguncha).

### 2026-09-23 · 16 — A bosqichi: API Node.js'da (webname cPanel) ishlaydi

**Kim:** Claude Code (Opus 5.5) · Foydalanuvchi webname.uz 10G hosting oldi; qaror: API,
frontend va baza (PostgreSQL) shu yerga. Ma'lumot manbasi — docker `energetika_mig`.
**Qilindi:** `lib/storage.ts` — `R2Bucket` o'rniga minimal `MediaBucket` interfeysi (R2 uni
tuzilma bo'yicha bajaradi). `lib/fs-storage.ts` — diskdagi ombor, kalit `isValidKey` +
`root` ichidaligi tekshiriladi. `lib/db.ts` — `setDb()`. `src/node.ts` — `@hono/node-server`,
`process.env` → `Env`, secret yo'q/qisqa bo'lsa ishga tushmaydi, `waitUntil` o'rnini bosuvchi
`executionCtx`. `scripts/build-node.mjs` — esbuild → `deploy/iep-api/server.cjs` + package.json
+ prisma schema/migrations + zip. `apps/api/deploy/` `.gitignore` da.
**Tekshirildi:** `tsc` (api) toza; vitest 50/50 (yangi `fs-storage.test.ts` — traversal
sinovlari bilan); `wrangler deploy --dry-run` o'tdi. Paket alohida papkada `npm install`
(prisma generate ishladi) → bo'sh bazaga `migrate deploy` 0–7 o'tdi. To'liq dumpni
superuser BO'LMAGAN rol bilan tiklash o'tdi (15 news, 29 employees, 45 media). `server.cjs`
shu bazaga: `/`, news, search, structure 200; CORS + xavfsizlik sarlavhalari bor; login
(to'g'ri 200 / noto'g'ri 401); PNG yuklash 201 → `/api/files` 200, baytlar bir xil, ETag
va Content-Type to'g'ri; auth'siz yuklash 401; `../` 404; kontakt 201 (waitUntil yiqilmadi);
JWT_SECRET yo'q/qisqa → jarayon to'xtaydi.
**Tekshirilmadi:** haqiqiy webname serverida (Passenger, CloudLinux, Prisma engine);
media baytlarini eksport qilish; frontend. Lokal docker'da `iep_node_test` baza va
`iep_hosting_like` rol sinov uchun qoldi (o'chirish mumkin).
**Qaror:** `--data-only` o'rniga to'liq dump — superuser talab qilmaydi (sabab tasks/16 da).

> Eski yozuvlar: `docs/journal-archive/` (2026-08.md, 2026-09.md).
