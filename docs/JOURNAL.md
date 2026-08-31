# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-31
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11, 06, 07, 08, 09, 10A va 10B
kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **09 va 10A PM tomonidan QABUL QILINDI.**
- **10B — maxsus imkoniyatlar tayyor.** Sarlavhadagi tugma ko'rinish panelini ochadi:
  shrift uch daraja (16/20/24px), yuqori kontrast (oq fon, qora matn), rasmlarni o'chirish,
  harflar oralig'i, «odatdagi ko'rinishga qaytarish». Tanlov `localStorage` da, `html`
  elementiga sinf sifatida qo'llanadi (`lib/a11y.ts` + `index.css`). **Alohida sayt
  versiyasi yo'q.**
- **Klaviatura:** «Asosiy mazmunga o'tish» havolasi, fokus hamma joyda ko'rinadi,
  `Escape` panel/menyu/til ro'yxatini yopadi, ochiq oynada fokus qamaladi
  (`useFocusTrap` — ochiq saytda ham, admin paneldagi 6 ta oynada ham).
- **Ekran o'qigichlar:** `header`/`nav`/`main`/`footer`, har sahifada bitta `h1` va daraja
  sakramaydi, barcha rasmda `alt`, forma maydonlari `label` bilan bog'langan, xato
  `FieldError` (ikonka + matn + `role="alert"`), ikonkali tugmalarda `aria-label`,
  til almashganda `html lang` o'zgaradi, dinamik joylarda `aria-live`.
- **Kontrast:** axe-core 14 ta sahifada **0 ta buzilish** (WCAG 2.0/2.1 A+AA), yuqori
  kontrast rejimida ham 0.
- **Qidiruv (10A)** va **murojaatlar (09)** avvalgidek ishlaydi.

### Nima hali ishlamaydi / bajarilmagan
- **10C (xavfsizlik sarlavhalari, CSP) boshlanmagan.**
- **404 sahifasidagi qidiruv maydoni hali `disabled`** — 10A tugagach uni `/search` ga
  ulash kerak edi, e'tibordan chetda qolgan (10C bilan birga qilinsin).
- **Hostda `node`/`npm` PATH da yo'q.** Butun tekshiruv Docker orqali: `postgres:16` (5433),
  `node:20`, `local-neon-http-proxy`, `puppeteer` + `axe-core`.
- `apps/web` da birlik sinovlari yo'q (vitest faqat `apps/api` da) — `lib/a11y.ts`
  brauzerda tekshirildi.
- **`RESEND_API_KEY` va `MAIL_FROM` o'rnatilmagan**, **R2 bucket production'da yo'q**,
  **migratsiyalar 2–7 production'ga qo'llanmagan.**
- Murojaatlarni saqlash muddati yuriskonsultdan kutilmoqda. Cron sozlanmagan.
- Throttle va rate limitlar izolyat xotirasida (KV/Durable Object kerak).
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda.

### Keyingi qadam
1. 10B ni PM tekshirsin.
2. 10C — xavfsizlik sarlavhalari va CSP (alohida kommit); shu bilan birga 404 dagi
   qidiruv maydonini ulash.

### Ochiq savollar
- Yopilgan murojaatlarni qancha muddat saqlash kerak? **Yuriskonsult javobi kutilmoqda.**
- Murojaat bildirishnomalari uchun alohida pochta manzili bormi (`appeals_email`)?
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?
- `apps/web` uchun vitest qo'shilsinmi (a11y va sanitizatsiya funksiyalari uchun)?

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
| 10B | Imkoniyati cheklanganlar uchun qulayliklar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 10C | Xavfsizlik sarlavhalari va CSP | ⏳ Navbatda |

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

### 2026-08-27 · 09 — Murojaatlar tizimi va elektron xat yuborish

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(contact): appeal tracking with email notifications`

**Baza.** `ContactMessage` ga `ticketNumber` (unikal), `status`, `statusChangedAt`,
`answeredAt`, `answerNote`, `notifiedAt` qo'shildi; `read` olib tashlandi. Migratsiya
`6_contact_appeals` mavjud yozuvlarni ko'chiradi: `read = true` → `in_review`, aks holda `new`;
raqamlar `createdAt` bo'yicha yil kesimida SQL oynali funksiya bilan beriladi.

**Server.** `lib/mail.ts` (Resend HTTP API, hech qachon `throw` qilmaydi),
`lib/mail-templates.ts` (uchta o'zbekcha shablon). `routes/contact.ts` qayta yozildi:
ketma-ket raqam, spam himoyasi, ochiq `GET /status`, admin `PATCH`, `POST /cleanup`.
`Env` ga `RESEND_API_KEY` va `MAIL_FROM` (ikkalasi ham ixtiyoriy) qo'shildi.

**Frontend.** `AppealStatusPage` (raqam + pochta), `ContactPage` ga honeypot, forma ochilgan
vaqt va murojaat raqamini ko'rsatish, `AdminMessagesPage` to'liq qayta yozildi,
boshqaruv panelida javobsiz murojaatlar. `RATE_LIMITED` xato kodi qo'shildi (API va web).

**Nima tekshirildi va qanday:**
- `tsc` (api + web), `npm run build`, `wrangler deploy --dry-run` — toza. Birlik sinovlari
  23/23. i18n uchala faylda 296 tadan, farq yo'q.
- **Kalitsiz holat (curl):** murojaat saqlandi, `M-2026-0001` qaytdi, foydalanuvchi
  muvaffaqiyat ko'rdi, jurnalda `warning` / `MAIL_NOT_CONFIGURED`.
- **Holat tekshiruvi:** to'g'ri juftlik → holat; **begona pochta → 404**; faqat raqam → 400;
  mavjud bo'lmagan raqam → **aynan o'sha 404 xabari** (farq yo'q, oracle bermaydi).
  Javobda murojaat matni yo'q.
- **Spam:** honeypot to'ldirilgan → 201 «muvaffaqiyat», bazaga **yozilmadi**; 1 soniyada
  yuborilgan → xuddi shunday; IP bo'yicha 4-murojaat → **429**; bir xil matn takroran
  yuborilganda **o'sha raqam** qaytdi va yangi yozuv yaratilmadi.
- **Xatlar (soxta Resend serveri bilan, haqiqiy xat YUBORILMADI):** so'rov
  `https://api.resend.com/emails` ga, `from` = `MAIL_FROM`, mavzu `Murojaatingiz qabul qilindi`.
  Uchala shablonda **murojaat matni yo'q, telefon raqami yo'q**, raqam va holat havolasi bor,
  xodim xatida admin havolasi bor, hammasi o'zbekcha.
- **Brauzerda:** forma → raqam `M-2026-0001` ekranda «saqlab qo'ying» izohi bilan;
  `/appeal-status` da to'g'ri juftlik → holat, begona pochta → «topilmadi»; uchala tilda
  sahifa tarjima qilingan, ko'rinib qolgan kalit yo'q; admin ro'yxatida raqam va holat,
  filtr ishladi; `answered` tugmasi **tasdiq so'radi** («Fuqaroga … xati yuboriladi.
  Davom etasizmi?»), bekor qilinganda holat o'zgarmadi; boshqaruv panelida javobsiz
  murojaatlar ko'rsatkichi.
- **Honeypot** DOM tekshiruvi: `left: -9999px`, `tabIndex = -1`, `aria-hidden` ichida —
  foydalanuvchi ko'rmaydi.

**Nima TEKSHIRILMADI:**
- **Haqiqiy xat yetib borishi** — `RESEND_API_KEY` yo'q va topshiriq chegarasi bo'yicha
  haqiqiy fuqarolarga sinov xati yuborilmadi. Kalit o'rnatilgach o'z pochtangiz bilan
  bir marta sinash kerak.
- Saqlash muddati bo'yicha tozalash (`POST /api/contact/cleanup`) haqiqiy muddat bilan.
- Rate limitning bir nechta Workers izolyati orasidagi xatti-harakati.

**Qarorlar va sabablari:**
- **Holat tekshiruvida sabab aytilmaydi.** «Raqam yo'q» va «pochta mos emas» javoblari farq
  qilsa, raqamlar ketma-ket bo'lgani uchun ularni birma-bir sinab ko'rish mumkin bo'lardi.
- **Spam rad etilganda «muvaffaqiyat» ko'rsatiladi** — robot rad etilganini bilmasligi kerak,
  aks holda himoyani aylanib o'tishga urinadi.
- **Honeypot `display: none` emas, ekrandan tashqarida** — ba'zi robotlar `hidden`
  maydonlarni o'tkazib yuboradi.
- **Xatlar murojaat saqlanganidan KEYIN va `waitUntil()` ichida yuboriladi** — xat
  yuborilmagani uchun fuqaroning murojaati yo'qolmasligi kerak.
- **Qabul qiluvchi manzil jurnal MATNIGA yozilmaydi** — `redact` uni niqoblasa ham,
  umuman bo'lmagani xavfsizroq.

**Eslatma:** ikki marta sinov shartimning o'zi noto'g'ri edi (honeypot uchun Playwright
ekrandan tashqaridagi elementni ham «ko'rinadigan» deb hisoblaydi; tasdiq matnida
«xat yuboriladi» o'rniga «xati yuboriladi» bor edi). Ikkalasi ham to'g'ridan-to'g'ri
tekshirib tasdiqlandi, ilovada xato yo'q.

---
