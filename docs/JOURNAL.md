# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05 va 12 kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **12-til prefiksi tugadi.** Ochiq manzillar endi `/uz/…`, `/en/…`, `/ru/…`. `/` foydalanuvchi
  tiliga qarab yo'naltiriladi (xotira → brauzer tili → uz). Prefikssiz manzil (`/news`)
  `/uz/news` ga o'tadi; noto'g'ri prefiks (`/xx/news`) va noma'lum manzil (`/uzbekistan`) — 404.
  Admin marshrutlari (`/admin/...`) o'zgarmadi.
- Til manzildan olinadi (`useCurrentLang`), `localStorage` faqat `/` ni yo'naltirish uchun.
  Til almashtirilganda foydalanuvchi joriy sahifada qoladi.
- **`LocalizedLink` / `LocalizedNavLink`** — ochiq qismdagi barcha ichki havolalar shular orqali.
  Yangi qoida: CLAUDE.md 4.3, 15-band. (Diqqat: 4.4 dagi qoidalar 15–18 → 16–19 ga surildi.)
- `SeoHead` — har bir ochiq sahifada `html lang`, `canonical`, uchta `hreflang` + `x-default`.
  Asosiy manzil `site_url` sozlamasidan (admin panelda tahrirlanadi), kodda emas.
- `src/lib/routes.ts` — `PUBLIC_ROUTES` ochiq sahifalarning yagona ro'yxati (sayt xaritasi uchun tayyorgarlik).
- **05-namoyish tayyorligi** ham o'z kuchida: aloqa ma'lumotlari `/api/settings` dan,
  `npm run demo`, `docs/demo.md`.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig`, port 5433).
  Bazada 3 ta yangilik (3 tilda), 0 ta nashr, 17 birlik.

### Nima hali ishlamaydi / bajarilmagan
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan.** `npm run demo`
  API'ni `wrangler dev` da ishga tushiradi va aynan shu faylni o'qiydi — namoyish hozircha
  production bazasi ustida ishlaydi. Namoyishdan oldin lokal Postgres kerak (`docs/demo.md` 1-bo'lim).
- Bu mashinada Node.js o'rnatilmagan (`node`/`npm` PATH da yo'q). Tekshiruvlar vaqtinchalik
  scratchpad'ga yuklangan Node 22 bilan bajarildi.
- **Server tomonida yo'naltirish yo'q.** `/` → `/uz` hozir SPA ichida bajariladi. Haqiqiy 302
  va prefikssiz manzillar uchun host darajasidagi qoida (Cloudflare Pages `_redirects`)
  SEO topshirig'ida qo'shilishi kerak.
- Sayt xaritasi (`sitemap.xml`) hali yo'q — faqat tayyorgarlik qilindi.
- Production hali eski kod bilan; 03-production `wrangler login` dan keyin.
- 04-kontent production'ga qo'llanmagan; demo nashrlar hali production'da.

### Keyingi qadam
1. 12 ni PM tekshirsin.
2. Navbat bo'yicha 11 (logotip, 404, huquqiy bandlar) — 404 sahifasining brend ko'rinishi
   shu yerda to'ldiriladi (hozir sodda variant bor).

### Ochiq savollar
- Namoyish lokal bazada o'tkaziladimi? Tavsiya: **ha**.
- `site_url` hozir `https://energetika-institute.pages.dev`. Domen (`iep.uz`) ulangach
  admin paneldan o'zgartiriladi.

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 11 | Logotip, 404, huquqiy bandlar | ⏳ Navbatda |
| 06 | Xodimlar, laboratoriyalar, hamkorlar | ⏸ Kutmoqda |
| 07 | Fayl yuklash va tahrirlagich | ⏸ Kutmoqda |
| 08 | Xatoliklar jurnali | ⏸ Kutmoqda |
| 09 | Murojaatlar va Resend | ⏸ Kutmoqda |
| 10 | Qidiruv, imkoniyatlar, xavfsizlik | ⏸ Kutmoqda |

03-production alohida turadi va `wrangler login` dan keyin bajariladi.

**Foydalanuvchi zimmasidagi ochiq masalalar.** 373-son qaror bo'yicha
yuriskonsult javobi. Logotipning vektor fayli. Xodimlar ma'lumoti va rasmlari.
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
