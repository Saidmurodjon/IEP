# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05-topshiriq kommiti lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **05-namoyish tayyorligi tugadi.** Aloqa ma'lumotlari endi kodda emas — `/api/settings` dan
  keladi (`apps/web/src/hooks/useSettings.ts`, react-query, bitta so'rov). Header, Footer,
  ContactPage shu hookdan foydalanadi. `phone` bo'sh → telefon qatori umuman ko'rinmaydi.
- Seed'dagi manzil/pochta haqiqiy qiymatlarga almashtirildi (Do'rmon yo'li 40, energy@academy.uz);
  `phone` va `working_hours` ataylab bo'sh.
- Namoyish yangiliklari `packages/db/src/demo-content.ts` da (seed'dan ajratilgan, `npm run db:demo`).
  Skript lokal bo'lmagan `DATABASE_URL` bilan xato beradi — production'ga tushmasligi uchun.
- `npm run demo` — bitta buyruq: web build + `wrangler dev` (:3000) + `vite preview` (:5173).
- `docs/demo.md` — namoyish qo'llanmasi (tayyorgarlik, 7 qadamlik ~5 daqiqalik ssenariy, nosozliklar).
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig`, port 5433).
  Bazada 3 ta yangilik (3 tilda), 0 ta nashr, 17 birlik.

### Nima hali ishlamaydi / bajarilmagan
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan.** `npm run demo`
  API'ni `wrangler dev` da ishga tushiradi va u aynan shu faylni o'qiydi — ya'ni namoyish
  hozircha production bazasi ustida ishlaydi va admin panel orqali qo'shilgan har bir yozuv
  production'ga yoziladi. **Namoyishdan oldin lokal Postgres kerak.** `docs/demo.md` 1-bo'limida
  ogohlantirish bor. Bu foydalanuvchi zimmasidagi qadam.
- Bu mashinada Node.js o'rnatilmagan (`node`/`npm` PATH da yo'q). Tekshiruvlar vaqtinchalik
  scratchpad'ga yuklangan Node bilan bajarildi. Foydalanuvchi Node o'rnatishi kerak.
- Production hali eski kod bilan ishlayapti; 03-production `wrangler login` dan keyin.
- 04-kontent production'ga qo'llanmagan (migratsiya + seed).
- Demo nashrlar hali production'da.

### Keyingi qadam
1. 05 ni foydalanuvchi qabul qilsin (namoyish ssenariysini `docs/demo.md` bo'yicha o'zi bir marta o'tsin).
2. Navbat bo'yicha 12 (til prefiksi).
3. 03-production alohida — `wrangler login` dan keyin.

### Ochiq savollar
- Namoyish uchun lokal Postgres o'rnatiladimi, yoki namoyish production bazasi ustida
  o'tkaziladimi? Tavsiya: **lokal** (05-topshiriq chegarasi shuni talab qiladi).

### TOPSHIRIQLAR NAVBATI

Tartib qat'iy. Oldingisi qabul qilinmaguncha keyingisiga o'tilmaydi.
Har bir topshiriq tugagach PM sessiyasi tekshiradi.

| № | Topshiriq | Holat |
|---|---|---|
| 05 | Namoyishga tayyorlash | ✅ Bajarildi (PM tekshiruvi kutilmoqda) |
| 12 | Til prefiksi | ⏳ Navbatda |
| 11 | Logotip, 404, huquqiy bandlar | ⏸ Kutmoqda |
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

### 2026-08-25 · 03-production 1-bosqich (diagnostika) — TO'XTATILDI

**Kim:** Claude Code (Opus 5) · Yozuvsiz (faqat o'qish + bloklangan)

- `wrangler whoami` → autentifikatsiya yo'q; `.env` da CF token placeholder → secret list / seed / deploy
  bajarib bo'lmaydi. Foydalanuvchi `wrangler login` qilishi kerak.
- Live API: `GET /` va barcha ochiq GET → 200. Login (`admin@energetika.uz`/`Admin123!`) → 401.
- **Production'da eski kod:** login validatsiya `min:6` (yangi 8), `change-password` → 404. Deploy qilinmagan.
- `wrangler deploy --dry-run` (01-ning tekshirilmagan mezoni) → ✅ bundle yig'iladi (macOS arm64).
- **`FRONTEND_URL` production'da allaqachon bor** (CORS `pages.dev` origin'iga to'g'ri javob).
- Baza faqat o'qildi: admin `admin@iep.uz` + PBKDF2; seed 2-bosqichda 9 ta sozlama ustiga yozadi +
  1 demo yangilik qo'shadi → shuning uchun seed'ni o'tkazib yuborish tavsiya qilindi.
- **1-bosqich hisoboti berildi, 2-bosqich (deploy) foydalanuvchi tasdig'i + `wrangler login` kutmoqda.**

---

### 2026-08-25 · PM tekshiruvi — 01-topshiriq qabul qilindi

**Kim:** Cowork sessiyasi (PM roli)

Qabul mezonlari bo'yicha tekshirildi:

| Tekshiruv | Natija |
|---|---|
| `tsc --noEmit` (api + web) | ✅ toza |
| `grep dev-secret` | ✅ qoldiq yo'q |
| `grep bcrypt` | ✅ faqat izohda eslatma |
| PBKDF2 format, salt, iteratsiya | ✅ `pbkdf2$sha256$210000$...`, 16 bayt salt |
| Noto'g'ri parol / bcrypt hash / buzuq format | ✅ rad etiladi, throw qilmaydi |
| Dummy hash (enumeration himoyasi) | ✅ hech qanday parolni qabul qilmaydi |
| JWT: buzilgan imzo, boshqa secret, muddat | ✅ rad etiladi |
| JWT `alg=none` hujumi | ✅ bloklanadi |
| Seed'da hard-code parol | ✅ yo'q, `ADMIN_PASSWORD` majburiy |

Kriptografiya testi alohida yozilib ishga tushirildi: **16/16 pass**.

**Tekshirilmagan:** `wrangler deploy --dry-run` — sandbox Linux, `workerd` binari macOS uchun o'rnatilgan.
Buni Mac'da tasdiqlash kerak.

---

### 2026-08-25 · 01-admin-login bajarildi

**Kim:** Claude Code (Opus 5) · **Kommitlar:** `df8e7db`, `b6ed9b2`

`df8e7db` — `fix(auth): replace broken bcrypt check with PBKDF2 and remove JWT secret fallback`

- `packages/shared/src/password.ts` (yangi) — PBKDF2-HMAC-SHA256, 210 000 iteratsiya,
  16-baytli tasodifiy salt, timing-safe taqqoslash, `DUMMY_PASSWORD_HASH`.
  Format: `pbkdf2$sha256$<iter>$<saltB64>$<hashB64>`.
- `apps/api/src/lib/env.ts` (yangi) — `getJwtSecret()`, `ConfigError`. Secret yo'q yoki
  32 belgidan qisqa bo'lsa `throw`. Default qiymat **yo'q**.
- `apps/api/src/routes/auth.ts` — login qayta yozildi: enumeration himoyasi (dummy hash),
  rate limiting (`Map`, 15 daq / 5 urinish), `change-password` endpoint'i qo'shildi.
- `apps/api/src/lib/jwt.ts` — UTF-8 xavfsiz base64url, `alg` tekshiruvi (alg confusion himoyasi).
- `apps/api/src/middleware/auth.ts` — `verifyToken` ga o'tkazildi; `next()` ataylab `try` dan
  tashqarida (keyingi handler xatosi 401 ga aylanmasligi uchun); config xatosi → 500.
- `packages/db/src/seed.ts` — `ADMIN_PASSWORD` majburiy, hard-code parol olib tashlandi.
- `apps/api/package.json` — `bcryptjs`, `jsonwebtoken` va ularning tiplari olib tashlandi.

`b6ed9b2` — `fix(api,web): make local development actually run`

Spetsifikatsiyada yo'q edi, lokal ishga tushirishda topildi:

- **`apps/api/src/lib/db.ts` — production'ni yiqitadigan xato.** `PrismaNeon` WebSocket `Pool`
  uchun `PoolConfig` kutadi, kod esa unga HTTP drayverini (`neon()`) uzatardi →
  "No database host or connection string was set". Hozirgi Worker eski bundle bilan
  ishlagani uchun sayt tirik edi, lekin **keyingi deploy API'ni sindirar edi**.
  `PrismaNeonHTTP(databaseUrl, {})` ga o'tkazildi, haqiqiy Neon bilan `wrangler dev` ostida
  tekshirildi (news/publications/structure/settings → 200).
- `apps/web/vite.config.ts` — `envDir` ildizga yo'naltirildi (`.env` loyiha ildizida, Vite esa
  faqat `apps/web/` dan qidirardi → `VITE_API_URL` hech qachon o'qilmasdi).
- `apps/web/src/lib/api.ts` — `VITE_API_URL` fallback'i `'/api'` dan `''` ga (chaqiruvlar
  allaqachon `/api/...` bilan boshlanadi → `/api/api/news` 404 bo'lardi).
- `.gitignore` — `.dev.vars` qo'shildi.

---

### 2026-08-25 · Loyiha tahlili va qoidalar

**Kim:** Cowork sessiyasi (PM roli)

- Loyiha holati tahlil qilindi (live API probing + GitHub manbasi).
- Topilgan asosiy muammo: admin panel to'liq yozilgan, lekin login **hech qachon ishlamagan** —
  seed bcrypt yozadi, `auth.ts` bcrypt'ni tekshira olmay shartsiz `false` qaytaradi.
- `CLAUDE.md` yozildi — loyiha qoidalari, ma'lum muammolar jadvali, majburiy tekshiruv ro'yxati.
- `docs/tasks/01-admin-login.md` — login tuzatish spetsifikatsiyasi (13 ta qabul mezoni).
- `docs/tasks/02-dizayn.md` — rang palitrasi (akademik navy + oltin) va rasmlar spetsifikatsiyasi.
- Claude Code CLI Mac'ga o'rnatildi (v2.1.245).

**Qaror:** parol hashlash uchun PBKDF2 tanlandi (bcryptjs Workers'da sekin va bundle'ni kattalashtiradi).
**Qaror:** rang yo'nalishi — akademik navy `#1a3a5f` + oltin `#c8973f`; rasmlar hozircha SVG placeholder.
