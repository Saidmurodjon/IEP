# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-25
**Branch:** `master` · **Push qilinganmi:** ✅ ha — `origin/master` = `cad0755` (6 kommit push qilindi 2026-08-25).
CI birinchi marta muvaffaqiyatsiz bo'ladi (secret'lar + baseline hali yo'q — `docs/deploy.md`).

### Nima ishlaydi
- **Lokal muhit to'liq ishlaydi:** `wrangler dev` (API :3000, haqiqiy Workers runtime) + `vite` (web :5173).
  Admin login lokalda ishlaydi: `admin@iep.uz` + `.env` dagi `ADMIN_PASSWORD`, Dashboard ochiladi.
- Auth: PBKDF2, JWT (alg tekshiruvi), rate limiting, `change-password` — hammasi lokalda tekshirilgan.
- **04-kontent (kod) tugadi:** tuzilma rasmiy 2025 hujjatiga ko'chirildi — 17 birlik, 6 lab (3,3,4,2,2,3),
  18 ilmiy / 29 umumiy xodim, barcha `head` null, Ilmiy kengash maslahat organi. Migratsiya + seed + frontend +
  i18n tayyor, LOKAL test bazada (`energetika_mig`) to'liq tekshirilgan (GET /api/structure, StructurePage, LabsPage).
- **02-dizayn tugadi:** akademik navy + oltin palitra, yengil seksiyalar, "Institut haqida"
  seksiyasi (3 tilda), stat ikonkalari, yangilik placeholder'lari.
  Hero va "Institut haqida" endi **haqiqiy public-domain fotolar** (AQSh DoE, Wikimedia Commons):
  `hero-solar.jpg`, `about-wind.jpg` — manba/litsenziya `public/images/CREDITS.md` da.
  `tsc` + `build` toza, mobil (375px) overflow yo'q, 3 til tekshirilgan.

### Nima hali ishlamaydi / bajarilmagan
- **Production hali eski kod bilan ishlayapti** (diagnostika bilan tasdiqlandi: login `min:6`,
  `change-password` 404). `wrangler deploy` qilinmagan.
- **Production login hozir buzuq holatda:** baza admini yangi PBKDF2 formatida (o'tgan sessiyada
  migratsiya qilingan), lekin production kod hali SHA-256 kutadi → mos emas. Deploy shuni hal qiladi.
- **Deploy bloklangan:** `wrangler` autentifikatsiya qilinmagan (`.env` da CF token ham placeholder).
  Foydalanuvchi `wrangler login` qilishi kerak.
- `FRONTEND_URL` production'da **allaqachon bor** (CORS orqali tasdiqlandi) — 03-ning shu qadami shart emas.

- **04-kontent production'ga qo'llanmagan:** migratsiya (staffCount, isAdvisory) + seed production Neon'ga
  yozilmagan. Rule 8 (DELETE) va production yozuv — foydalanuvchi tasdig'i kutilmoqda.
- **DIQQAT deploy tartibi:** yangi kod staffCount/isAdvisory ustunlarini kutadi. Migratsiya production'ga
  qo'llanmasa, deploy'dan keyin `GET /api/structure` 500 beradi. **Avval migratsiya, keyin deploy.**
- **Demo nashrlar hali production'da** (Mirzayev/Toshmatov mualliflari) — o'chirish production DELETE, tasdiq kerak.

### Keyingi qadam
1. 03-production 2-bosqichi: foydalanuvchi `wrangler login` qilgach → `wrangler secret list` →
   (seed ixtiyoriy, tavsiya: yo'q) → `wrangler deploy` → deploy'dan keyingi tekshiruvlar.
2. 03 tugagach keyingi topshiriqlar (fayl yuklash / R2, kontakt email, SEO).

### Ochiq savollar
- 03 2-bosqichda production bazasini qayta seed qilaymi? Tavsiya: **yo'q** (demo sozlamalar ustiga yozadi,
  admin allaqachon PBKDF2). Foydalanuvchi qaroriga havola.

## HOZIRDA KIM NIMA USTIDA ISHLAYAPTI

> Bir vaqtda bir nechta sessiya ishlaganda to'qnashuvni oldini olish uchun.
> Ish boshlashda o'zingizni qo'shing, tugaganda o'chiring.

| Sessiya | Topshiriq | Tegilayotgan fayllar | Boshlangan |
|---|---|---|---|
| — | — | — | — |

---

## YOZUVLAR

> Eng yangisi tepada. Har bir yozuv qisqa bo'lsin — nima qilindi, nima tekshirildi, nima qolib ketdi.

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
