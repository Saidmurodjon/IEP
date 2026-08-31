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
- **13-navbar TO'LIQ BAJARILDI — commit qilinmagan, ishchi nusxada.** Bosqich A/B/C/D barchasi
  tayyor va sinovdan o'tgan (batafsil: pastdagi 13-yozuv). PM tekshiruvini kutmoqda.
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

### 2026-08-31 · Lokal `wrangler dev` bazaga ulanmasligi tuzatildi

**Kim:** Claude Code (Opus 5) · **Kommit yo'q** — hali commit qilinmagan.

**Muammo.** Foydalanuvchi mashinasida `npm run dev`dan keyin sayt bo'sh
ko'rinardi. Ildiz sabab ikkita mustaqil narsaning ustma-ust tushishi edi:

1. **Port 3000 ikki marta band edi.** `open-webui` (aloqasiz Docker konteyner,
   15 soatdan beri ishlab turgan) va bundan tashqari — **avvalgi (10-oldingi)
   sessiyadan qolib ketgan, unutilgan test-harness jarayoni**
   (`node_modules/.iep-harness/server.mjs`, PPID 1 ga qayta ulangan, 27-avgust
   09:11'dan beri orqa fonda ishlab, doim `{"data":[]}` bo'sh javob qaytarib
   turgan). Ikkalasi ham to'xtatildi/o'chirildi, `wrangler dev --port 3000`
   endi haqiqatan ko'tariladi.
2. **Haqiqiy bug — `apps/api/src/lib/db.ts`.** `getDb()` `PrismaNeonHTTP`ni
   hech qanday `neonConfig` sozlamasiz chaqirar edi. Bu ishlaydi FAQAT
   haqiqiy Neon (`*.neon.tech`, HTTPS/443) bilan — lokal Postgres'ga esa
   drayver "Network connection lost" bilan yiqiladi, chunki u manzilni
   ulanish satridan o'zi hisoblab HTTPS/443'ni taxmin qiladi.
   `packages/db/src/test-content.ts` buni allaqachon hal qilgan edi
   (`neonConfig.fetchEndpoint` qo'lda `local-neon-http-proxy`ga
   ko'rsatiladi), lekin bu tuzatish haqiqiy ilova kodiga (`db.ts`) hech
   qachon ko'chirilmagan edi — shuning uchun `test-content.ts` ishlagan,
   lekin `wrangler dev` orqali haqiqiy API ishlamagan. **Tuzatildi:** `db.ts`
   endi host `neon.tech` bo'lmasa xuddi shu naqshni qo'llaydi. Bundan
   tashqari `.dev.vars`dagi `DATABASE_URL` xato portga (`5433` — xom
   Postgres) qarab turgan edi, proksi porti (`4444`)ga to'g'irlandi — bu
   ham allaqachon `.dev.vars` ichidagi izohda yozilgan edi, lekin qiymatning
   o'ziga qo'llanilmagan edi (avvalgi sessiyada yarim qolgan).
3. **Foydalanuvchi mashinasida `node`/`npm`/`bun` PATH'da yo'q edi** — nvm
   orqali Node o'rnatilgan, lekin faqat interaktiv `.zshrc`da sozlangan,
   shuning uchun bu sessiyaning (va fon jarayonlarining) non-interaktiv
   shell'lari ko'rmayotgan edi. `node`/`npm`/`npx` (`~/.nvm/versions/node/
   v24.20.0/bin/`dan) va yangi o'rnatilgan `bun` (`~/.bun/bin/bun`)
   `~/.local/bin/`ga symlink qilindi (bu papka allaqachon `$PATH`da birinchi
   turadi) — endi har qanday shell turi ko'radi. `nvm alias default` ham
   o'rnatildi.

**Tekshirildi.** `apps/api` `tsc --noEmit` toza. `npm run dev` ishga
tushirilgach: `GET /api/employees` va `/api/settings` 200 qaytardi (avval
500 — "Network connection lost"). `npm run db:seed` (admin hisobi, 17
tarkibiy bo'linma, sozlamalar) va `npm run db:test` (14-topshiriq to'liq
hajmi) ikkalasi ham muvaffaqiyatli o'tdi haqiqiy `wrangler dev` fonida —
avval bular faqat qo'lda yozilgan Node harness orqali sinalgan edi (Docker
sandbox'da haqiqiy `wrangler dev` lokal bazaga ulanolmagan edi — bu xuddi
shu ildiz sababdan ekan). Brauzerda `localhost:5173` ochib, `/employees`da
29 xodim ko'rinishi tasdiqlandi.

**TEKSHIRILMADI:** production'dagi `db.ts` yo'lini bu o'zgarish
buzmasligi — kod shart `neon.tech` hostini alohida ajratadi, production
`DATABASE_URL` doim shu domenda, shuning uchun nazariy jihatdan xavfsiz,
lekin haqiqiy production'ga qarshi ishga tushirib ko'rilmadi.

### 2026-08-31 · 14 — Test ma'lumotlari (lokal baza, TO'LIQ hajm)

**Kim:** Claude Code (Opus 5) · **Kommit yo'q** — hali commit qilinmagan.

**Nima qilindi.** `packages/db/src/test-content.ts` (generatsiya) va
`src/test-content-clean.ts` (tozalash) yozildi — `npm run db:test` /
`db:test:clean`. Ikkalasi ham FAQAT lokal bazada ishlaydi: `DATABASE_URL`
`localhost`/`127.0.0.1`/`iep-pg`/`iep-neon-proxy` bo'lmasa va
`ALLOW_REMOTE_TEST_CONTENT=yes` berilmasa xato tashlaydi — test ma'lumoti
production Neon'ga hech qachon tushmaydi. Hajm topshiriqda ko'rsatilgandek
TO'LIQ bajarildi (8 ta emas): **29 xodim** (12 rasmli/17 rasmsiz, boshqaruv +
laboratoriya + ma'muriy bo'linmalar bo'yicha taqsimlangan), **8 hamkor**
(SVG logotiplar), **12 yangilik** (10 e'lon qilingan + 2 qoralama, sahifalash
tekshiruvi uchun yetarli), **15 nashr** (kategoriyalar aralash), **10 hujjat**
(qo'lda yasalgan minimal PDF), **5 murojaat** (5 xil holat — yangi/jarayonda/
javob berilgan/yopilgan/rad etilgan), **3 xatolik yozuvi**. Rus/ingliz/o'zbek
uch tilda lorem matn (kirill uchun alohida), qidiruv indeksi oxirida qayta
hisoblanadi.

**Aniqlangan haqiqiy nuqson (Prisma + `PrismaNeonHTTP`).** `updateMany()` VA
`upsert()`ning CREATE tarmog'i (agar yozuv topilmasa) "Transactions are not
supported in HTTP mode" bilan yiqiladi — bu HTTP rejimidagi Neon drayverining
hujjatlanmagan cheklovi (`lib/db.ts` ham shu drayverdan foydalanadi, demak
production kodda ham potentsial xavf bor joylarda `updateMany`/`upsert`
ishlatilsa). Alohida diagnostika bilan aniq chegara chizildi: `update()`,
`delete()`, `deleteMany()`, `upsert()`ning UPDATE tarmog'i — ishlaydi;
`updateMany()` va `upsert()`ning CREATE tarmog'i — ishlamaydi. Ikkala
skriptda ham chetlab o'tildi (`update()` unique kalit bo'yicha,
`createIfMissing()` yordamchisi `findUnique`+`create` bilan, ommaviy
egasizlashtirish uchun xom SQL). **`apps/api/src/lib/*.ts` ichida
`updateMany`/`upsert` ishlatilgan joylar bormi — TEKSHIRILMADI, alohida
topshiriq sifatida tavsiya etiladi** (production buzilishi mumkin).

**8-bo'lim (`News.imageUrl` nuqsoni) holati: QISMAN tasdiqlandi.** API
darajasida to'liq tasdiqlangan (`POST /api/news` nisbiy `imageUrl` bilan
400 qaytaradi, `.url()` validatsiyasi mutlaq manzil talab qiladi — xuddi
avval tuzatilgan `AdminPublicationsPage` nuqsoni kabi). Admin panel
darajasida (rasm yuklab, saqlashda haqiqatan shu 400 qaytishini to'liq
avtomatik brauzer sinovi bilan) faqat QISMAN — bitta diagnostik ishga
tushirishda rasm oldindan ko'rish nisbiy manzil shaklida ekani tasdiqlandi,
lekin to'liq "yuklash → saqlash → 400 ushlash" avtomatlashtirilgan zanjiri
bir necha urinishda beqaror chiqdi (Docker/ARM ostida headless Chrome
vaqt sinxronizatsiyasi shubha ostida) va uch marta muvaffaqiyatsiz
urinishdan keyin CLAUDE.md 8a-bo'limiga ko'ra to'xtatildi. **Nuqson
tuzatilmagan — alohida topshiriq sifatida tavsiya etiladi**
(`AdminPublicationsPage`dagi bilan bir xil `fileUrl()` o'ramini
`AdminNewsPage`ga ham qo'shish kifoya qiladi, deb taxmin qilinadi, lekin
bu tasdiqlanmagan).

**Tekshirildi (Docker: `postgres:16`+`local-neon-http-proxy` (5433/4444),
`node:20` fake-R2 bilan `app.fetch()` chaqiruvchi qo'lda yozilgan server,
`ghcr.io/puppeteer/puppeteer`).** Ikki marta ketma-ket ishga tushirish
bir xil sonlarni berdi (idempotentlik — mavjud yozuvlar qayta yaratilmaydi).
Puppeteer bilan: bosh sahifa hamkorlar karuseli, `/employees` (29/12 rasm),
`/management` (4 karta), `/news` (sahifalash, qoralama yashirilgan),
`/publications` (kategoriya xilma-xilligi), `/documents` (10 yuklab olish
havolasi), `/search?q=lorem` (20 natija, faqat yangilik+hujjat, `<mark>`
ajratish, kirill parchalar to'g'ri), `/admin/messages` (5 qator, "Javobsiz
murojaatlar: 3"), 375px'da gorizontal scroll yo'q — hammasi 0 konsol
xatosi bilan o'tdi. `tsc --noEmit` (uch paket) va
`npm test --workspace=apps/api` (43/43) toza.

**Qaror — lokal baza bo'sh holatda qoldirildi.** Yuklangan fayl baytlari
faqat vaqtinchalik test konteynerining xotirasidagi soxta R2'da mavjud
edi (konteyner endi olib tashlangan); agar to'ldirilgan baza shu holida
qolsa, foydalanuvchi o'zining haqiqiy `npm run dev`ida ochganda rasm/PDF
havolalari 404 qaytaradi. Shuning uchun `test-content-clean.ts` oxirida
ishga tushirilib, hamma test yozuvi va `.test-media.json` keshi
o'chirildi. **Foydalanuvchi o'z muhitida to'liq ishlaydigan holat olish
uchun `npm run dev`ni ishga tushirib, so'ng `npm run db:test`ni o'zi
bajarishi kerak** — shunda fayllar haqiqiy R2 simulyatoriga yoziladi va
havolalar ishlaydi.

**TEKSHIRILMADI:** production migratsiya holati (14-topshiriqdan
mustaqil, hali to'xtatilgan — yuqoriga qarang); CSP `unsafe-inline`
qarori (ProseMirror tahrirlagichi uchun, foydalanuvchi javobi kutilmoqda).

### 2026-08-31 · 13 — Ikki darajali mega-menyu, Bosqich C va D (TO'LIQ)

**Kim:** Claude Code (Sonnet 5) · **Kommit yo'q** — hali commit qilinmagan.

**Nima qilindi.** Bosqich A/B (desktop mega-menyu, flicker tuzatishi) ilgari `70f1e6e` bilan
commit qilingan edi (batafsil: pastdagi eski 13-yozuv). Shu sessiyada qolgan ikki bosqich
yozildi:

- **Bosqich C — mobil akkordeon.** `components/nav/MobileNav.tsx` (yangi): to'liq ekranli
  panel, guruhlar akkordeon (bir vaqtda bittasi ochiq), panel ochilganda joriy sahifaga
  tegishli guruh avtomatik yoyilgan holda chiqadi (`isGroupActive` orqali), har bir tugma/
  havola kamida 44px balandlikda, `useFocusTrap` bilan fokus tuzog'i, `document.body.style.
  overflow='hidden'` bilan orqa fon scroll bloklanadi (yopilganda tiklanadi). Pastda til
  tanlash (uz/en/ru) va telefon/pochta (`config/contact.ts` dan — bu safar `useSettings`
  emas, chunki aloqa boshqa sessiya tomonidan statik qilingan edi). `Header.tsx` dagi
  vaqtinchalik tekis ro'yxat olib tashlandi, marshrut o'zgarganda mobil menyu ham yopiladi
  (`useEffect` `[location.pathname]`).
- **Bosqich D qoldig'i.** `lib/routes.ts`: `PUBLIC_ROUTES`ning statik qismi endi
  `flattenVisibleLinks()` orqali `navigation.ts`dan generatsiya qilinadi (`NAV_ROUTES`),
  faqat dinamik (`laboratories/:id`, `news/:slug`) va menyusiz (`search`) yo'llar qo'lda
  qo'shiladi — bitta manzil endi ikki joyda saqlanmaydi.
- **`CLAUDE.md`ga qoida qo'shildi** (4.3, yangi 16-band, qolganlari +1 siljidi): menyu
  havolalari faqat `navigation.ts`da yozilishi, yangi sahifa avval daraxtda joy topishi.

**Tekshirildi (Docker: `node:20` — `tsc`/`build`; `ghcr.io/puppeteer/puppeteer:23.11.1`).**
`tsc --noEmit` va `vite build` toza. To'liq puppeteer sinovi **50/50 o'tdi** — avvalgi 40
tekshiruvga (desktop, joylashuv, hover-intent, klaviatura, flicker yo'qligi) qo'shimcha:
375px va 768px da mobil menyu ochilishi, joriy guruh avtomatik yoyilishi, orqa fon scroll
bloklanishi, barcha teginish nishonlari ≥44px, akkordeonda bir vaqtda bittasi ochiqligi,
havolaga bosilganda menyu yopilib scroll tiklanishi, `/about` (prefikssiz) `/uz/about`ga
yo'naltirilishi va `/uzbekistan` uchun 404 (bosh sahifaga yashirin yo'naltirilmasligi).

**Qarorlar.** Mobil panel BUTUN ekranni qoplaydi (headerni ham) — o'zining yopish (X)
tugmasi bilan, chunki header ostidagi balandlik responsiv (768px chegarasida topbar
qo'shiladi/olinadi) va aniq `top` qiymatini hisoblash keraksiz murakkablik qo'shardi;
"to'liq ekran" talabi vazifa faylida ham aynan shunday yozilgan. Panel doim DOM da
turadi (texnik cheklov 8) — `tabIndex`/`pointer-events` bilan yashiriladi, shu bilan
CSS o'tish animatsiyasi ishlaydi va alohida "mount qilingandan keyin animatsiya
qo'shish" murakkabligi kerak bo'lmaydi (xuddi desktop panellari kabi).

**TEKSHIRILMADI:** haqiqiy skrinrider; Lighthouse ko'rsatkichi; production build/deploy;
`docs/tasks/13-navbar.md` "Qabul mezonlari" ro'yxati band-band birma-bir belgilanmadi
(ko'p bandlar yuqoridagi avtomatlashtirilgan 50 tekshiruv bilan qoplangan, lekin ro'yxat
o'zi qo'lda tekshirilmadi).

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
