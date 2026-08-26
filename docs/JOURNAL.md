# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11, 06, 07 va 08 kommitlari lokal
(`origin/master` = `69b6548`).

### Nima ishlaydi
- **08-xatoliklar jurnali tugadi.** Server va brauzer xatolari bazaga yoziladi, barmoq izi
  bo'yicha guruhlanadi, `/admin/logs` da ko'riladi.
- **Guruhlash va throttle:** bir xil xato bitta yozuvga tushadi; bazaga daqiqasiga bitta
  yozish bajariladi, oradagi takrorlanishlar yo'qolmaydi — keyingi yozishda `count` ga
  qo'shiladi. 11 marta yuborilgan xato → 1 yozuv, `count = 11`, 2 ta baza amali.
- **`redact.ts` va 23 ta birlik sinovi** — loyihadagi **birinchi testlar** (vitest,
  `npm test --workspace=apps/api`). Parol, token, `Authorization`/`Cookie`, ulanish satri
  jurnalga tushmaydi; pochta `a***@iep.uz` shaklida niqoblanadi.
- **Halqa himoyasi:** jurnalga yozishning o'zi xato bersa faqat `console.error` chiqadi.
  5 ta yiqiladigan so'rovda 1 ta zaxira yozuv, stack overflow yo'q, jarayon tirik.
- **React xato chegarasi** uch joyda: `main.tsx` (eng tashqi), `PublicLayout` va
  `AdminLayout` ichida — sahifa yiqilsa sarlavha/menyu joyida qoladi. Admin paneldagi
  xato ochiq sahifalarni yiqitmaydi.
- **Brauzer xatolarini yig'ish:** `window.onerror`, `unhandledrejection`, `api.ts` da 5xx va
  tarmoq uzilishlari (4xx qayd etilmaydi). To'plamda 5 soniyada, sahifa yopilganda
  `sendBeacon`, seansda eng ko'p 20 ta.
- **`POST /api/logs/client`** ochiq, lekin IP bo'yicha daqiqasiga 10 ta (11-chisi 429).
- **Boshqaruv panelida** so'nggi 24 soatdagi hal qilinmagan xatolar soni, nol bo'lmasa qizil.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig` 5433 +
  miniflare R2). Bazada 3 yangilik, 1 media, 0 xato yozuvi.

### Nima hali ishlamaydi / bajarilmagan
- **R2 bucket production'da yaratilmagan** va **migratsiyalar 2–5 production'ga qo'llanmagan.**
  Deploy'dan OLDIN ikkalasi ham bajarilishi shart.
- **Throttle va rate limit izolyat xotirasida** — Workers'da har bir izolyat o'zinikini
  saqlaydi. Aniq kafolat uchun KV yoki Durable Object kerak (auth rate limit bilan bir xil
  cheklov, CLAUDE.md 5-jadval, 4-band).
- **Tozalash cron sozlanmagan** — `POST /api/logs/cleanup` va `POST /api/uploads/cleanup`
  hozircha qo'lda. Kodda `TODO` bor.
- **Testlar faqat `redact.ts` ni qamraydi**, CI yo'q (CLAUDE.md 10-muammo, qisman).
- **`npm audit` 19 ta zaiflik** — build vositalarining tranzitiv bog'liqliklari.
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan** (`docs/demo.md`).
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda
  (`docs/kerakli-malumotlar.md`).

### Keyingi qadam
1. 08 ni PM tekshirsin.
2. Navbat bo'yicha 09 (murojaatlar va Resend).
3. Production'ga chiqishdan oldin: R2 bucket + migratsiyalar 2–5.

### Ochiq savollar
- Throttle/rate limit uchun KV yoki Durable Object qachon ulanadi?
- Cron trigger (jurnal va fayl tozalash) qachon sozlanadi?

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
| 09 | Murojaatlar va Resend | ⏳ Navbatda |
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

### 2026-08-26 · 08 — Xatoliklarni qayd etish tizimi

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(observability): error logging with grouping and redaction`

**Baza.** `ErrorLog` modeli, `fingerprint` unikal indeks bilan, migratsiya `5_add_error_logs`.

**Server.** `lib/redact.ts` (maxfiy kalitlar, `Bearer`/JWT, ulanish satri, pochta niqoblash,
so'rov tanasi butunlay tushiriladi), `lib/error-log.ts` (FNV-1a barmoq izi, guruhlash,
throttle + kutayotgan hisoblagich, qator chegarasi, TTL tozalash), `routes/logs.ts`
(ro'yxat/filtr/sahifalash, bitta yozuv, PATCH, DELETE, ochiq `POST /client` rate limit bilan,
`POST /cleanup`). `index.ts` da `app.onError` — jurnalga yozish `waitUntil()` ichida, javob
kutmaydi. Alohida qayd etiladigan hodisalar: login rate limit (`RATE_LIMITED`), yaroqsiz
token (`INVALID_TOKEN`), sozlama yo'qligi (`CONFIG_MISSING`), R2 xatolari.

**Frontend.** `lib/client-logger.ts` (global tutuvchilar, 5 soniyalik to'plam, `sendBeacon`,
seansda 20 ta chegara, o'z endpointini qayd etmaydi), `components/ErrorBoundary.tsx`
(uchta joyda: `main.tsx`, `PublicLayout`, `AdminLayout`), `pages/admin/AdminLogsPage.tsx`
(filtrlar, ochiladigan tafsilot, hal qilingan belgisi, izoh, tozalash), boshqaruv panelida
24 soatlik hal qilinmagan xatolar ko'rsatkichi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api + web), `npm run build`, `wrangler deploy --dry-run` — toza.
  i18n: uchala faylda 263 tadan kalit, farq yo'q.
- **Birlik sinovlari: 23/23 o'tdi** (`redact.test.ts`). Sinovlar yozilgan zahoti **haqiqiy
  xato topdi**: `DATABASE_URL` kaliti maxfiy deb tanilmayotgan edi, chunki kalit nomini
  normallashtirish ikki joyda har xil edi (biri `_` ni olib tashlardi, ikkinchisi yo'q).
- **Guruhlash (curl):** bir xil xato 10 marta → 1 yozuv, `count = 1` (throttle);
  61 soniyadan keyin 11-chi yuborishda `count = 11` — ya'ni bazaga 2 ta yozish amali
  bajarildi, lekin takrorlanishlar yo'qolmadi.
- **Rate limit:** 12 ta so'rovdan 9 tasi 202, qolgani **429**.
- **Maxfiy ma'lumot:** parol, JWT, ulanish satri va foydalanuvchi nomi bilan xato
  yuborildi → jurnalda `SuperMaxfiy123`, `SIGNATURE`, `DbParol`, `neondb_owner`,
  `eyJhbGciOiJIUzI1NiJ9` **yo'q**; pochta `a***@iep.uz` shaklida; to'liq pochta yo'q.
- **Halqa himoyasi:** baza mavjud bo'lmagan holatda 5 ta yiqiladigan so'rov →
  `[error-log] recordError` faqat **1 marta**, stack overflow yo'q, server javob beryapti.
- **Brauzerda:** `window.onerror` va `unhandledrejection` orqali tashlangan xatolar
  `/admin/logs` da ko'rindi; manba filtri ishladi; hal qilingan deb belgilash va izoh
  saqlandi; boshqaruv panelida ko'rsatkich chiqdi.
- **Xato chegarasi:** `/api/news` javobi buzilgan holatda sahifa **oq qolmadi** —
  o'zbekcha xato sahifasi, yangilash tugmasi va hodisa raqami chiqdi, **sarlavha va footer
  joyida qoldi**; ingliz va rus tillarida ham tarjima qilingan; admin paneldagi xato ochiq
  sahifani yiqitmadi.

**Nima TEKSHIRILMADI:**
- Throttle/rate limitning bir nechta Workers izolyati orasidagi xatti-harakati (lokal
  harness bitta jarayon).
- TTL tozalash (30/90 kun) haqiqiy muddat bilan — mantiq o'qib chiqildi, `cleanup`
  endpointi ishga tushirildi va 0 qaytardi.
- 5000 qatorlik chegaradan oshganda eski yozuvlarning o'chirilishi.
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Qarorlar va sabablari:**
- **Throttle + kutayotgan hisoblagich.** Topshiriqda ikkita talab bor edi: "10 marta
  takrorlanganda `count` 10 ga teng" va "bir daqiqada bitta yozish". Ular faqat shu yo'l
  bilan birga bajariladi: takrorlanish xotirada to'planadi va keyingi ruxsat etilgan
  yozishda `count` ga qo'shiladi. Aks holda yo baza urib ketardi, yo hisob yo'qolardi.
- **Barmoq izida raqamlar va identifikatorlar `#` ga almashtiriladi** — aks holda
  `id=abc` va `id=xyz` alohida yozuvlarga bo'linib ketardi.
- **Xato chegarasi layout ICHIDA.** Avval marshrut darajasida edi va xato chiqqanda
  sarlavha ham yo'qolardi; endi faqat sahifa qismi almashadi, foydalanuvchi boshqa
  bo'limga o'ta oladi.
- **`sendBeacon` faqat sahifa yopilayotganda** — oddiy holatda `fetch` ishlatiladi,
  chunki `sendBeacon` javobni ko'rsatmaydi va rate limit natijasini bilib bo'lmaydi.

---

### 2026-08-26 · 07 — Fayl yuklash, matn tahrirlagich va moderator qulayligi

**Kim:** Claude Code (Opus 5) · **Kommit:** `feat(admin): file uploads, rich text editor and Uzbek feedback messages`

**Server.** `lib/storage.ts` (R2 binding, fail closed, kalit `YYYY/MM/<uuid>.<ext>` — asl nomga
bog'liq emas), `lib/file-types.ts` (**magic bayt**: JPEG/PNG/WebP/PDF/ZIP/OLE; SVG ataylab yo'q),
`lib/errors.ts` (`{error:{code,message,meta}}`), `lib/sanitize.ts` (`xss` allowlist),
`lib/media.ts` (matndan kalit ajratish, egaga biriktirish, eskisini o'chirish).
Marshrutlar: `uploads`, `files`, `documents`. `news` marshruti sanitizatsiya va fayl hayot
sikliga ulandi. Migratsiya `4_add_media_documents` (`media_files`, `documents`, `news.isPublished`).

**Frontend.** `Toast` (muvaffaqiyat 4 s, xato yopilguncha + kod), `api-error.ts` (`ClientError`
bilan mijoz xatolari ham bir xil shaklga keladi), `image-prepare.ts` (canvas → WebP 0.85),
`FileUploadField`, `RichTextEditor` (+`Inner`, lazy), `LangTabs`, `slug.ts`, `useUnsavedWarning`,
`lib/sanitize.ts` (DOMPurify). `AdminNewsPage` to'liq qayta qurildi; `Employees`, `Partners`,
`Publications` sahifalariga yuklash va toast qo'shildi; `AdminDocumentsPage` va ochiq
`DocumentsPage` yozildi.

**Lokal sinov muhiti haqida.** `wrangler dev` ning o'zini ishlatib bo'lmadi: uning ostida API
bazaga `PrismaNeonHTTP` orqali ulanadi, ya'ni **production Neon'ga yozish** degani, bu esa
topshiriq chegarasiga zid. Shuning uchun harness'ga `wrangler dev` ishlatadigan AYNAN SHU
dvigatel — **miniflare R2 bucket** ulandi (baza lokal Postgres bo'lib qoldi). Qo'shimcha
ravishda `wrangler deploy --dry-run` bilan haqiqiy Workers bundle'i yig'ilishi tasdiqlandi
(R2 binding ko'rinmoqda). Harness `node_modules/.iep-harness/` da, repoga kirmaydi.

**Nima tekshirildi va qanday:**
- `tsc --noEmit` (api + web) toza, `npm run build` toza, `wrangler deploy --dry-run` toza.
  i18n: uchala faylda 230 tadan kalit, farq yo'q. Tahrirlagich alohida chunk (`RichTextEditorInner`).
- **API (curl):** auth'siz yuklash 401; haqiqiy PNG/PDF 201; **kengaytmasi `.jpg` ga
  o'zgartirilgan haqiqiy Windows PE (`MZ`) fayli → `UNSUPPORTED_TYPE`**; SVG (`.png` nomi
  bilan) → `UNSUPPORTED_TYPE`; bo'sh fayl → `EMPTY_FILE`; 6 MB → `FILE_TOO_LARGE`;
  PDF ni `kind=image` bilan → rad; R2 binding o'chirilganda yuklash ham, fayl berish ham
  **503 `STORAGE_UNAVAILABLE`**; `/api/files/../../etc/passwd` → 404 (kalit naqshi tekshiriladi);
  `Cache-Control: immutable` va `X-Content-Type-Options: nosniff` mavjud.
- **Sanitizatsiya (curl):** `<script>`, `onerror`, `<iframe>`, `javascript:`, tashqi `img`,
  `<style>`, `onclick` — hammasi olib tashlandi; `/api/files/` dagi rasm saqlandi.
- **Fayl hayot sikli (API, aniq):** A rasmli yangilik → B ga almashtirildi → A **404**,
  B 200; yangilik o'chirildi → B ham ombordan o'chdi.
- **Brauzerda uchidan uchiga:** login → yangilik yaratish → slug avtomatik
  (`O'zbekiston energetikasi: g'oyalar` → `ozbekiston-energetikasi-goyalar-va-yonalishlar`) →
  sana bugun → Word'dan nusxa (`MsoNormal`, `mso-`, `style`, `class`, `<script>`, `<o:p>` —
  hammasi tozalandi) → **rasm Cmd+V bilan** matnga qo'yildi, "2400 → 1920 nuqta, 53 KB → 5 KB"
  xabari chiqdi, R2 ga `.webp` yozildi → saqlandi → ochiq sahifada rasm ko'rindi →
  tahrirlashda rasm **almashtirildi va eski fayl R2 dan o'chdi (404)** → matndan rasm olib
  tashlanib saqlandi, ombor **0 ta faylga** tushdi → yangilik o'chirildi, fayllar ham o'chdi.
- **Brauzerda xato xabarlari:** `.exe` va SVG uchun "Bu turdagi fayl qabul qilinmaydi.
  Ruxsat etilgan formatlar: JPEG, PNG, WebP." + yonida `UNSUPPORTED_TYPE` kodi.
- **Qoralama:** admin ro'yxatida belgi bilan ko'rinadi; ochiq ro'yxatda yo'q; to'g'ridan-to'g'ri
  manzil bo'yicha ochiq API **404**, admin `?drafts=true` bilan 200.
- **Hujjatlar:** admin orqali PDF yuklandi va saqlandi, uchala tilda `/documents` da yuklab
  olish havolasi bilan ko'rindi; mobil 375 px da overflow 0.
- Sinov yozuvlari va fayllari oxirida tozalandi (0 media, 0 hujjat).

**Yo'l-yo'lakay topilgan va tuzatilgan ikkita HAQIQIY xato:**
1. **Tahrirlashda kontent umuman yuklanmasdi.** Ro'yxat endpointi `content` maydonlarini
   qaytarmaydi (ular og'ir), lekin `openEdit` shakl qiymatlarini o'sha ro'yxat yozuvidan
   olardi — tahrirlagich bo'sh ochilardi va moderator matn yozsa eski kontent yo'qolardi.
   Endi tahrirlashda to'liq yozuv `GET /api/news/:slug?drafts=true` bilan olinadi.
2. **Rasm bo'lmagan fayl `SERVER_ERROR` berardi.** Brauzer `.exe` ni rasm sifatida ocholmay
   oddiy `Error` tashlardi va moderator "Serverda xatolik" degan noaniq xabarni ko'rardi.
   `ClientError` sinfi qo'shildi: mijoz tomonidagi xatolar ham API xatolari bilan bir xil
   kodga (`UNSUPPORTED_TYPE`) va o'zbekcha matnga o'giriladi.

**Nima TEKSHIRILMADI:**
- Haqiqiy Cloudflare R2 (production bucket hali yaratilmagan) — miniflare taqlidida sinaldi.
- Egasiz fayllarni tozalash 24 soatlik muddat bilan (vaqt kutish kerak); endpoint mantiqi
  o'qib chiqildi, lekin haqiqiy muddat bo'yicha sinov qilinmadi.
- DOCX/XLSX yuklash (ZIP imzosi kodda bor, haqiqiy fayl bilan sinalmadi).
- Production'ga hech narsa yozilmadi va deploy qilinmadi.

**Qarorlar va sabablari:**
- Sanitizator sifatida `xss` (js-xss) tanlandi: sof JS, Node bog'liqligi yo'q, Workers'da
  ishlaydi (`sanitize-html` `postcss` tortadi, `DOMPurify` serverda `jsdom` talab qiladi).
- DOCX/XLSX ZIP konteyner bo'lgani uchun magic bayt ularni ajratmaydi; konteyner turi
  tasdiqlangach kengaytma faqat `docx`/`xlsx` ni farqlash uchun ishlatiladi — xavfsizlikka
  ta'sir qilmaydi.
- Tahrirlagichda rasm yuklanayotganda matnda vaqtinchalik joy egallovchi turadi va tugagach
  almashtiriladi; xato bo'lsa joy egallovchi olib tashlanadi.

---

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

> Bundan oldingi yozuvlar arxivga ko'chirildi: [`docs/journal-archive/2026-08.md`](journal-archive/2026-08.md)
