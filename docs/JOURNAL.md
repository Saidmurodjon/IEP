# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11 va 06 kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **06-xodimlar/hamkorlar tugadi (kod).** Ikkita yangi model (`Employee`, `Partner`),
  migratsiya `3_add_employees_partners`, ikkita API marshruti (`/api/employees`, `/api/partners` —
  `GET` ochiq, yozuv `requireAuth`), uchta ochiq sahifa (`/management`, `/employees`,
  `/laboratories/:id`), hamkorlar lentasi va ikkita admin bo'limi.
- Laboratoriya kartochkalari endi batafsil sahifaga olib boradi; mudir (`isUnitHead`)
  birinchi va kengaytirilgan kartochkada, qabul kunlari alohida ajratilgan.
- **Laboratoriya tavsiflari to'ldirildi** — VM qarorida belgilangan yo'nalishlardan olingan,
  har biri ustida `TODO: institut tasdiqlashi kerak` izohi (`packages/db/src/seed.ts`).
- Hamkorlar lentasi — tashqi kutubxonasiz, faqat CSS; hover'da to'xtaydi,
  `prefers-reduced-motion` da setka bo'ladi.
- **11-brend/404/huquqiy**, **12-til prefiksi**, **05-namoyish** — hammasi o'z kuchida.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig`, 5433).
  Bazada 3 ta yangilik, 17 tuzilma birligi, **0 xodim, 0 hamkor, 0 nashr**.

### Nima hali ishlamaydi / bajarilmagan
- **Yangi bo'limlar BO'SH** — bu ataylab. Xodimlar, rahbariyat va hamkorlar ro'yxati
  institutdan kelishi kerak. Kerakli ma'lumotlar ro'yxati: **`docs/kerakli-malumotlar.md`**.
- **Fayl yuklash yo'q** — xodim rasmi va hamkor logotipi hozir qo'lda URL sifatida kiritiladi
  (`public/images/partners/`). R2 orqali yuklash — CLAUDE.md 5-muammo, 07-topshiriq.
- **Migratsiyalar `2_add_news_source` va `3_add_employees_partners` production'ga qo'llanmagan.**
  Lokal bazada qo'llandi. **Deploy'dan OLDIN qo'llanishi shart**, aks holda
  `GET /api/news` va `GET /api/employees` 500 beradi.
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan** — `npm run demo`
  shuni o'qiydi (`docs/demo.md` 1-bo'lim).
- Haqiqiy 404 status kodi yo'q; sayt xaritasi yo'q; bu mashinada Node.js o'rnatilmagan.
- 03-production `wrangler login` dan keyin; 04-kontent production'ga qo'llanmagan.

### Keyingi qadam
1. 06 ni PM tekshirsin.
2. Foydalanuvchi `docs/kerakli-malumotlar.md` bo'yicha ma'lumot bersin — kelgach admin
   panel orqali kiritiladi, kodga tegilmaydi.
3. Navbat bo'yicha 07 (fayl yuklash va tahrirlagich) — xodim rasmi va hamkor logotipi
   uchun ham shu kerak.

### Ochiq savollar
- Laboratoriya tavsiflari institut tomonidan tasdiqlanadimi yoki o'z matni beriladimi?
- Namoyish lokal bazada o'tkaziladimi? Tavsiya: **ha**.

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 11 | Logotip, 404, huquqiy bandlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 06 | Xodimlar, laboratoriyalar, hamkorlar | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 07 | Fayl yuklash va tahrirlagich | ⏳ Navbatda |
| 08 | Xatoliklar jurnali | ⏸ Kutmoqda |
| 09 | Murojaatlar va Resend | ⏸ Kutmoqda |
| 10 | Qidiruv, imkoniyatlar, xavfsizlik | ⏸ Kutmoqda |

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

### 2026-08-26 · 06 — Laboratoriya sahifalari, xodimlar reyestri va hamkorlar

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(content): employee registry, lab pages and partners carousel`

**Baza.** `Employee` (uch tilda ism/lavozim/daraja/unvon/ilmiy yo'nalish/qabul vaqtlari, xizmat
telefoni va pochtasi, ORCID, Scopus, xona, `isManagement`, `isUnitHead`, `unitId`, `order`,
`isActive`) va `Partner`. `StructureUnit` ga teskari bog'lanish, `onDelete: SetNull` — bo'linma
o'chirilsa xodim o'chmaydi. Migratsiya `3_add_employees_partners` (qo'lda yozilgan SQL, `db push` emas).

**API.** `routes/employees.ts` (`GET /` `unitId` filtri va `includeInactive` bilan, `GET /:id`;
yozuv `requireAuth`), `routes/partners.ts`. Ochiq saytda faqat `isActive` yozuvlar. Hammasi
`zValidator` bilan. `index.ts` ga ulandi, `lib/api.ts` ga `employeesApi`/`partnersApi`.
CLAUDE.md 4-qoidasidagi ochiq endpointlar ro'yxati va 3-bo'limdagi tuzilma yangilandi.

**Sahifalar.** `/management` (rahbariyat, `order` bo'yicha, kengaytirilgan kartochkalar),
`/employees` (rahbariyat birinchi guruh, keyin laboratoriyalar, oxirida biriktirilmaganlar),
`/laboratories/:id` (nom, xodimlar soni, faoliyat yo'nalishi, mudir birinchi va kengaytirilgan
kartochkada). Uchalasi `PUBLIC_ROUTES` ga va `/:lang` ostiga qo'shildi, havolalar `LocalizedLink`.
Umumiy `EmployeeCard` (compact/extended), `EmptyState`, `lib/employee.ts` (uch tilli maydon,
bosh harflar, ORCID/Scopus havolalari). Menyuga "Rahbariyat" va "Xodimlar" qo'shildi.

**Hamkorlar lentasi.** `PartnersStrip` + `index.css` dagi `partner-scroll` keyframes.
Tashqi kutubxona YO'Q. Ro'yxat ikki marta chiziladi va lenta `-50%` ga siljiydi — shuning uchun
harakat uzluksiz. Hover/focus'da `animation-play-state: paused`. `prefers-reduced-motion` da
animatsiya o'chadi, `flex-wrap: wrap` bilan setka bo'ladi va nusxalar `display:none`.

**Admin.** `/admin/employees` (jadval, modal forma, til tablari, laboratoriyaga biriktirish,
tartib, `isActive` toggle — ishdan ketgan xodim o'chirilmaydi) va `/admin/partners`.
Telefon/pochta maydonlari yonida **shaxsiy ma'lumotlar ogohlantirishi**: faqat xizmat
raqami/pochtasi, xodimning roziligi kerak. Hamkorlar sahifasida logotip savdo belgisi ekani
haqida ogohlantirish. `AdminLayout` menyusiga ikkalasi qo'shildi.

**Laboratoriya tavsiflari.** 6 ta laboratoriya uchun 2–3 jumlali tavsif, uch tilda.
**O'ylab topilmagan** — har biri VM qarorida belgilangan yo'nalishlardan
(`docs/tasks/04-kontent.md`, 3-bo'lim) olib yozilgan; aniq loyiha, natija, grant va sana yo'q.
Kodda `TODO: institut tasdiqlashi kerak` izohi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api + web) toza, `npm run build` toza. Migratsiya lokal bazaga `migrate deploy`,
  `prisma generate` qayta ishga tushirildi, seed bilan tavsiflar yozildi.
- `GET /api/employees` va `GET /api/partners` — 200; `POST` auth'siz — **401** (ikkalasi ham).
- i18n kalit parity skript bilan tekshirildi: uchala faylda **165 tadan**, farq yo'q.
- **Brauzerda (headless Chromium, lokal baza):**
  - 3 ta yangi sahifa × 3 til: h1 mos tilda, ko'rinib qolgan tarjima kaliti yo'q, konsol xatosi yo'q.
  - Menyuda "Rahbariyat" va "Xodimlar" uchala tilda.
  - LabsPage'dagi 6 kartochka `/uz/laboratories/<id>` ga olib bordi; batafsil sahifada tavsif
    ko'rindi; ruschaga o'tilganda sahifada qolib, tavsif ruschaga o'zgardi.
  - **Admin'da xodim qo'shish boshidan oxirigacha:** login → `/admin/employees` → forma
    (3 tilda ism/lavozim, qabul kunlari, xizmat telefoni/pochtasi, xona, ORCID,
    laboratoriyaga biriktirish, `isUnitHead`) → saqlash → admin ro'yxatida → ochiq
    `/uz/laboratories/lab-renewable` sahifasida "Laboratoriya mudiri" belgisi bilan birinchi
    o'rinda, qabul kunlari ajratilgan blokda; `/uz/employees` da laboratoriya guruhi ostida;
    rasmsiz kartochkada bosh harflar doirasi. `isManagement` belgilangach `/management` da chiqdi.
  - **Bo'sh maydon tekshiruvi:** telefon va xona o'chirilgach, o'sha qatorlar umuman ko'rinmadi,
    chiziqcha yoki bo'sh joy qolmadi.
  - **Hamkorlar lentasi:** hamkor qo'shilgach bo'lim paydo bo'ldi, 2 ta `<img>` (ro'yxat ikki marta),
    `animationName = partner-scroll 40s`; hover'da `animationPlayState = paused`;
    `reducedMotion: reduce` kontekstida `animationName = none`, `flexWrap = wrap`, nusxa yashirilgan.
  - **Bo'sh ro'yxatda** bosh sahifada hamkorlar bo'limi umuman chizilmadi.
  - Mobil 375px: 4 sahifada gorizontal overflow 0px.
  - Sinov xodimi va sinov hamkori tekshiruvdan keyin bazadan o'chirildi (0 xodim, 0 hamkor).
- **Ikki marta sinov skriptining o'zida xato bo'ldi** (maydon indeksi va katta-kichik harf
  regexi) — ilovada emas; aniq selektor bilan qayta tekshirilgach hammasi to'g'ri chiqdi.

**Nima TEKSHIRILMADI:**
- Ko'p xodimli holat (10+ kartochka) — bazada hozircha ma'lumot yo'q, 1 ta sinov yozuvi bilan sinaldi.
- Fayl yuklash yo'q: rasm va logotip URL sifatida kiritiladi (07-topshiriq).
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Qarorlar va sabablari:**
- Soxta ism/tashkilot/logotip **qo'shilmadi** — barcha yangi bo'limlar bo'sh holatda chiqadi.
  Kerakli ma'lumotlar ro'yxati `docs/kerakli-malumotlar.md` da.
- Xodim `isActive = false` bo'lganda ochiq saytda ko'rinmaydi, admin panelda qoladi —
  ishdan ketgan xodim yozuvi o'chirilmasligi kerak.
- Lenta uzluksizligi CSS `translateX(-50%)` bilan: ro'yxat ikki marta chizilgani uchun
  yarim yo'lda boshlang'ich holat takrorlanadi, sakrash ko'rinmaydi.

---

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

> Bundan oldingi yozuvlar arxivga ko'chirildi: [`docs/journal-archive/2026-08.md`](journal-archive/2026-08.md)
