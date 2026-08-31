# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-31
**Branch:** `master` · **Push qilinganmi:** ✅ ha — `09`, `10A`, `10B`, `10C` va `fix(files)`
(fayl havolalari + CSP) `origin/master` ga yuborilgan (`878b06b..4233d8d`). `13-navbar` shu
sessiyada ustiga qo'shilib commit va push qilinmoqda.

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

### 2026-08-31 · 10C — Xavfsizlik sarlavhalari va CSP (+ uchta qolib ketgan tuzatish)

**Kim:** Claude Code (Sonnet 5) · **Kommit:** `feat(security): security headers and content security policy`

**Nima qilindi.** `apps/web/public/_headers`: HSTS (`max-age=31536000; includeSubDomains`),
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy` (kamera/mikrofon/joylashuv o'chirilgan), va
`Content-Security-Policy-Report-Only` (`script-src`/`style-src` da `unsafe-inline`/
`unsafe-eval` YO'Q; `style-src`/`font-src` — Google Fonts; `img-src 'self' data:`;
`connect-src` ga production API qo'shildi; `object-src 'none'`, `frame-ancestors 'none'`).
API (`index.ts`): uchta sarlavhani qo'shadigan oraliq qatlam (`finally` bilan — xatoli
javobda ham ishlaydi), `lib/env.ts` ga `getFrontendUrl()` — `FRONTEND_URL` bo'sh bo'lsa
`ConfigError` (fail closed), CORS shu funksiyadan oladi, hardcoded `localhost:5173`
olib tashlandi.

**Qolib ketgan uchta tuzatish (foydalanuvchi so'ragan):**
1. 404 sahifasidagi qidiruv maydoni endi `disabled` emas — `Enter` `/search?q=` ga
   olib boradi. `notFound.search_soon` kaliti (endi ishlatilmaydi) uchala tildan
   o'chirildi.
2. `AdminLayout` ga `main#main-content` va skip-link qo'shildi (`PublicLayout` bilan
   bir xil andoza). Mobil menyu tugmasiga `aria-label` qo'shildi.
3. `Header.tsx`: `AccessibilityPanel`ga uzatilgan `onClose` `useCallback` bilan
   o'raldi. **Sabab:** `onClose` har render'da yangi funksiya edi; panelda sozlama
   o'zgartirilganda `useAccessibility()` Header'ni qayta render qilardi →
   `useFocusTrap`ning effekti (`onClose` dependency) qayta ishga tushardi →
   `cleanup` `opener.focus()` ni chaqirib, keyin `setup` panelning BIRINCHI
   elementiga fokus berardi — foydalanuvchi bosgan tugmadan fokus sakrardi.

**Tekshirildi (Docker: `postgres:16`, `node:20`, `wrangler pages dev`, `puppeteer`).**
`tsc` (api+web), vitest 43/43, `wrangler deploy --dry-run`, `vite build` — toza.
**`curl -I` orqali (haqiqiy Hono javobi):** muvaffaqiyatli VA 404 javobida uchala
sarlavha bor; ruxsat etilgan origin uchun `Access-Control-Allow-Origin` to'g'ri,
ruxsat etilmagan origin uchun yo'q; `FRONTEND_URL=""` va `undefined` ikkalasida ham
500 + `Server configuration error` (ichki tafsilot yo'q), sarlavhalar shu javobda
ham bor. **`wrangler pages dev` + `curl -I`:** barcha 6 sarlavha ham `/` da, ham
`/assets/*.js` da chiqadi (real Cloudflare Pages `_headers` mexanizmi). **Brauzerda
(Report-Only rejimda haqiqiy sahifa):** bosh sahifa va `/uz/news` da **0 ta CSP
buzilish xabari** — shrift, skript, uslub, API so'rovi hammasi siyosat bilan mos.
**Uchta tuzatish:** 404 maydoni `Enter` bosilganda `/uz/search?q=energetika` ga
o'tdi; admin sahifalarning barchasida skip-link `Tab` da ko'rinadi va
`#main-content` ga fokus beradi; Header panelida "Katta" va "Yuqori kontrast"
tugmalari ketma-ket bosilganda fokus har ikkalasida ham o'sha tugmaning o'zida
qoldi (avval birinchi elementga sakrardi).

**Yo'l-yo'lakay topilgan, TUZATILMAGAN (jurnalga yozildi — 8a-qoida):** admin
panelda axe-core yangi topilmalar berdi — `/admin/news` da 6 ta ikonka tugmada
nom yo'q, `/admin/messages` va `/admin/logs` da filtr `<select>` larida nom yo'q
va sana maydonida `label` yo'q, bir nechta joyda `text-gray-400` kontrasti. Bular
373-son qaror doirasiga kirmaydi (admin ichki vosita), alohida topshiriq sifatida
navbatga qo'yish tavsiya etiladi.

**TEKSHIRILMADI:** production'da haqiqiy sarlavhalar (`securityheaders.com`);
CSP'ning bir necha kunlik real kuzatuvi (Report-Only endigina qo'yildi).

**Qarorlar.** CSP **hali Report-Only** — vazifa shartiga ko'ra bir necha kun
kuzatilmasdan haqiqiy rejimga o'tkazilmaydi. Sarlavha oraliq qatlami `try/finally`
bilan — CORS middleware'i `ConfigError` tashlab qisqa tutashsa ham (`FRONTEND_URL`
yo'q), xavfsizlik sarlavhalari baribir qo'shiladi. `getFrontendUrl()` boshqa
secret'lar bilan bir xil naqshda (`ConfigError`, `middleware/auth.ts` bilan mos).


### 2026-08-31 · 10B — Imkoniyati cheklangan shaxslar uchun qulayliklar

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(a11y): accessibility panel and keyboard navigation`

**Nima qilindi.** `lib/a11y.ts` (sozlamalar, `localStorage`, `html` sinflari, boy matndagi
rasmni `alt` ga almashtirish), `hooks/useAccessibility.tsx`, `hooks/useFocusTrap.ts`,
`components/AccessibilityPanel.tsx`, `components/A11yImage.tsx`, `components/FieldError.tsx`.
`index.css` ga CSS o'zgaruvchilari va `.a11y-*` sinflari, `.skip-link`, global
`:focus-visible`. `PublicLayout` ga «Asosiy mazmunga o'tish» + `main#main-content`.
`Header` ga panel tugmasi, `Escape`, `aria-*`, `nav` nomlari. Ochiq qismdagi 9 ta rasm
`A11yImage` ga o'tkazildi. Sarlavha darajalari tuzatildi (Labs/News/Publications/Structure
`h3` → `h2`). Formalar `id`+`htmlFor` bilan bog'landi. Kontrast: `text-gray-400`/`-300`
(2.54:1 / 1.47:1) → `gray-500`, `accent-500/600` → `accent-700`, footer huquqiy matni
to'q fonda `gray-500` (3.1:1) → `gray-400` (5.9:1). Admin paneldagi 6 ta oynaga
`role="dialog"` + fokus qopqoni. i18n `a11y.*` — uchala tilda 351 kalit, farq yo'q.

**Tekshirildi (headless Chrome + axe-core, Docker'da).** `tsc` (api+web) toza, vitest 43/43,
`vite build` toza. **axe-core (WCAG 2.0/2.1 A+AA) 14 ta sahifada — 0 buzilish**, yuqori
kontrast rejimida ham 0 (avval 42 ta `color-contrast` bor edi). Skip-link: `Tab` bosilganda
ko'rinadi (`top ≥ 0`), `Enter` fokusni `#main-content` ga oladi, fokus ketgach yashirinadi.
Panel: `role="dialog" aria-modal`, fokus ichida, **40 marta `Tab` dan keyin ham ichida**,
`Escape` yopadi va fokus tugmaga qaytadi. Shrift 16→20→24px, kontrast `rgb(255,255,255)` fon
va `rgb(0,0,0)` matn, `aria-pressed` teskari rangda; rasmlar o'chirilganda ko'rinadigan rasm 0
va `.a11y-alt` matnlari chiqadi; oraliq 1.44px/2.56px/28.8px. Tanlov qayta yuklangandan keyin
saqlanadi, «qaytarish» sinflarni tozalaydi. `html lang` uz/en/ru bo'yicha o'zgaradi.
Bo'sh forma yuborilganda 4 maydonda `aria-invalid`, `aria-describedby`, `role="alert"` va
ikonka; shu holatda ham axe toza. 60 marta `Tab` — tuzoq yo'q. Admin oynasi: dialog, fokus
qamalgan, `Escape` yopadi. `replaceImagesWithAlt` brauzerda 6 holatda tekshirildi,
`alt="<img onerror=...>"` matn sifatida chiqdi, rasm in'ektsiya qilinmadi.

**TEKSHIRILMADI:** haqiqiy ekran o'qigich (NVDA/VoiceOver) bilan qo'lda; 404 sahifasidagi
`disabled` qidiruv maydoni hali `/search` ga ulanmagan (10C ga qoldi).

**Qarorlar.** Rasm almashtirish **DOM orqali**, regex bilan emas — `alt` ichida `>` bo'lsa
regex tegni noto'g'ri joyda tugatardi; `textContent` o'zi ekranlaydi, qo'lda `escape` qilinsa
`&amp;` `&amp;amp;` ga aylanardi. `.skip-link` `fixed` — `absolute` da `top: -100%` ota blok
balandligiga bog'lanib qolardi. Yuqori kontrastda `aria-pressed`/`aria-selected` teskari
rangda: hamma fon oq bo'lgani uchun holat faqat rang bilan bilinmay qolardi.

### 2026-08-31 · 10A — Sayt bo'ylab to'liq matnli qidiruv

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(search): full text search across the site`

**Xavfsizlik (kommitsiz — fayllar `.gitignore` da).** `apps/api/.dev.vars` production Neon'ga
qaragan edi → lokal Postgres; production nusxasi `.dev.vars.production` da (wrangler o'qimaydi).
**Root `.env` HALI production'ga qaraydi** — `prisma migrate`/`seed` shuni oladi, ehtiyot bo'ling.

**Nima qilindi.** Migratsiya `7_search_vectors`: 5 jadvalda `searchVector tsvector` + GIN indeks
+ backfill. SQL ifodalari `packages/shared/src/search-vectors.ts` da — API, seed va migratsiya
uchun yagona manba. `routes/search.ts` (UNION ALL, `ts_rank`, `ts_headline` → `<mark>`, bo'lim/
sana filtri, sahifalash, IP 30/daqiqa), `lib/search-index.ts` (`reindex()`), `lib/rate-limit.ts`
(uchta nusxa o'rniga bitta). Frontend: `/search` sahifasi, sarlavhadagi maydon, 300 ms kechikish,
klaviatura, `aria-live`, `sanitizeSnippet` (faqat `<mark>`), i18n 323 kalit uchala tilda.

**Tekshirildi.** Hostda `node` yo'q — hammasi Docker'da (`postgres:16`, `node:20`,
`local-neon-http-proxy`, `puppeteer`). Bo'sh bazada `migrate deploy` 8/8 toza, `migrate diff`
drift yo'q, 5 GIN indeks bor. `tsc` (api/web/shared/db) toza, vitest **43/43**,
`wrangler --dry-run` va `vite build` toza. **HTTP:** `q=energetika` → 6 natija guruhlangan;
`q=e` va `q=---` → 400; `type=structure` → `/laboratories/:id`; sana oralig'i ikki chetini
qamraydi; noto'g'ri sana → 400; **31-so'rovda 429**; parchada faqat `<mark>`. Admin orqali
yaratilgan yangilik/nashr/xodim **darhol** topildi, `PUT` dan keyin yangi sarlavha bo'yicha ham.
**Brauzerda:** guruhlar/sonlar, filtrlar manzilni o'zgartiradi, bo'sh holat maslahati,
sarlavhada 6 taklif → `↓↓`+`Enter` yangilikka o'tdi, `Escape` yopdi, uchala tilda natija,
375px da overflow 0, konsol xatosi yo'q.

**TEKSHIRILMADI:** production Neon'da migratsiya; haqiqiy `wrangler dev`; ekran o'qigich (10B);
ko'p izolyatli rate limit.

**Qarorlar.** Lug'at `simple` + prefiks (`so'z:*`) — o'zbek lug'ati yo'q, aks holda `energetika`
so'rovi `energetikaning` ni topmasdi; har bir so'z qo'shtirnoqda (`'o''zbek':*`), shuning uchun
apostrof va `&|!` `tsquery` ni buzmaydi. Hisoblar HAMMA bo'lim bo'yicha, natijalar tanlangani
bo'yicha — filtrdagi sonlar sakramasin. `reindex()` xatosi so'rovni yiqitmaydi, jurnalga
`SEARCH_INDEX_FAILED` tushadi. Sana SQL da ISO matnga o'giriladi.
