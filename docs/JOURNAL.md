# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-10-27

**🆕 18-A + 18-B — admin rollari va dashboard grafiklari LOKALDA tayyor, production'ga CHIQARILMAGAN.**
18-B: `GET /api/stats` + dashboard'da KPI kartochkalar va 5 ta grafik (recharts 2.15.4).
⚠️ Lokal bazada 15 ta nashr 18-B davomida noma'lum sabab bilan o'chib ketdi — foydalanuvchidan so'raldi.
Migratsiya `8_admin_roles` faqat lokal bazaga (5433) qo'llangan. iep.uz ga chiqarish: migratsiya +
API + web, foydalanuvchi tasdig'i bilan.

**🆕 19-C — admin panel: yuqori navbar, til (uz/en/ru), qorong'i mavzu, profil sahifasi LOKALDA tayyor,
production'ga CHIQARILMAGAN.** Admin matnlari to'liq i18n'da. Keyingi: D (kiritish qulayligi).

**🆕 17 — tasdiqlangan tuzilma sxemasi (rasm) LOKALDA tayyor, production'ga CHIQARILMAGAN.**
`/structure` da FAQAT rasm (bo'linmalar daraxti olib tashlandi). Admin: «Tuzilma» — rasm,
yangi «Bo'linmalar» (`/admin/units`) — bo'linma/laboratoriya tahriri (laboratoriyalar,
«Institut haqida», xodimlar shunga bog'liq). Production
deploy foydalanuvchi tasdig'ini kutmoqda.

**🧹 Production'dagi test ma'lumotlari o'chirildi (2026-10-27)** — yozuvlar va 45 ta fayl
(fayllar `cleanup` ni foydalanuvchi ishga tushirdi). Admin parolini almashtirish tavsiya etilgan.

**✅ 16 — `https://iep.uz` PRODUCTION'da ishlaydi (2026-10-27).**
Hosting: webname, hisob `iepuz@web2.webspace.uz` (IP 95.46.96.12), SSH kaliti
`~/.ssh/iep_prod`. Domen Arsenal-D'da, NS `dns1–4.webspace.uz` (tarqaldi). SSL: Let's Encrypt
`*.iep.uz` + `iep.uz` (panel avtomatik, 25.01.2027 gacha, avto-yangilanadi). Baza
`iepuz_mainv1` — NOLDAN: 7 migratsiya + seed; eski ma'lumot ko'chirilMADI (foydalanuvchi qarori).
**Qolgan:** Force SSL (http hali 200, redirect yo'q); admin login'ni foydalanuvchi tekshirsin;
`RESEND_API_KEY`/`MAIL_FROM`; baza zaxirasi (cron). Qo'llanma: `docs/deploy-hosting.md`.

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

**Ish tartibi (2026-10-27 dan, foydalanuvchi qarori):**
- **Nazoratchi — Opus.** Topshiriqni bo'ladi, fayllarni sessiyalarga taqsimlaydi, natijani
  tekshiradi (`tsc`, test, build, brauzer), kommit va push qiladi, jurnalni yuritadi.
- **Koder — Sonnet subagentlar.** Har biriga aniq fayllar ro'yxati beriladi; ikki koder bitta
  faylga tegmaydi. Koder kommit/push/deploy QILMAYDI, faqat o'zgartiradi va hisobot beradi.
- **Token tejash:** koderga butun kontekst emas, faqat kerakli fayllar va qabul mezoni beriladi;
  hisobot 5–10 qator.
- **Lokal muhit doim ishlab turadi:** API `wrangler dev --port 8787` (3000 ni open-webui
  egallagan), web `VITE_API_URL=http://localhost:8787 vite` → http://localhost:5173.
  Baza — lokal (`localhost:4444` neon-proxy → `iep-pg`).
- **GitHub:** har bir tekshirilgan o'zgarish kommit qilinib `origin/master` ga push qilinadi
  (foydalanuvchi ruxsat berdi).
- **Production (iep.uz):** FAQAT foydalanuvchi aniq tasdiqlagandan keyin.

---

## YOZUVLAR

> Eng yangisi tepada. Har bir yozuv qisqa bo'lsin — nima qilindi, nima tekshirildi, nima qolib ketdi.

### 2026-10-27 · 19-C — admin navbar, til, qorong'i mavzu, profil
**Kommit:** `feat(admin): topbar with language, dark theme and profile page`
**Qilindi:** Tailwind `darkMode: 'class'`; `store/adminPrefs.ts` (`admin_theme` light/dark/system,
`admin_lang`) — `dark` klassi va `html lang` faqat admin ochiqligida, chiqishda olib tashlanadi.
`AdminTopbar`: UZ/EN/RU, mavzu, profil menyusi (Escape, fokus qaytishi). `/admin/profile`: ism tahriri,
parol almashtirish. API: `PATCH /api/auth/me` (faqat `name`), `/me` da `lastLoginAt`; change-password
endi `WRONG_PASSWORD`/`SAME_PASSWORD` (400) — avval 401 qaytib, interceptor foydalanuvchini chiqarib
yuborardi. Barcha admin sahifalaridagi hard-code matnlar `adminC/D/E`, `adminShell`, `profile` ga.
Web `ERROR_CODES` ga 18-A dan qolib ketgan FORBIDDEN/CONFLICT/LAST_SUPER_ADMIN/SELF_ACTION ham qo'shildi.
Login'ga `label htmlFor` + `FieldError`.
**Tekshirildi:** tsc api+web, vitest 66/66, wrangler dry-run, vite build (CSS'da `.dark` 66, media 0).
HTTP (vaqtinchalik test admin, keyin o'chirildi): PATCH /me 400/200, rol/email e'tiborsiz; noto'g'ri,
bir xil, to'g'ri parol 400/400/200, yangi parol bilan login 200. Barcha `t()` kalitlari 3 tilda bor
(skript). Brauzer: dashboard qorong'i+EN, profil RU, menyu Escape, WRONG_PASSWORD toast (chiqarmadi),
xodim modali qorong'ida, yorug' mavzu; OS qorong'i bo'lsa ham ochiq sayt yorug' qoladi.
**Muhim:** `tailwind.config` o'zgarganda vite dev QAYTA ISHGA TUSHIRILSIN — eski jarayon `media`
rejimida qoldi va ochiq saytni ham qorong'i qilardi (build'da muammo yo'q).
**Tekshirilmadi:** mobil kenglikda topbar; har bir sahifa qorong'ida ko'z bilan (faqat dashboard,
profil, xodimlar); Tiptap qorong'ida; change-password'ga alohida rate limit yo'q (token talab qilinadi).
**Qoldi:** `AdminUnitsPage` tur ro'yxati xom qiymat; profil `<title>` da «| Admin» yo'q.

### 2026-10-27 · 18-B — dashboard statistikasi va grafiklar
**Kommit:** `feat(admin): dashboard statistics with charts`
**Qilindi:** `GET /api/stats` (requireAuth, ikkala rol): jami ko'rsatkichlar, 12 oylik yangilik va
murojaatlar (`date_trunc` Asia/Tashkent, `$queryRaw` tagged), murojaat holatlari, 8 yillik nashrlar,
top-8 bo'linma + «Boshqa». Sof yordamchilar `lib/stats.ts` + 9 ta test. Web: 6 ta KPI kartochka,
5 ta grafik — yagona `BarCard` (vertikal/gorizontal), bitta rang `#2f6db0` (validator o'tdi;
brand `#43719c` xroma bo'yicha o'tmadi), `role="img"` + sr-only jadval, bo'sh/yuklanish/xato holati.
Oy nomlari locales'dan (`monthsShort`) — Chrome'da `Intl` uz uchun «M11» chiqarar edi.
Xotira kartochkasi havolasiz (sozlamalar faqat super admin uchun).
**Tekshirildi:** tsc api+web, vitest 66/66, wrangler dry-run, vite build (Dashboard chunk 384 kB /
106 kB gzip, lazy). HTTP: token yo'q → 401, token bilan 200 (0,34 s); totals to'g'ridan-to'g'ri SQL
bilan solishtirildi — mos. Brauzer: grafiklar, oy nomlari, bo'sh holat, hover tooltip, 1 ta h1.
**Tekshirilmadi:** xodimlar grafigi haqiqiy ma'lumot bilan (lokal bazada xodim 0); ADMIN roli
bilan dashboard (18-A da tekshirilgan qism o'zgarmagan); mobil kenglik.
**Muammo:** lokal bazada `publications` 15 → 0 (18-B davomida). Koderlar nashrlarga tegmagan,
boshqa sessiya yo'q, install-hook yo'q. Sabab noma'lum; `db:test` ildiz `.env` orqali Neon'ga
yozgani uchun tiklash qilinmadi — foydalanuvchiga savol berildi.
