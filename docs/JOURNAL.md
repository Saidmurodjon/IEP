# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-10-27

**🆕 Asosiy bo'limlar + xodimning laboratoriyasi — LOKALDA tayyor, production'ga CHIQARILMAGAN.**
Bo'linma turi `section` (asosiy bo'lim) va `laboratory` — ikkalasi ham yuqori darajada, lab bo'lim
ichida emas. Xodim: `unitId` = bo'lim, yangi `labId` = laboratoriya (migratsiya `9_employee_lab`).
Admin «Bo'linmalar»: «Tur» maydoni yo'q — «Bo'limlar» va «Laboratoriyalar» ikki alohida qism, har birining
o'z «Qo'shish» tugmasi; lab qatorida xodimlar paneli (biriktirish/chiqarish, «Yangi xodim» → lab tanlangan forma).
Lokal bazada eski bo'linmalar o'chirildi, 6 lab saqlandi, 2 bo'lim yaratildi (Ma'muriy boshqaruv,
Ilmiy xodimlar). iep.uz uchun: migratsiya 9 + bo'linmalarni qayta tuzish SQL (yozuvdagi) + deploy,
foydalanuvchi tasdig'i bilan.

**🆕 18-A + 18-B — admin rollari va dashboard grafiklari LOKALDA tayyor, production'ga CHIQARILMAGAN.**
18-B: `GET /api/stats` + dashboard'da KPI kartochkalar va 5 ta grafik (recharts 2.15.4).
⚠️ Lokal bazada 15 ta nashr 18-B davomida noma'lum sabab bilan o'chib ketdi — foydalanuvchidan so'raldi.
Migratsiya `8_admin_roles` faqat lokal bazaga (5433) qo'llangan. iep.uz ga chiqarish: migratsiya +
API + web, foydalanuvchi tasdig'i bilan.

**🆕 19-C — admin panel: yuqori navbar, til (uz/en/ru), qorong'i mavzu, profil sahifasi LOKALDA tayyor,
production'ga CHIQARILMAGAN.** Admin matnlari to'liq i18n'da. Login sahifasi ham yangilandi (navbar, til/mavzu menyusi, parolni ko'rsatish). Admin qo'shish/tahrirlash
shakllari oyna emas, ro'yxat o'rnida to'liq sahifa (`AdminFormPage`, sticky «Saqlash» paneli); yangilik slug'i faqat
sarlavhadan avtomatik. Keyingi: D (kiritish qulayligi).

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

### 2026-10-27 · Bo'linmalar sahifasi: bo'lim va laboratoriya alohida, lab xodimlari paneli

**Nima qilindi:** foydalanuvchi: «tur nima keragi bor», «lab bo'lim emas, alohida qism», lab xodimlari
yangi xodim qo'shib yoki mavjudini biriktirib shakllansin.
- `AdminUnitsPage`: «Tur» select olib tashlandi; ikki qism («Bo'limlar», «Laboratoriyalar»), tur qaysi
  tugmadan ochilganiga qarab yuboriladi, tahrirda tur yuborilmaydi. Lab `parentId=null` (avvalgi qaror saqlandi).
- `LabStaffPanel`: lab xodimlari ro'yxati, «Laboratoriyadan chiqarish» (`labId: ''` → null), mavjud
  xodimni biriktirish, «Yangi xodim» → `/admin/employees?labId=…`.
- `AdminEmployeesPage`: `?labId=` bilan yangi xodim formasi ochiladi; lab qiymati variantlar yuklangandan
  keyin o'rnatiladi (avval reset qilinsa select bo'sh qolardi — brauzerda topildi).
- i18n `adminD.units` uchala tilda yangilandi (type/parent/th_* kalitlari olib tashlandi, ru ko'plik shakllari).
API o'zgarmadi.
**Tekshirildi:** `tsc` web toza. Brauzer (lokal, DOM orqali): ikki qism ko'rinadi, «Yangi laboratoriya»
formasida tur select yo'q; lab → «Yangi xodim» → forma lab tanlangan holda, saqlandi, panelda «1 xodim»;
chiqarish → bo'sh; qayta biriktirish → qaytdi. Sinov xodimi keyin API orqali o'chirildi.
**Tekshirilmadi:** yangi lab/bo'limni shakl orqali saqlash (API yo'li o'zgarmagan); production.

### 2026-10-27 · Asosiy bo'limlar va xodimning laboratoriyasi

**Nima qilindi:** foydalanuvchi so'rovi — eski bo'linmalar o'rniga asosiy bo'limlar (hozircha 2 ta),
xodim qo'shganda bo'lim VA laboratoriya alohida tanlanadi; lab bo'lim ichida yotmaydi.
- `Employee.labId` + `9_employee_lab` (FK SET NULL, indeks; lab'ga biriktirilganlar labId ga ko'chadi).
- API: `structure` turiga `section`; `employees` `labId` qabul qiladi va `?labId=` filtri.
- Admin «Bo'linmalar»: faqat Bo'lim/Laboratoriya turi, «yuqori bo'linma» tanlovi olib tashlandi.
  Admin «Xodimlar»: «Bo'lim» + «Laboratoriya» selectlari. `LabDetailPage` labId bo'yicha,
  `EmployeesPage` faqat bo'limlar bo'yicha guruhlaydi. Seed/test-content yangi tuzilmaga.
- **Topilgan va tuzatilgan xato:** bo'linmani o'chirish 500 qaytarardi (Prisma `updateMany`
  parentId bo'yicha tranzaksiya ochadi, Neon HTTP'da yo'q) → `structure.ts` DELETE xom SQL.
- Lokal baza (5433): 11 bo'linma o'chirildi, 6 lab parentId=NULL, `section-management` va
  `section-scientific` qo'shildi, `searchVector` qayta hisoblandi.
**Tekshirildi:** `migrate deploy` + `migrate diff` (farq yo'q); tsc api/web/db toza; vitest 66/66;
`wrangler deploy --dry-run` OK. Haqiqiy HTTP (JWT bilan): bo'lim yaratish 201, xodim unitId+labId
bilan, `?labId=` 1 ta, labId tozalash → null, bo'limni o'chirish 200 va xodim qoladi (unitId null,
labId saqlanadi), auth'siz POST 401. Brauzer: admin bo'linmalar ro'yxati va xodim formasidagi
ikki select (DOM bilan).
**Tekshirilmadi:** ochiq `/employees` va lab sahifasi brauzerda ochilmadi; production.
**Production uchun SQL:** `UPDATE structure_units SET "parentId"=NULL WHERE type='laboratory';`
`DELETE FROM structure_units WHERE type<>'laboratory';` + 2 bo'lim INSERT + structure reindex.
`apps/api/deploy/iep-api/seed.cjs` eski id lar bilan — production seed'dan oldin qayta yig'ilsin.

### 2026-10-27 · Admin formalar — oyna o'rniga to'liq sahifa

- Foydalanuvchi: «modal nima keragi bor, dashboardda turibdiku». Yangi `components/admin/AdminFormPage.tsx`
  (+ `FormSection`): ro'yxat o'rnida ochiladi, «Orqaga» tugmasi, o'z `h1` sarlavhasi (ro'yxat sarlavhasi
  yashiriladi — sahifada bitta h1), `sticky bottom-4` tugmalar paneli, ochilganda main boshiga qaytadi.
- 6 sahifa: `{showForm ? <AdminFormPage/> : <>sarlavha + ro'yxat</>}`. Users: create/edit — sahifa,
  reset/delete — kichik oyna (`AdminFormModal` faqat sm/md dialog sifatida qoldi).
- i18n: `admin.back_to_list` (uz/en/ru).
- Tekshirildi: `tsc` toza, `vite build` o'tdi; brauzerda news (ikki ustun, slug jonli, «Orqaga» → ro'yxat)
  va users (create sahifa, jadval yashirin) ko'rildi.
- Tekshirilmadi: haqiqiy saqlash, qolgan 4 sahifa vizual, telefon kengligi.

