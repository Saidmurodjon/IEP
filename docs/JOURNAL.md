# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-31
**Branch:** `master` · **Push qilinganmi:** ✅ qisman — `09`..`13-navbar (qisman)`
`origin/master` ga yuborilgan (`878b06b..70f1e6e`). **Aloqa statik qilish va `dev` skripti
tuzatishi (pastga qarang) HALI PUSH QILINMAGAN.**

**⚠️ `apps/api/.dev.vars` foydalanuvchi tasdig'i bilan production Neon bazasiga qaraydi**
(2026-08-31) — lokal `wrangler dev` va testlar endi HAQIQIY production ma'lumotiga
o'qiydi/yozadi. Migratsiya/seed ehtiyotkorlik bilan bajarilsin.

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
- **13-navbar TUGALLANMAGAN, lekin commit qilingan** (foydalanuvchi so'rovi bilan — desktop qismi
  sinovdan o'tgan, xavfsiz to'xtash nuqtasi). Desktop mega-menyudagi flicker xatosi HAL QILINDI
  (batafsil: pastdagi 13-yozuv). Qolgan: mobil akkordeon menyu (Bosqich C, hali yozilmagan —
  vaqtincha tekis ro'yxat) va `routes.ts`ni `navigation.ts`dan generatsiya qilish (Bosqich D qoldig'i).
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
1. 10C ni PM tekshirsin — bu 10-topshiriqning oxirgi qismi.
2. Production'ga chiqishdan oldin: CSP'ni bir necha kun Report-Only rejimida
   kuzatish, keyin haqiqiy rejimga o'tkazish; R2 bucket; migratsiyalar 2–7;
   Resend secret'lari; `.env` (root) production Neon'ga qarayotgani hali
   tuzatilmagan (faqat `apps/api/.dev.vars` tuzatilgan edi — 10A yozuviga qarang).
3. Yangi topshiriq taklifi: admin panel accessibility (yuqoridagi axe topilmalari).

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
| 13 | Ikki darajali mega-menyu | 🟠 Qisman — desktop tayyor va sinovdan o'tgan, mobil akkordeon va routes.ts qoldi |

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

### 2026-08-31 · API `dev` skripti tuzatildi — lokal ishlashda ham Neon ishlatiladi

**Kim:** Claude Code (Sonnet 5) · **Kommit:** `fix(api): use wrangler dev for local API server, not bare bun`

**Topilgan xato.** `npm run dev`ning API qismi (`bun run --watch src/index.ts`) hech qachon
bazaga ulanmagan — sabab konfiguratsiya emas, **runtime**: Hono `c.env` orqali Workers
bog'lanishlarini o'qiydi, bare Bun esa `app.fetch()`ga o'zining `Server` obyektini uzatadi.
Bun konteynerida tasdiqlandi: `c.env` bo'sh, `process.env.DATABASE_URL` esa to'g'ri.
Ya'ni `.dev.vars`da qaysi DATABASE_URL turishidan qat'i nazar (lokal Postgres ham, Neon ham)
API hech qachon unga ulanmagan.

**Tuzatish.** `apps/api/package.json`: `dev` endi `dev:workers` bilan bir xil — `wrangler
dev --port 3000`. `wrangler dev` `.dev.vars`ni to'g'ri o'qiydi va `c.env`ni haqiqiy Workers
kabi to'ldiradi. Endi `.dev.vars`dagi Neon URL (foydalanuvchi tasdig'i bilan o'rnatilgan)
lokal ishlashda ham amalda ishlaydi.

**Tekshirildi:** `wrangler dev --port 3001` + `.dev.vars` (Neon) — `GET /api/settings` 200,
haqiqiy Neon ma'lumoti bilan.

**Yo'l-yo'lakay qayta tasdiqlangan (allaqachon ma'lum, 5-bo'lim — TUZATILMAGAN):**
production Neon sxemasi eskirgan. Haqiqiy Neon ustida `GET /api/news`, `/employees`,
`/structure`, `/documents`, `/partners` — barchasi 500 (`news.isPublished does not exist`,
`error_logs does not exist`). Migratsiyalar 2–7 hali production'ga qo'llanmagan — bu
yangi kashfiyot emas, lekin endi `wrangler dev` orqali haqiqiy production sxemasiga
tegib ko'rilgani uchun aniq tasdiqlandi. Production sxemasiga tegilmadi.

### 2026-08-31 · Aloqa ma'lumotlari statik qilindi

**Kim:** Claude Code (Sonnet 5) · **Kommit:** `refactor(contact): make site contact info static`

**Nima qilindi.** `apps/web/src/config/contact.ts` — manzil (uz/en/ru), telefon, pochta, ish
vaqti (uz/en/ru) endi kod ichida, `/api/settings`dan olinmaydi. `Header.tsx`, `Footer.tsx`,
`ContactPage.tsx` shu manbadan o'qiydi (`lastUpdatedAt` Footer'da hali sozlamalardan — 373-son
qaror, kontent sanasi, aloqaga aloqasi yo'q). `AdminSettingsPage.tsx`dan `address_uz/en/ru`,
`phone`, `working_hours` olib tashlandi — endi tahrirlansa ham saytga ta'sir qilmasdi.
`packages/db/src/seed.ts`dan ham shu qatorlar o'chirildi. `email` sozlamasi DB da QOLDI:
u ko'rsatiladigan aloqa emaili emas, murojaat bildirishnomalari uchun zaxira manzil
(`appeals_email` bo'sh bo'lganda, `apps/api/src/routes/contact.ts`) — bu ikkisi ENDI ALOHIDA
tushuncha, adashtirmaslik kerak.

**Qiymatlar.** Email `energy@academy.uz`, manzil "Mirzo Ulug'bek tumani, Do'rmon yo'li
ko'chasi, 40-uy" (uchala tilda) — foydalanuvchi tomonidan aniq berilgan. Bu qadam bilan
production Neon'dagi `email` sozlamasi ham xuddi shu qiymatga yangilandi (murojaat
bildirishnomalari zaxira manzili konfiguratsiya bilan mos bo'lishi uchun); `address_*`,
`phone`, `working_hours` qatorlari DB da qoldi, lekin endi hech kim o'qimaydi (zararsiz,
o'chirilmadi).

**Tekshirildi.** `tsc` (web, api, db) va `vite build` toza, vitest 43/43. Haqiqiy production
Neon bazasiga ulangan holda (`.dev.vars`) uchala tilda (`/uz/contact`, `/en/contact`,
`/ru/contact`) brauzerda tekshirildi: email, telefon, manzil va ish vaqti to'g'ri va
tarjima qilingan holda chiqdi (`Dushanba–Juma: 9:00–18:00` / `Monday–Friday: 9:00 AM–6:00 PM` /
`Понедельник–Пятница: 9:00–18:00`); Header'da ham email/telefon to'g'ri.

**TEKSHIRILMADI:** admin panelning `email` maydoni haqiqiy formada saqlab ko'rilmadi (faqat
DB orqali to'g'ridan-to'g'ri yangilandi).

### 2026-08-31 · 13 — Ikki darajali mega-menyu — TUGALLANMAGAN, foydalanuvchi so'rovi bilan to'xtatildi

**Kim:** Claude Code (Sonnet 5) · **Kommit:** `feat(nav): two-level mega menu (desktop, partial)`
— ish yozilgan sessiyada commit qilinmagan edi, keyingi sessiya (foydalanuvchi tasdig'i bilan)
commit va push qildi.

**Nima qilindi (Bosqich A va B, qisman C/D).** `apps/web/src/config/navigation.ts` — menyu daraxti
yagona manbada (`NAV_ITEMS`, `isNavGroup`, `flattenVisibleLinks`, `findNavLink`). `/partners` foydalanuvchi
tasdig'i bilan `hidden: true` qilib qo'yildi (ochiq sahifa hali yo'q — faqat admin CRUD va bosh sahifa
lentasi bor). Uchala i18n faylida `nav.*` ichki guruhlarga ko'chirildi (`nav.institute.label` /
`nav.institute.items.*` va hokazo), eski tekis kalitlar (`nav.about`, `nav.structure`, `nav.labs`,
`nav.management`, `nav.employees`, `nav.documents`, `nav.appeal_status`, `nav.publications`, `nav.news`,
`nav.search`) o'chirildi; `nav.home`/`nav.contact` guruhsiz yakka element sifatida saqlanib qoldi.
`EmployeesPage.tsx` va `NewsDetailPage.tsx` dagi eski kalit ishlatilishlari yangi joyga ko'chirildi.
Desktop mega-menyu: `components/nav/{navActive.ts, NavGroupButton.tsx, NavPanel.tsx, DesktopNav.tsx}` —
WAI-ARIA Disclosure naqshi, hover-intent (100ms ochish / 200ms yopish, guruhdan guruhga kechikishsiz),
klaviatura (`ArrowDown`/`ArrowUp`/`Escape`/`Tab`-chiqishda yopilish — `focusout` orqali), marshrut/scroll
o'zgarganda yopilish. `Header.tsx` ga ulandi, til dropdowni bilan o'zaro eksklyuziv. `Footer.tsx` va
`NotFoundPage.tsx` endi `navigation.ts` dan oziqlanadi (qo'lda yozilgan havola yo'q).

**Muhim qaror — gamburger chegarasi 1024px dan 1280px ga ko'tarildi.** 1024–1279px oraliqidagi
"kichraytirilgan" oraliq bosqich (14→10px padding, 15→14px shrift) amalda ruscha matnlar bilan
SIG'MAYDI — bu vazifa faylining o'zida oldindan ko'zda tutilgan zaxira yechim edi ("1024px da
sig'masa... gamburger chegarasini 1280px ga ko'tarish", 13-navbar.md 6-bo'lim). Shu bosqich butunlay
olib tashlandi: `xl:hidden`/`xl:flex` — mega-menyu FAQAT ≥1280px da, 1024–1279 oralig'ida ham gamburger
chiqadi. Ruscha "Ilmiy faoliyat" yorlig'i ham `Наука`ga qisqartirildi (avvalgi variant 1280px'da ham
sig'mas edi).

**✅ FLICKER XATOSI HAL QILINDI — sabab foydalanuvchi (PM) tomonidan aniqlandi, mendan emas.**
Mening birinchi gipotezam (panel transformidagi vaqtinchalik siljish) NOTO'G'RI edi va tuzatmadi.
**Haqiqiy sabab:** `Header.tsx` dagi tashqi bosishni ushlovchi to'liq ekranli overlay
(`{(langOpen || activeGroupId) && <div className="fixed inset-0 z-30" .../>}`) `<header>` ichida
edi. `<header>` `sticky` + `z-40` bo'lgani uchun O'Z STACKING CONTEXTINI yaratadi — shu context
ICHIDA `fixed z-30` overlay `NavGroupButton`ning `z-index: auto` qatlamidan BARIBIR yuqorida
chiziladi (aniq raqamli z-index context ichida avtomatikdan doim ustun, `position: fixed`
buni o'zgartirmaydi). Guruh ochilgach overlay xuddi shu tugmani bosib qolar, brauzer hit-test'ni
qayta hisoblab tugmada "mouseleave" deb topar → 200ms dan keyin yopilar → overlay yo'qolar →
kursor yana tugmada "mouseenter" deb topilar → qaytadan ochilar. Davri ~300ms, kursor umuman
qimirlamasa ham davom etardi. **Bu bilan bog'liq YANA IKKI ASORAT ham hal bo'ldi:** (a) avval
"guruhdan guruhga o'tish sekin (~300ms)" deb o'ylagan CDP-emulyatsiya sekinligiga yozgan
narsam aslida XUDDI SHU overlay xatosi edi — tuzatilgandan keyin o'tish 13ms da bo'ladi;
(b) panel ochiq turganda qidiruv, til, maxsus imkoniyatlar tugmalari overlay tomonidan bosilib
qolib ishlamas edi.

**Tuzatish.** `Header.tsx`: overlay endi FAQAT `langOpen` uchun (`activeGroupId` olib tashlandi).
`DesktopNav.tsx`: mega-menyuning tashqariga-bosish-bilan-yopilishi endi hujjat darajasidagi
`pointerdown` orqali (`buttonRefs`/`panelRefs` bilan solishtirilib, ichkarida bo'lmasa `closeNow()`),
overlaysiz.

**Tekshirildi (Docker: `node:20` — `tsc`/`build`; `ghcr.io/puppeteer/puppeteer:23.11.1`, amd64
emulyatsiyada arm64 Mac'da sekin ishlaydi).** `tsc --noEmit` va `vite build` toza. To'liq puppeteer
sinovi **40/40 o'tdi**: 1024/1280/1440px uz/ru/en joylashuv va gorizontal scroll yo'qligi,
topbar/gamburger to'g'ri almashishi, 375px topbar/logotip matni yashirinligi, hover-intent 100/200ms
kechikishlari, guruhdan guruhga kechikishsiz o'tish (13ms), guruh panelidan sichqoncha bilan
chiqib-kirish, `ArrowDown`/`ArrowUp`/`Escape` klaviatura navigatsiyasi va fokus qaytishi,
`/news/:slug`da ikkala daraja faolligi, `prefers-reduced-motion`, **statsionar hoverda 20/20 barqaror
(flicker yo'q)**, tashqariga bosilganda panel yopilishi, **panel ochiq turganda maxsus imkoniyatlar
tugmasi ishlashi** (overlay olib tashlangani tasdiqlandi). `/api/settings` backend yo'qligi uchun
`request interception` bilan soxtalashtirildi.

**Hali TUGALLANMAGAN (Bosqich C va D qoldi).**
1. **Bosqich C — mobil akkordeon menyu.** Hozir `Header.tsx` da `MOBILE_NAV_LINKS` bilan VAQTINCHA
   tekis ro'yxat turibdi (guruhlash, akkordeon, joriy guruhning ochiq holda kelishi — hali yo'q).
2. **Bosqich D qoldig'i.** `lib/routes.ts` dagi `PUBLIC_ROUTES` hali `navigation.ts`dan mustaqil,
   qo'lda saqlanmoqda — ikkilanish bor (Footer/NotFoundPage allaqachon `navigation.ts`dan oziqlanadi).
3. `docs/tasks/13-navbar.md` "Qabul mezonlari" ro'yxati oxirigacha bandma-band tekshirilmagan
   (Lighthouse, real skrinrider, 768px akkordeon va h.k.).

**TEKSHIRILMADI:** mobil akkordeon (hali yozilmagan); haqiqiy skrinrider; Lighthouse ko'rsatkichi;
production build/deploy.
