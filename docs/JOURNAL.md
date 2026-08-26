# JOURNAL.md — loyiha ish jurnali

Bu fayl **sessiyalar orasidagi xotira**. Kontekst siqilganda (compaction), yangi sessiya boshlanganda
yoki bir vaqtda bir nechta sessiya ishlaganda — umumiy holatni tez tushunish uchun shu fayl o'qiladi.

**Qoida:** har bir sessiya shu faylni o'qishdan boshlanadi va unga yozuv qo'shish bilan tugaydi.
Batafsil: `CLAUDE.md` 9-bo'lim.

---

## HOZIRGI HOLAT

> Bu blok **doim joriy** bo'lishi kerak — eskisi o'chiriladi, o'rniga yangisi yoziladi.

**Oxirgi yangilanish:** 2026-08-26
**Branch:** `master` · **Push qilinganmi:** ❌ yo'q — 05, 12, 11, 06 va 07 kommitlari lokal (`origin/master` = `69b6548`).

### Nima ishlaydi
- **07-kontent boshqaruvi tugadi.** Moderator endi dasturchisiz yangilik yozadi, matn ichiga
  rasm qo'yadi, hujjat va nashr fayllarini yuklaydi.
- **Fayl ombori:** R2 binding `MEDIA`, `POST /api/uploads` (magic bayt tekshiruvi, hajm ikki
  bosqichda, SVG rad etiladi), ochiq `GET /api/files/:key` uzoq keshli, `POST /api/uploads/cleanup`.
  Binding yo'q bo'lsa `503 STORAGE_UNAVAILABLE` (fail closed).
- **Fayl hayot sikli:** rasm almashtirilsa eski fayl R2 dan o'chadi; yozuv o'chirilsa unga
  tegishli barcha fayllar o'chadi; matndan rasm olib tashlansa ombor o'z-o'zidan tozalanadi.
  O'chirish faqat `media_files` da qayd etilgan kalitlar bo'yicha.
- **Sanitizatsiya (CLAUDE.md 7-qoida bajarildi):** serverda `xss` allowlist bilan saqlashdan
  oldin, frontendda DOMPurify bilan ko'rsatishdan oldin. `img` faqat `/api/files/` dan.
- **Tiptap tahrirlagich** (lazy chunk, 408 KB — ochiq sahifalarga tushmaydi): qalin/qiya, H2/H3,
  ro'yxatlar, havola, iqtibos, rasmni Cmd+V va sudrab tashlash, Word'dan nusxani tozalash.
- **Mijoz tomonida rasm tayyorlash:** 1920 px (xodim rasmi 800), WebP 0.85, foydalanuvchiga
  "2400 → 1920, 53 KB → 5 KB" xabari.
- **O'zbekcha xabarlar:** yagona `useToast()`, xato kodi API dan (`{error:{code}}`), matn
  `locales/*.json` dagi `errors.<KOD>` dan, kod xabar yonida ko'rsatiladi.
- **Moderator qulayliklari:** slug avtomatik (`o'`/`g'` apostrofsiz), til yorliqlari
  to'ldirilganlik belgisi bilan, "O'zbekchadan nusxa", tarjimasiz maydonlar bir marta,
  qoralama, sana sukut bo'yicha bugun, saqlanmagan o'zgarish ogohlantirishi.
- **Yangi bo'lim:** `Document` modeli, ochiq `/documents` va `/admin/documents`.
- **Lokal muhit:** vite dev :5173 + harness API :3000 (lokal Postgres `energetika_mig` 5433 +
  **miniflare R2**). Bazada 3 yangilik, 0 media, 0 hujjat, 0 xodim, 0 hamkor.

### Nima hali ishlamaydi / bajarilmagan
- **R2 bucket production'da yaratilmagan.** `wrangler r2 bucket create energetika-media`
  bajarilishi va deploy qilinishi kerak, aks holda yuklash 503 beradi.
- **Migratsiyalar 2, 3, 4 production'ga qo'llanmagan.** Lokal bazada qo'llandi.
  **Deploy'dan OLDIN qo'llanishi shart.**
- **Egasiz fayllarni tozalash cron sozlanmagan** — `POST /api/uploads/cleanup` hozircha qo'lda.
- **`npm audit` 19 ta zaiflik** (14 high, 1 critical) — hammasi mavjud build vositalarining
  tranzitiv bog'liqliklari (vite, wrangler, prisma, concurrently, miniflare/sharp), 07 da
  qo'shilgan paketlardan emas. Alohida topshiriq sifatida ko'rilishi kerak.
- **⚠️ `apps/api/.dev.vars` dagi `DATABASE_URL` production Neon'ga qaragan** (`docs/demo.md`).
- Haqiqiy 404 status kodi yo'q; sayt xaritasi yo'q; bu mashinada Node.js o'rnatilmagan.
- Xodimlar, hamkorlar va hujjatlar ro'yxati institutdan kutilmoqda (`docs/kerakli-malumotlar.md`).

### Keyingi qadam
1. 07 ni PM tekshirsin.
2. Navbat bo'yicha 08 (xatoliklar jurnali).
3. Production'ga chiqishdan oldin: R2 bucket + migratsiyalar 2–4.

### Ochiq savollar
- Egasiz fayllarni tozalash cron'i qachon sozlanadi (Cloudflare Cron Trigger)?
- Laboratoriya tavsiflari institut tomonidan tasdiqlanadimi?

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
| 08 | Xatoliklar jurnali | ⏳ Navbatda |
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

> Bundan oldingi yozuvlar arxivga ko'chirildi: [`docs/journal-archive/2026-08.md`](journal-archive/2026-08.md)
