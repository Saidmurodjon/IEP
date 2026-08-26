# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12 va 11 kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **11-brend/404/huquqiy tugadi.** Institut logotipi saytda: sarlavhada emblema
  (`logo-emblem.png`), footerda to'liq logotip oq maydonchada (`logo-full.png`),
  favicon 32 va apple-touch-icon 180, ijtimoiy tarmoq rasmi 1200×630. Sayt palitrasi
  o'zgartirilmadi — logotip o'z ranglarida.
- **404 sahifasi to'liq:** sarlavha va footer bilan, uch tilda, `noindex, follow`,
  qidiruv maydoni joyi (10-topshiriq uchun `TODO`), asosiy bo'limlarga havolalar,
  admin havolasi yo'q. Admin panel uchun alohida `AdminNotFoundPage`.
- **Huquqiy bandlar (VM 373-son qarori):** footerda materiallardan foydalanish sharti
  (3 tilda) va sayt oxirgi yangilangan sanasi; yangilikda `sourceName`/`sourceUrl`
  (migratsiya `2_add_news_source`), admin formada 4-band eslatmasi bilan.
- **Sana formati** hamma joyda `26.08.2026` (`src/lib/date.ts`, `date-fns` uz/en/ru sozlamalari).
- **12-til prefiksi** o'z kuchida: `/uz/…`, `/en/…`, `/ru/…`, `LocalizedLink`, canonical + hreflang.
- **05-namoyish tayyorligi** o'z kuchida: aloqa ma'lumotlari `/api/settings` dan, `npm run demo`.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig`, 5433).
  Bazada 3 ta yangilik (3 tilda), 0 ta nashr, 17 birlik.

### Nima hali ishlamaydi / bajarilmagan
- **Logotip sifati past.** Manba `docs/reference/logo-original.jpg` — 407×410, JPEG, 25 KB,
  shaffof fonsiz. Undan olingan PNG'lar ham shuncha sifatda. **Foydalanuvchidan vektor fayl
  (SVG/AI/EPS) yoki kamida 1000px shaffof PNG kerak** — batafsil `apps/web/public/images/CREDITS.md`.
- **Haqiqiy 404 holat kodi yo'q.** Cloudflare Pages `_redirects` da hamma manzil `200` bilan
  `index.html` ga boradi. Foydalanuvchiga ko'rinadigan qism to'g'ri, lekin qidiruv roboti uchun
  status `200`. To'liq yechim SSR/prerender bilan — SEO topshirig'ida. Kodda `TODO` qoldirildi.
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan.** `npm run demo`
  shuni o'qiydi — namoyishdan oldin lokal Postgres kerak (`docs/demo.md` 1-bo'lim).
- **Migratsiya `2_add_news_source` production'ga qo'llanmagan.** Lokal bazada qo'llandi.
  Deploy'dan OLDIN production'ga qo'llanishi shart, aks holda `GET /api/news` 500 beradi.
- Bu mashinada Node.js o'rnatilmagan; tekshiruvlar scratchpad'dagi Node 22 bilan bajarildi.
- Sayt xaritasi yo'q; 03-production `wrangler login` dan keyin; 04-kontent production'ga qo'llanmagan.

### Keyingi qadam
1. 11 ni PM tekshirsin.
2. Navbat bo'yicha 06 (xodimlar, laboratoriyalar, hamkorlar).

### Ochiq savollar
- Logotipning vektor fayli va institut brend qo'llanmasi bormi? (Foydalanuvchi zimmasida.)
- Namoyish lokal bazada o'tkaziladimi? Tavsiya: **ha**.
- `site_url` hozir `https://energetika-institute.pages.dev`; domen ulangach admin paneldan o'zgaradi.

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 11 | Logotip, 404, huquqiy bandlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 06 | Xodimlar, laboratoriyalar, hamkorlar | ⏳ Navbatda |
| 07 | Fayl yuklash va tahrirlagich | ⏸ Kutmoqda |
| 08 | Xatoliklar jurnali | ⏸ Kutmoqda |
| 09 | Murojaatlar va Resend | ⏸ Kutmoqda |
| 10 | Qidiruv, imkoniyatlar, xavfsizlik | ⏸ Kutmoqda |

03-production alohida turadi va `wrangler login` dan keyin bajariladi.

**Foydalanuvchi zimmasidagi ochiq masalalar.** 373-son qaror bo'yicha
yuriskonsult javobi. **Logotipning vektor fayli (SVG/AI/EPS) yoki 1000px shaffof PNG** va brend qo'llanmasi. Xodimlar ma'lumoti va rasmlari.
Hamkorlar ro'yxati. Institut telefon raqami.

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

### 2026-08-26 · 11 — Logotip, 404 sahifasi va huquqiy bandlar

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(brand): institute logo, 404 page and legal notices`

**A. Logotip.** `docs/reference/logo-original.jpg` dan (407×410 JPEG) besh fayl tayyorlandi:
`logo-emblem.png`, `logo-full.png`, `og-image.png` (1200×630, navy fon), `favicon-32.png`,
`apple-touch-icon.png`. Oq fon flood-fill bilan olib tashlandi — faqat CHETDAN ulangan oq soha,
emblema ichidagi oq halqa joyida. JPEG shovqini tufayli chegarada 3 pikselli yumshoq alfa
o'tishi qilindi (birinchi urinishda to'q fonda qora nuqtalar chiqqandi).
Sarlavhada **faqat emblema** (yozuvli variant emas — nom yonida matn sifatida turadi va tilga
qarab o'zgaradi). Footerda to'liq logotip, lekin **oq maydonchada**: logotip yozuvining bir qismi
to'q ko'k, footer foni ham to'q — aks holda ko'rinmasdi. `index.html` da favicon va og meta
almashtirildi, `favicon.svg` o'chirildi. **Palitra o'zgartirilmadi** (A3 talabi).

**B. 404.** `NotFoundPage` to'ldirildi: `noindex, follow`, qidiruv maydoni (o'chirilgan holda,
10-topshiriq uchun `TODO`), Bosh sahifa / Institut haqida / Yangiliklar / Aloqa havolalari,
admin havolasi yo'q. `AdminNotFoundPage` — admin ichidagi noma'lum manzil uchun alohida sahifa,
`noindex, nofollow` va boshqaruv paneliga qaytish havolasi. i18n kalitlari `notFound` bo'limida
(12-topshiriqdagi vaqtinchalik `notfound` kalitlari olib tashlandi).

**C. Huquqiy.** Footerda foydalanish sharti (3 tilda, `footer.usage_terms`) va sayt oxirgi
yangilangan sanasi. Sana `GET /api/settings` javobiga qo'shilgan `lastUpdatedAt` dan keladi —
News/Publication/StructureUnit/SiteSetting `updatedAt` maksimumi, alohida so'rovsiz.
Yangilikka `sourceName`/`sourceUrl` + migratsiya `2_add_news_source`; API zod sxemasi, ro'yxat
`select`i va admin forma yangilandi (formada 373-son qarorning 4-bandi haqida eslatma).
Yangilik sahifasida manba faqat to'ldirilgan bo'lsa ko'rinadi, havola `rel="noopener noreferrer nofollow"`.
Sana formati: `src/lib/date.ts` — `dd.MM.yyyy`, `date-fns` ning `uz` (lotin), `enUS`, `ru`
sozlamalari ulandi. Oldin `NewsDetailPage` da `dd MMMM yyyy` bo'lgani uchun inglizcha oy nomi chiqardi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api + web) toza; `npm run build` toza. Migratsiya lokal bazaga `migrate deploy`
  bilan qo'llandi, `prisma generate` qayta ishga tushirildi.
- **Brauzerda (headless Chromium, lokal baza):**
  - 3 tilda bosh sahifa: sarlavha `logo-emblem.png`, footer `logo-full.png` — ikkalasi ham
    yuklandi (`naturalWidth > 0`); en/ru sarlavhada o'zbekcha logo yozuvi takrorlanmadi;
    footerda foydalanish sharti va sana `26.08.2026`; konsol xatosi va 4xx so'rov yo'q.
  - `/favicon-32.png`, `/apple-touch-icon.png`, `/images/og-image.png`, ikkala logotip — 200.
  - 404 uch tilda: `robots=noindex, follow`, sarlavha+footer joyida, qidiruv maydoni bor,
    to'rtta bo'lim havolasi til prefiksi bilan, admin havolasi yo'q; havola bosilib tekshirildi.
  - Admin 404: `/admin/mavjud-emas` → 404 sahifasi, `noindex, nofollow`, qaytish havolasi ishladi.
  - Admin panelda manba maydonlari bilan yangilik qo'shildi → `/uz/news/manba-sinovi` da
    "Manba: UzA" va havola ko'rindi; manbasiz yangilikda blok chiqmadi. Sinov yozuvi o'chirildi.
  - Sanalar uchala tilda `26.08.2026`; oy nomi bilan sana yo'q (bitta "February" mosligi —
    yangilik MATNI ichidagi qaror sanasi, format emas, tekshirib ko'rildi).
  - Mobil 375px: bosh sahifa va 404 — gorizontal overflow 0px.

**Nima TEKSHIRILMADI:**
- Haqiqiy `404` HTTP status kodi (Pages `_redirects` hammasini `200` qiladi) — SEO topshirig'i.
- Ijtimoiy tarmoqda ulashish (og rasm) — faqat fayl mavjudligi va meta teglar tekshirildi.
- Favicon haqiqiy brauzer yorlig'ida — headless rejimda ko'rinmaydi, faqat 200 javob tekshirildi.
- Production'ga hech narsa yozilmadi; **migratsiya production'ga qo'llanmadi**.

**Qarorlar va sabablari:**
- Footerda to'liq logotip oq maydonchada — spetsifikatsiya "footerda to'liq logotip" deydi, lekin
  yozuvi to'q ko'k va to'q footerda ko'rinmasdi; oq maydoncha logotipni asl ko'rinishida saqlaydi.
- `lastUpdatedAt` alohida endpoint emas, `/api/settings` javobiga qo'shildi — footer allaqachon
  shu so'rovni qiladi, ikkinchi so'rov keraksiz.
- Sana raqamli (`dd.MM.yyyy`) bo'lgani uchun til sozlamasi natijani o'zgartirmaydi, lekin
  `date-fns` locale'lari baribir ulandi — kelajakda uzun format kerak bo'lsa tayyor tursin.

---

### 2026-08-26 · 12 — Manzillarga til prefiksi

**Kim:** Claude Code (Opus 5) · **Kommit:** `refactor(i18n): language prefixed routes with hreflang`

- **`src/lib/routes.ts`** (yangi) — `SUPPORTED_LANGS`, `PUBLIC_ROUTES` (ochiq sahifalarning
  yagona ro'yxati), `splitLangPrefix`, `localizePath`, `matchesPublicRoute`, `detectPreferredLang`.
- **`App.tsx`** — ochiq marshrutlar `/:lang` ostiga olindi. `LanguageGuard` prefiksni tekshiradi
  va `i18next` ni manzilga moslaydi; `UnprefixedRoute` prefikssiz manzilni `PUBLIC_ROUTES` bo'yicha
  taniydi (tanilsa `/uz/...`, tanilmasa 404). Admin bloki qo'lga tegilmadi.
- **`LocalizedLink` + `LocalizedNavLink`** (yangi) va `useLocalizedPath`/`useCurrentLang` hooklari.
  Header, Footer, HomePage, NewsPage, NewsDetailPage, NotFoundPage — hammasi ko'chirildi.
- **Til almashtirgich** endi `i18n.changeLanguage` chaqirmaydi, `navigate()` bilan prefiksni
  almashtiradi va joriy yo'l, `search`, `hash` saqlanadi.
- **`SeoHead`** (yangi) — 8 ta ochiq sahifadagi alohida `Helmet` bloklari o'rniga. `html lang`,
  `canonical`, `hreflang` × 3 + `x-default`. Asosiy manzil `site_url` sozlamasidan;
  seed'ga va admin Sozlamalar sahifasiga qo'shildi.
- **`NotFoundPage`** (yangi, sodda) — 11-topshiriqda brend ko'rinishi beriladi.
- **CLAUDE.md 15-qoida** qo'shildi (ochiq qismda faqat `LocalizedLink`). Shu sababli 4.4 dagi
  qoidalar 15–18 → **16–19** ga surildi; oldingi jurnal yozuvlaridagi "16-qoida" endi 17.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api, web) toza; `npm run build` toza.
- **Brauzerda (headless Chromium, lokal baza):**
  - `/` → brauzer `en` bo'lsa `/en`, `ru` bo'lsa `/ru`, `fr` bo'lsa `/uz`; xotirada `ru` bo'lsa `/ru`.
  - `/uz/news`, `/ru/news`, `/en/news` — h1 mos tilda, `html lang` mos, canonical + 4 ta alternate.
  - `/xx/news`, `/uzbekistan`, `/uz/qwerty` → **404**, bosh sahifaga yo'naltirilmadi.
  - `/news`, `/about`, `/contact`, `/news/:slug` → `/uz/...` ga yo'naltirildi.
  - Ichki sahifada (`/uz/news/rasmiy-veb-sayt-ishga-tushdi`) ruschaga o'tildi →
    `/ru/news/rasmiy-veb-sayt-ishga-tushdi`, sahifa saqlandi.
  - `/en/about` yangilandi — til va manzil saqlandi. Xotirada `uz` bo'lsa ham `/ru/laboratories`
    havolasi ruscha ochildi (ulashilgan havola sinovi).
  - 8 sahifa × 3 til = **24 yuklash**: canonical, 4 ta alternate, `html lang` — hammasi to'g'ri,
    konsol xatosi yo'q.
  - **Admin buzilmagan:** `/admin/login` → login → yangilik qo'shish (3 tilda) → admin ro'yxatida →
    `/uz/news` da ko'rindi → kartochka havolasi `/uz/news/<slug>`, ruschada `/ru/news/<slug>`.
    Sinov yozuvi bazadan o'chirildi.
- **grep:** `to="/` — ochiq qismda faqat `LocalizedLink`, prefikssiz qolgani yo'q; qolgan
  oddiy `Link`/`Navigate` faqat `/admin/...` (Footer'dagi admin havolasi, DashboardPage,
  AdminLayout, App.tsx). `navigate(` — faqat admin va til almashtirgich.

**Nima TEKSHIRILMADI:**
- Haqiqiy HTTP 302 — SPA ichida yo'naltirish klient tomonida. Cloudflare Pages uchun
  `_redirects` qoidalari yozilmadi (SEO topshirig'iga qoldi).
- Sayt xaritasi hosil qilinmadi (topshiriq chegarasidan tashqarida).
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Qarorlar va sabablari:**
- Prefikssiz `/news` va noto'g'ri `/xx/news` ni ajratish uchun `PUBLIC_ROUTES` ro'yxati
  ishlatildi: aks holda `/news` "til = news" deb tushunilib 404 berardi.
- `LanguageGuard` `i18n.changeLanguage` ni render paytida chaqiradi (resurslar bundle ichida,
  so'rov ketmaydi) — `useEffect` da qilinsa birinchi kadr eski tilda chizilardi.
- `PublicLayout` `LanguageGuard` dan yuqorida turadi, shunda 404 sahifasi ham sarlavha va
  footer bilan ko'rinadi.

**Boshqa:** oldingi sessiyalardan qolgan `.github/workflows/deploy.yml` o'chirilishi tiklandi —
`docs/deploy.md` va `docs/ROADMAP.md` hamon shu faylga tayanadi, o'chirish sababi hech qayerda
qayd etilmagan edi. `docs/tasks/*.md` va `CLAUDE.md` o'zgarishi ham shu kommitga kiritildi.

---

### 2026-08-26 · 05 — Namoyishga tayyorlash

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(demo): settings-driven contacts and demo readiness`

- **Aloqa ma'lumotlari kodda emas.** Yangi `apps/web/src/hooks/useSettings.ts` (react-query,
  `staleTime` 5 daq, bitta so'rov). `Header.tsx`, `Footer.tsx`, `ContactPage.tsx` qattiq yozilgan
  telefon/pochta/manzildan tozalandi. Zaxira qiymat qoldirilmadi — bo'sh sozlama = qator ko'rinmaydi.
- **Seed sozlamalari:** haqiqiy manzil (3 tilda) + `energy@academy.uz`; `phone` va `working_hours` bo'sh.
- **`packages/db/src/demo-content.ts`** — 3 ta yangilik (3 tilda, hujjat bilan tasdiqlangan yoki
  neytral mavzular), `npm run db:demo`. Lokal bo'lmagan `DATABASE_URL` da ataylab xato beradi.
  Seed'dagi o'ylab topilgan "yangi laboratoriya ochildi" yangiligi lokal bazadan olib tashlandi.
- **AboutPage** tozalandi: o'ylab topilgan raqamlar (120+ xodim, 30+ yil) va 8 ta taxminiy
  yo'nalish o'chirildi; o'rniga rasmiy tuzilmadan kelgan 6 laboratoriya va hujjatdagi raqamlar
  (`INSTITUTE_STAFF`, `apps/web/src/lib/structure.ts` — HomePage bilan umumiy).
- **Aralash til tuzatildi:** AboutPage, Footer, ContactPage (label, placeholder, zod xato xabarlari),
  PublicationsPage, Helmet sarlavhalari — hammasi i18n'ga ko'chirildi, uchala json yangilandi.
  Footer'dagi `t('common.language') === 'Til'` hiylasi `footer.pages` bilan almashtirildi.
- **Nashrlar bo'sh holati** chiroyliroq: punktir ramka + "ro'yxat to'ldirilmoqda" izohi. Soxta nashr yo'q.
- **`npm run demo`** qo'shildi (build + `wrangler dev` + `vite preview`), `docs/demo.md` yozildi.

**Yo'l-yo'lakay topilgan va tuzatilgan (spetsifikatsiyada yo'q edi):**
1. `apps/web/vite.config.js` va `.d.ts` — **repoga kommit qilingan generatsiya artefakti**
   `vite.config.ts` ni soya qilardi (Vite `.js` ni ustun ko'radi). Undagi `envDir` yo'qligi sababli
   `VITE_API_URL` production build'ga umuman tushmasdi → `vite preview` da sayt API'ni topolmasdi.
   Fayllar o'chirildi va `.gitignore` ga qo'shildi (CLAUDE.md 16-qoida). Bu namoyishni buzadigan xato edi.
2. `npm run build` ildizda **hech qachon ishlamagan**: `packages/shared` va `packages/db` da
   `tsconfig.json` yo'q edi, `tsc --noEmit` yordam matnini chiqarib xato qaytarardi.
   Ikkalasiga tsconfig qo'shildi, `packages/db` ga `build` skripti qo'shildi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` — apps/api, apps/web toza; `npm run build` (shared → db → api dry-run → web) toza.
- **Brauzerda (headless Chromium, lokal Postgres `energetika_mig`):**
  7 ochiq sahifa × 3 til = 21 yuklash — ko'rinib qolgan tarjima kaliti yo'q, konsol xatosi yo'q,
  eski qattiq aloqa ma'lumoti yo'q; 375px da 7 sahifada gorizontal overflow 0px;
  ingliz/rus sahifalarida o'zbekcha qoldiq topilmadi.
- **Uchidan uchiga admin ssenariysi brauzerda bajarildi:** login → Yangiliklar → "Yangi qo'shish" →
  3 tilda to'ldirish → Saqlash → admin ro'yxatida ko'rindi → ochiq `/news` sahifasida ko'rindi.
  Sozlamalar → `phone` = `+998 71 000-00-00` → Saqlash → header/footer/Aloqa'da 3 ta `tel:` havola
  paydo bo'ldi → `phone` yana bo'shatildi → 0 ta `tel:` havola. Sinov yozuvi bazadan o'chirildi.
- `npm run demo` haqiqatan ishga tushirildi: web :5173 (200), API :3000 (200), yig'ilgan bundle
  ichida `localhost:3000` bor.
- Grep mezonlari: `998 71 262`, `262-00-00`, `info@energetika` — hammasi bo'sh.

**Nima TEKSHIRILMADI:**
- Kontakt formasini haqiqatan yuborish (POST) — sinalmadi.
- `npm run demo` ni lokal baza bilan uchidan uchiga — `.dev.vars` production'ga qaragani uchun
  o'sha rejimda faqat 200-javob va bundle tekshirildi, ma'lumot production'dan keldi.
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Muhit haqida:** bu mashinada Node.js/npm o'rnatilmagan. Barcha tekshiruvlar scratchpad'ga
vaqtincha yuklangan Node 22 bilan bajarildi (repoga hech narsa qo'shilmadi).

**Qarorlar va sabablari:**
- Telefon uchun zaxira qiymat yo'q: noto'g'ri raqamdan ko'ra bo'sh joy afzal (topshiriq talabi).
- `working_hours` ham bo'shatildi — tasdiqlanmagan ma'lumot o'ylab topilmaydi.
- Namoyish kontenti seed'dan ajratildi: seed production'da ishlatilishi mumkin, demo — hech qachon.
- AboutPage raqamlari HomePage bilan bitta `INSTITUTE_STAFF` konstantasidan — ikki joyda
  har xil raqam ko'rinishining oldini olish uchun.

---

### 2026-08-25 · PM holat tekshiruvi

**Kim:** Cowork sessiyasi (PM roli) · Yozuvsiz (faqat o'qish + jurnal)

| Tekshiruv | Natija |
|---|---|
| `git log` — 6 kommit, `origin/master` = `69b6548` = lokal HEAD | ✅ push tasdiqlandi |
| `tsc --noEmit` (api + web) | ✅ toza |
| `seed.ts` — 17 birlik, `staffCount` yig'indisi 25 (18 ilmiy + 7 ma'muriy) | ✅ hujjatga mos |
| `deleteMany` qamrovi — aynan 6 ta legacy `dept-*` id | ✅ xavfsiz, keng emas |
| Migratsiyalar `0_init` + `1_add_structure_staff_fields` | ✅ mavjud |
| Live `GET /api/structure` | ❌ **hali eski demo** — `prof. Mirzayev A.K.` ochiq saytda |
| Live frontend `/images/CREDITS.md` | ❌ 404 (SPA fallback) — yangi build deploy qilinmagan |

**Topilgan kamchiliklar:**
1. `docs/tasks/03-production.md`, `docs/tasks/04-kontent.md` va `docs/reference/` **kommit qilinmagan**.
   04 bajarilgan, lekin uning spetsifikatsiyasi va manba hujjati repoda yo'q — keyingi sessiya
   `bf01d7b` nima asosida qilinganini bilolmaydi.
2. `deploy.yml` da `deploy-web` va `deploy-api` **parallel** ishlaydi. Migratsiya yiqilsa ham
   frontend baribir deploy bo'ladi. `deploy-web` ga `needs: deploy-api` qo'shilishi kerak.

---

### 2026-08-25 · GitHub Actions deploy pipeline (sozlanmagan)

**Kim:** Claude Code (Opus 5) · **Kommit:** `ci: add GitHub Actions deploy to Cloudflare (Pages + Workers)`

Muammo #9 (GitHub orqali deploy). Foydalanuvchi so'radi.

- `.github/workflows/deploy.yml` — master'ga push → 2 job: `deploy-web` (Pages, statik, xavfsiz)
  va `deploy-api` (avval `prisma migrate deploy`, keyin `wrangler deploy`). `cloudflare/wrangler-action@v3`.
- `docs/deploy.md` — to'liq sozlash: CF token, GitHub secret/variable, Worker secret, **bir martalik baseline**
  (`migrate resolve --applied 0_init`, chunki baza db push bilan yaratilgan), deploy tartibi, seed qo'lda.

**BAJARILMADI / bloklangan:**
- Push qilinmadi (deploy outward-facing, shartlari bor, foydalanuvchi tasdig'i kerak).
- Cloudflare auth yo'q — token/secret o'rnatolmadim. Bu foydalanuvchi qadami.
- Production baza baseline qilinmagan → `migrate deploy` hozir xato beradi (hujjatda tushuntirildi).

**Tekshirildi:** YAML struktura to'g'ri (2 job, push+dispatch trigger). Haqiqiy deploy sinovi imkonsiz (auth yo'q).

**Qaror:** migratsiya CI'da deploy'dan avval (ustun tartibi). Seed CI'da EMAS (DELETE — xavfli, qo'lda).
Frontend uchun `VITE_API_URL` majburiy (Pages'da proxy yo'q).

---

### 2026-08-25 · 04-kontent (kod qismi) — rasmiy tuzilma

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(content): replace demo data with official 2025 institute structure`

Manba: `docs/reference/tuzilma-2025-02-27.jpg` (FA Prezidiumi 2025-02-27, 12-son qaror, 10-ilova).
Hujjat topshiriq jadvallari bilan solishtirildi — **to'liq mos, nomuvofiqlik yo'q**.

- `schema.prisma` — `staffCount Int?`, `isAdvisory Boolean` qo'shildi.
- `prisma/migrations/0_init` + `1_add_structure_staff_fields` — baselining (DB db push bilan yaratilgan,
  migration tarixi yo'q edi). `migrate diff` bilan yaratildi, lokal bazada `migrate deploy` toza qo'llandi.
- `seed.ts` — 17 birlik hujjatga muvofiq, barcha `head: null`; eski 6 demo `dept-*` id `deleteMany` bilan olib tashlanadi.
- `structure.ts` route — `unitSchema` ga yangi tiplar (council/position/service) + staffCount/isAdvisory.
- `shared/types.ts` — `StructureUnit` yangilandi.
- Frontend: `StructurePage` (tip tarjimasi, staffCount, maslahat organi punktir), `LabsPage` (staffCount),
  `HomePage` stats (6/18/29 + jonli nashr, `+` yo'q). `locales/*.json` — tip yorliqlari, uchala tilda mos.

**Tekshirildi (LOKAL test baza `energetika_mig`):** migrate deploy toza; seed 17 birlik; GET /api/structure to'g'ri
daraxt (6 lab, sonlar 3,3,4,2,2,3; ilmiy 18); StructurePage/LabsPage brauzerda (skrinshot) — 6 lab, maslahat organi
ajratilgan, xodim sonlari; home stats 6/18/29; soxta ism yo'q; head hamma joyda null; tsc+build (api+web) toza; 3 til mos.

**Production'ga QO'LLANMADI** (rule 8: DELETE + production yozuv → tasdiq kerak). Deploy tartibi: avval migratsiya, keyin kod.

**Qolib ketdi:** demo nashrlar (Mirzayev/Toshmatov) production'da — o'chirish tasdiq kutmoqda. Lab tavsiflari
bo'sh (o'ylab topilmadi) — institut beradi. Manzil/sana/telefon/rahbar ismlari — foydalanuvchiga savollar berildi.

---

### 2026-08-25 · Placeholder SVG'lar haqiqiy fotolarga almashtirildi

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(ui): use real public-domain energy photos for hero and about`

Foydalanuvchi haqiqiy, mavzuga oid rasm so'radi. Topshiriq "tashqi rasm yuklamang" degan edi
(litsenziya xavfi) — shuning uchun **faqat public-domain** rasm ishlatildi (huquqiy xavf yo'q).

- `public/images/hero-solar.jpg` — AQSh DoE quyosh stansiyasi fotosi (Chris Allan), public domain.
- `public/images/about-wind.jpg` — AQSh DoE shamol fermasi (Power County, Idaho), public domain.
- Ikkalasi ham Wikimedia Commons'dan, `sips` bilan kichraytirilib siqildi (hero 1600px/336K, about 1100px/156K).
- `public/images/CREDITS.md` (yangi) — manba, muallif, litsenziya, Commons havolalari.
- Eski `hero-placeholder.svg`, `about-placeholder.svg` o'chirildi.
- `HomePage.tsx` — hero fon `hero-solar.jpg` (dekorativ, aria-hidden); about `about-wind.jpg` +
  tavsifiy alt (`home.about_img_alt`, 3 tilda), `object-cover aspect-[4/3]`, `loading="lazy"`.

**Tekshirildi:** `tsc` + `build` toza; brauzerda hero foto `naturalWidth=1600` yuklandi, matn kontrasti
yetarli (to'q qoplama chapda); about foto ko'rinadi; ikkala rasm HTTP 200 `image/jpeg`; mobil overflow yo'q.

**Qaror:** public-domain (CC-BY/CC-BY-SA emas) — atribut majburiyati yo'q, davlat sayti uchun eng xavfsiz.
AQSh DoE fotolari — energetika idorasi manbasi, mavzuga to'liq mos. Institut o'z fotosini bergach,
shu fayllar almashtiriladi (yo'llar o'zgarmaydi).

---

### 2026-08-25 · 02-dizayn bajarildi (akademik palitra + hero)

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(ui): academic navy + gold palette, hero imagery, lighter sections`

- `tailwind.config.js` — `primary` (bosiq navy) va `accent` (oltin) palitralari to'liq almashtirildi.
- `public/images/hero-placeholder.svg`, `about-placeholder.svg` (yangi) — o'zimiz yasagan abstrakt SVG
  (tarmoq/quyosh paneli motivi). Tashqi havola yo'q, foto yuklanmagan.
- `HomePage.tsx` — hero rasm+qoplama (to'q gradient o'rniga), balandlik kamaytirildi, blur doiralar olib
  tashlandi; stats `bg-primary-50` + oltin ikonkalar (Lightbulb/Beaker/BookOpen/Calendar); yangi "Institut
  haqida" seksiyasi (matn+SVG); yangilik kartochkalari `imageUrl` null bo'lsa placeholder (bir xil balandlik);
  CTA yengil fon, yagona to'q element — tugma. Hard-code matn `home.contact_desc` kalitiga ko'chirildi.
- `Header.tsx` — ustki panel `bg-primary-900` → `bg-primary-50` (yengil).
- `locales/{uz,en,ru}.json` — 6 yangi kalit (`about_*`, `contact_desc`), uchala tilda mos (97 kalit).

**Tekshirildi:** `tsc --noEmit` toza; `build` toza; brauzerda desktop+mobil(375px) skrinshot, overflow yo'q;
"Institut haqida" 3 tilda DOM orqali tasdiqlandi; ichki sahifalar (about/structure/labs/news/pubs/contact)
yangi palitrada render, konsol xatosi yo'q; `btn-primary` computed rang `rgb(40,70,106)` (yangi palitra faol).

**Qaror:** Footer `bg-primary-950` (to'q) qoldirildi — spec 3 ta blokni sanagan (header/hero/CTA), footer
unda yo'q edi; footer sayt "chrome"i, hero yagona to'q *kontent* seksiyasi. Bu ataylab qilingan tanlov.

**Tekshirilmadi:** haqiqiy foto yo'q (placeholder SVG); `AboutPage` da aralash uz/en kontent bor — bu bazadagi
demo ma'lumot muammosi, dizayn topshirig'iga kirmaydi.

---

> Bundan oldingi yozuvlar arxivga ko'chirildi: [`docs/journal-archive/2026-08.md`](journal-archive/2026-08.md)
